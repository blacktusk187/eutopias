/*******************************
 * WebApp.gs (drop-in, no duplicate uiOrNull)
 *******************************/

// ---- 1) Auth token (must match Vercel SHEET_WEBAPP_TOKEN) ----
const DASH_TOKEN = '4b9c12e3a99b417e9aa0a38df39b2df2';

// ---- 2) JSON helpers ----
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
function ok(data) { return json(Object.assign({ ok: true }, data || {})); }
function err(msg) { return json({ ok: false, error: String(msg || 'Unknown error') }); }
function safeTok(x){ return String(x == null ? '' : x).trim(); }

// ---- 3) UI-safe alert (reuses your uiOrNull if present) ----

function uiOrNull() {
  try { return SpreadsheetApp.getUi(); } catch (e) { return null; }
}
function uiAlertSafe(message) {
  var ui = uiOrNull();
  if (ui) ui.alert(String(message)); else Logger.log('[ALERT] ' + String(message));
}


// ---- 4) Never let actions throw to the web layer ----
function safeRun(fn) {
  try {
    var res = fn();
    if (res && typeof res === 'object' && 'ok' in res) return res; // pass-through if your fn returns {ok:...}
    return { ok: true };
  } catch (e) {
    uiAlertSafe('Action failed: ' + e);
    return { ok: false, error: String(e) };
  }
}

// ---- 5) Actions ----
// Notes:
// - pullGSC_30d() is expected to exist already.
// - If pullGSC_30d() returns nothing, we still respond { ok: true, ran: 'pullGSC_30d' }.
function runAction(action) {
  switch (action) {
    case 'pullGSC':
      return safeRun(function () {
        var out = pullGSC_30d({ headless: true }); // ensure no UI in web app context
        return (out && typeof out === 'object') ? out : { ok: true, ran: 'pullGSC_30d' };
      });

    case 'refreshColors':
      return safeRun(function () {
        refreshColors({ headless: true });
        return { ok: true, ran: 'refreshColors' };
      });

    case 'addRows':
      return safeRun(function () {
        addEmptyRowsAllTabs({ headless: true });
        return { ok: true, ran: 'addEmptyRowsAllTabs' };
      });

    case 'rebuild':
      return safeRun(function () {
        buildSEODashboard({ headless: true });
        return { ok: true, ran: 'buildSEODashboard' };
      });

    default:
      return { ok: false, error: 'Unknown action' };
  }
}

// ---- 6) HTTP handlers ----
function doGet(e) {
  var token  = safeTok(e && e.parameter && e.parameter.token);
  var action = safeTok(e && e.parameter && e.parameter.action);

  // Optional debug (remove later)
  if (e && e.parameter && e.parameter.debug === '1') {
    return ok({
      debug: {
        hasToken: token.length > 0,
        tokenLen: token.length,
        hasAction: action.length > 0,
        action: action || null
      }
    });
  }

  if (token !== DASH_TOKEN) return err('Unauthorized');
  if (!action) return ok({ ping: true }); // sanity ping

  var result = runAction(action);
  return (result && result.ok) ? ok(result) : err((result && result.error) || 'Action failed');
}

function doPost(e) {
  try {
    var body = {};
    try {
      body = JSON.parse(e && e.postData && e.postData.contents ? e.postData.contents : '{}');
    } catch (parseErr) {
      return err('Invalid JSON body');
    }

    var token  = safeTok(body && body.token);
    var action = safeTok(body && body.action);

    if (token !== DASH_TOKEN) return err('Unauthorized');
    if (!action) return ok({ ping: true });

    var result = runAction(action);
    return (result && result.ok) ? ok(result) : err((result && result.error) || 'Action failed');
  } catch (ex) {
    return err(ex);
  }
}
