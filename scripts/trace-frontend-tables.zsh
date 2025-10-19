#!/usr/bin/env zsh
set -euo pipefail

# --- Config ---
: "${POSTGRES_URL:?Please export POSTGRES_URL to your Neon branch (e.g., payload-verify)}"
APP_START_CMD=${APP_START_CMD:-"pnpm dev"}      # override if needed (e.g., "pnpm dev" or "pnpm start")
LOG_DIR=${LOG_DIR:-"./.trace"}
LOG_FILE="$LOG_DIR/payload-sql.log"
BEFORE_CSV="$LOG_DIR/pgstats_before.csv"
AFTER_CSV="$LOG_DIR/pgstats_after.csv"
DELTA_CSV="$LOG_DIR/pgstats_delta.csv"

mkdir -p "$LOG_DIR"

sql_snapshot() {
  local outfile="$1"
  # NOTE: pg_stat_user_tables has seq_scan, idx_scan, seq_tup_read, idx_tup_fetch
  #       Use those instead of n_tup_returned (not present here).
  psql "$POSTGRES_URL" -At -F, <<'SQL' > "$outfile"
SELECT relname AS table,
       COALESCE(seq_scan,0) + COALESCE(idx_scan,0) AS reads,
       COALESCE(seq_tup_read,0) + COALESCE(idx_tup_fetch,0) AS tuples_read
FROM pg_stat_user_tables
ORDER BY relname;
SQL
}

parse_tables_from_logs() {
  # ripgrep preferred; fallback to grep
  if command -v rg >/dev/null 2>&1; then
    rg -No --pcre2 '(?i)\bfrom\s+"([a-zA-Z0-9_]+)"|\bjoin\s+"([a-zA-Z0-9_]+)"' "$LOG_FILE" 2>/dev/null \
    | sed -E 's/.*"(.*)".*/\1/' \
    | sort -u
  else
    grep -Eo '([Ff][Rr][Oo][Mm]|[Jj][Oo][Ii][Nn])\s+"[A-Za-z0-9_]+"' "$LOG_FILE" 2>/dev/null \
    | sed -E 's/.*"(.*)".*/\1/' \
    | sort -u
  fi
}

compute_delta() {
  # BEFORE_CSV and AFTER_CSV: "table,reads,tuples_read"
  # Join and subtract reads; keep only rows with positive deltas.
  join -t, -a1 -a2 -e0 -o auto -1 1 -2 1 <(sort -t, -k1,1 "$BEFORE_CSV") <(sort -t, -k1,1 "$AFTER_CSV") \
  | awk -F, '
    BEGIN { OFS=","; print "table,reads_before,reads_after,reads_delta,tuples_before,tuples_after,tuples_delta" }
    NR>1 {
      tbl=$1; rb=$2+0; tb=$3+0; ra=$4+0; ta=$5+0;
      rd=ra-rb; td=ta-tb;
      if (rd>0 || td>0) {
        print tbl, rb, ra, rd, tb, ta, td
      }
    }
  ' > "$DELTA_CSV" || true
}

echo "==> Taking BEFORE snapshot of pg_stat_user_tables"
sql_snapshot "$BEFORE_CSV"

echo "==> Starting app with SQL debug (logs → $LOG_FILE)"
# Start app in background with DEBUG=payload:db; tee logs (no stdbuf on macOS)
( DEBUG=payload:db ${=APP_START_CMD} 2>&1 | tee "$LOG_FILE" ) &
APP_PID=$!

echo "==> App PID: $APP_PID"
echo "==> Open your app and click around for ~30-60s to exercise pages/queries."
echo "==> Press ENTER to stop when done."
read -r _ || true

echo "==> Stopping app (PID $APP_PID)"
kill "$APP_PID" >/dev/null 2>&1 || true
sleep 2

echo "==> Taking AFTER snapshot of pg_stat_user_tables"
sql_snapshot "$AFTER_CSV"

echo "==> Computing deltas"
compute_delta

echo
echo "==================== RESULT: TABLES WITH READ DELTAS ===================="
if [ -s "$DELTA_CSV" ]; then
  column -t -s, "$DELTA_CSV" | sed '1s/.*/\x1b[1m&\x1b[0m/'
else
  echo "No read deltas detected. (Did you hit any pages?)"
fi

echo
echo "==================== TABLES SEEN IN PAYLOAD SQL LOGS ===================="
if [ -s "$LOG_FILE" ]; then
  parse_tables_from_logs | nl -w2 -s'. '
else
  echo "No logs captured (check app startup or DEBUG=payload:db)."
fi

echo
echo "Artifacts:"
echo "  BEFORE stats: $BEFORE_CSV"
echo "  AFTER stats:  $AFTER_CSV"
echo "  DELTA stats:  $DELTA_CSV"
echo "  SQL log:      $LOG_FILE"
