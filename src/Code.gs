/**
 * EUTOPIAS • SEO Maintenance Dashboard (Google Sheets)
 * ----------------------------------------------------
 * How to use:
 * 1) In Google Sheets: Extensions → Apps Script.
 * 2) Paste this entire file. File → Save.
 * 3) Run buildSEODashboard() once → authorize.
 * 4) Use the custom menu “SEO Dashboard” to add rows, refresh colors, or pull GSC data.
 *
 * Optional: Google Search Console (GSC) pull
 * - In Apps Script editor: Services (left sidebar) → + → enable "Search Console API" (Advanced Service).
 * - Also enable Google Cloud API: Click "Project Settings" gear → Google Cloud Project → open link →
 *   APIs & Services → Enable APIs → enable "Search Console API".
 * - Set your property URL below (e.g., https://www.eutopias.co).
 * - Then use Menu → SEO Dashboard → Pull GSC (last 30 days).
 */

const GSC_SITE_URL = 'https://www.eutopias.co'; // <— change if needed

/** Entry point: build all tabs, headers, formatting, validations */
function buildSEODashboard(opts) {
  var headless = opts && opts.headless === true;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename('SEO Maintenance Dashboard');

  const tabs = [
    { name: 'Summary', headers: summaryHeaders(), init: initSummary },
    { name: 'Crawl & Indexability', headers: crawlHeaders() },
    { name: 'Performance & CWV', headers: perfHeaders() },
    { name: 'On-Page SEO', headers: onpageHeaders() },
    { name: 'Structured Data', headers: schemaHeaders() },
    { name: 'Internal Linking & Authority', headers: linksHeaders() },
    { name: 'Analytics & Monitoring', headers: analyticsHeaders() },
  ];

  // Create / reset all sheets
  tabs.forEach(t => ensureSheet(ss, t.name, t.headers, t.init));

  // Named ranges to wire Summary formulas
  createNamedRanges(ss);

  // Conditional formats & validations
  applyGlobalValidations(ss);
  applyGlobalConditionalFormats(ss);

  // Pre-populate a few sample rows (optional, safe to delete later)
  seedExamples(ss);

  if (!headless) {
    var ui = (typeof uiOrNull === 'function') ? uiOrNull() : null;
    if (ui) ui.alert('SEO Maintenance Dashboard created. You can start logging items now.');
  } else {
    Logger.log('SEO Maintenance Dashboard created (headless).');
  }
  return { ok: true };
}

/** Custom menu */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SEO Dashboard')
    .addItem('Build / Rebuild Dashboard', 'buildSEODashboard')
    .addSeparator()
    .addItem('Add 10 Empty Rows (All Tabs)', 'addEmptyRowsAllTabs')
    .addItem('Refresh Color Coding', 'refreshColors')
    .addSeparator()
    .addItem('Pull GSC (last 30 days)', 'pullGSC_30d')
    .addToUi();
}

/** Adds 10 blank rows under the header in every tab */
function addEmptyRowsAllTabs(opts) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheets().forEach(sh => {
    if (sh.getMaxRows() < 100) sh.insertRowsAfter(sh.getMaxRows(), 100 - sh.getMaxRows());
    // Insert 10 rows after header
    sh.insertRows(2, 10);
  });
}

/** Re-applies conditional formatting and validations */
function refreshColors(opts) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  applyGlobalValidations(ss);
  applyGlobalConditionalFormats(ss);
  return { ok: true };
}

/* ----------------------------
 * Sheet setup helpers
 * ---------------------------- */

function ensureSheet(ss, name, headers, initFn) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  // Reset contents (keep sheet), but also clear banding/CF to avoid conflicts
  sh.clear({ contentsOnly: true });
  try { sh.clearConditionalFormatRules(); } catch(_) {}
  try {
    const bandings = (sh.getBandings && sh.getBandings()) || [];
    bandings.forEach(b => b.remove());
  } catch(_) {}

  sh.setFrozenRows(1);

  // Write headers
  if (headers && headers.length) {
    sh.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold')
      .setBackground('#F2F4F7')
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    // Column sizing
    sh.setColumnWidths(1, headers.length, 140);
    sh.setColumnWidth(1, 220);
    sh.autoResizeColumns(1, Math.min(headers.length, 8));
  }

  // SAFE banding: only apply if none exists
  try {
    const hasBanding =
      (sh.getBandings && sh.getBandings().length > 0) ||
      (sh.getDataRange().getBandings && sh.getDataRange().getBandings().length > 0);
    if (!hasBanding) {
      sh.getDataRange().applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
    }
  } catch(_) {
    // Fallback: ignore if banding APIs not available
  }

  if (typeof initFn === 'function') initFn(sh);
}



/* ----------------------------
 * Headers
 * ---------------------------- */

function summaryHeaders() {
  return ['Metric', 'Current Value', 'Target', 'Status', 'Last Checked', 'Notes'];
}
function crawlHeaders() {
  return ['Check', 'Status', 'Priority', 'Owner', 'Last Checked', 'Notes'];
}
function perfHeaders() {
  return ['Metric / Page', 'Mobile', 'Desktop', 'Priority', 'Fix Status', 'Notes'];
}
function onpageHeaders() {
  return ['Page URL', 'Title', 'Meta Description', 'H1', 'Alt Tags', 'OG/Twitter', 'Priority', 'Status', 'Notes'];
}
function schemaHeaders() {
  return ['Page', 'Schema Type', 'Errors', 'Validation Result', 'Priority', 'Status', 'Notes'];
}
function linksHeaders() {
  return ['Section/Page', 'Avg Internal Links', 'Backlinks', 'DR', 'Priority', 'Status', 'Notes'];
}
function analyticsHeaders() {
  return ['Date', 'Clicks', 'Impressions', 'CTR', 'Avg Position', 'Notes'];
}

/* ----------------------------
 * Summary init + formulas
 * ---------------------------- */

function initSummary(sh) {
  const rows = [
    ['Indexed Pages', '',  '—', '⚠️', new Date(), 'Enter count of indexed pages or link to GSC'],
    ['Avg LCP (mobile)', '', '< 2.5s', '⚠️', new Date(), 'Aim under 2.5s'],
    ['Avg CLS', '', '< 0.10', '⚠️', new Date(), 'Under 0.10'],
    ['Total Blocking Time', '', '< 200ms', '⚠️', new Date(), 'Under 200ms'],
    ['Organic CTR (30d)', '', '≥ 4%', '⚠️', new Date(), 'Improve titles & descriptions'],
    ['DR (Ahrefs)', '', '≥ 25', '🚧', new Date(), 'Backlink growth'],
    ['Mobile PSI Score', '', '≥ 85', '❌', new Date(), 'Optimize images & JS'],
    ['Schema Errors', '', '0', '⚠️', new Date(), 'Validate with Rich Results Test'],
    ['% On-Page Pass', '=IFERROR(Summary!H2, "")', '≥ 80%', '⚠️', new Date(), 'Derived below'],
  ];
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);

  // Space for derived metrics
  sh.getRange('H1').setValue('% On-Page Pass (auto)');
  sh.getRange('H2').setFormula(
    // % of On-Page rows where Status = ✅
    '=IFERROR(100*COUNTIF(\'On-Page SEO\'!H2:H,"✅")/MAX(1,COUNTA(\'On-Page SEO\'!A2:A)),)'
  );
  sh.getRange('H1:H2').setFontColor('#555');
}

/* ----------------------------
 * Named ranges for convenience
 * ---------------------------- */

function createNamedRanges(ss) {
  const onPage = ss.getSheetByName('On-Page SEO');
  if (onPage) {
    ss.setNamedRange('ONPAGE_STATUS', onPage.getRange('H2:H'));
    ss.setNamedRange('ONPAGE_URLS', onPage.getRange('A2:A'));
  }
}

/* ----------------------------
 * Validations & conditional formatting
 * ---------------------------- */

function applyGlobalValidations(ss) {
  const statusList = ['✅', '⚠️', '❌', '🚧', '—'];
  const priorityList = ['High', 'Medium', 'Low'];

  ss.getSheets().forEach(sh => {
    const lastCol = sh.getLastColumn();
    const lastRow = sh.getLastRow();
    if (lastCol < 1 || lastRow < 1) return; // skip truly empty sheets

    // Read header row safely
    const headersRow = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    // Find last non-empty header cell
    let headerCount = headersRow.length;
    while (headerCount > 0 && (headersRow[headerCount - 1] === '' || headersRow[headerCount - 1] == null)) {
      headerCount--;
    }
    if (headerCount === 0) return; // no headers → skip

    for (let idx = 0; idx < headerCount; idx++) {
      const h = headersRow[idx];
      const col = idx + 1;

      // No data rows yet? (only header) → skip validation range
      const numRows = Math.max(0, sh.getMaxRows() - 1);
      if (numRows === 0) continue;

      const range = sh.getRange(2, col, numRows, 1);

      if (['Status', 'Fix Status', 'Validation Result'].includes(h)) {
        range.setDataValidation(
          SpreadsheetApp.newDataValidation()
            .requireValueInList(statusList, true)
            .setAllowInvalid(true)
            .build()
        );
      }
      if (h === 'Priority') {
        range.setDataValidation(
          SpreadsheetApp.newDataValidation()
            .requireValueInList(priorityList, true)
            .setAllowInvalid(true)
            .build()
        );
      }
      if (h === 'Last Checked' || h === 'Date') {
        range.setNumberFormat('yyyy-mm-dd');
      }
      if (h === 'CTR') {
        range.setNumberFormat('0.00%');
      }
    }
  });
}


function applyGlobalConditionalFormats(ss) {
  ss.getSheets().forEach(sh => {
    const lastCol = sh.getLastColumn();
    const lastRow = sh.getLastRow();
    if (lastCol < 1 || lastRow < 1) return; // skip empty sheets

    const range = sh.getDataRange();

    // Use SHEET methods for CF rules (not Range)
    const existing = sh.getConditionalFormatRules() || [];

    // Remove prior emoji-based rules to avoid duplicates
    const filtered = existing.filter(r => {
      const cond = r.getBooleanCondition && r.getBooleanCondition();
      if (!cond) return true;
      const vals = cond.getCriteriaValues ? cond.getCriteriaValues() : [];
      const joined = vals.join('');
      return !['✅','⚠️','❌','🚧'].some(e => joined.indexOf(e) >= 0);
    });

    const makeRule = (emoji, color) =>
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains(emoji)
        .setBackground(color)
        .setRanges([range])
        .build();

    const newRules = [
      makeRule('✅', '#D9EAD3'), // green
      makeRule('⚠️', '#FFF2CC'), // yellow
      makeRule('❌', '#F4CCCC'), // red
      makeRule('🚧', '#E5E7EB')  // gray
    ];

    sh.setConditionalFormatRules([...filtered, ...newRules]);
  });
}


/* ----------------------------
 * Seed example rows (optional)
 * ---------------------------- */

function seedExamples(ss) {
  // Crawl
  const crawl = ss.getSheetByName('Crawl & Indexability');
  crawl.getRange(2,1,6,6).setValues([
    ['robots.txt valid', '✅', 'High', 'Tim', new Date(), 'Allows posts/ feeds'],
    ['XML sitemap submitted', '⚠️', 'High', 'Tim', new Date(), 'Check /sitemap.xml + GSC'],
    ['Canonicals correct', '✅', 'High', '', new Date(), 'No preview URLs'],
    ['No accidental noindex', '✅', 'High', '', new Date(), 'Review meta robots'],
    ['Broken internal links', '⚠️', 'Medium', '', new Date(), '3 broken author links'],
    ['Orphan pages', '⚠️', 'Medium', '', new Date(), 'Audit tag archives'],
  ]);

  // Performance
  const perf = ss.getSheetByName('Performance & CWV');
  perf.getRange(2,1,5,6).setValues([
    ['LCP (avg mobile, s)', 3.1, 1.8, 'High', '🚧', 'Compress hero images'],
    ['CLS (avg)', 0.12, 0.08, 'Medium', '✅', 'Reserve media space'],
    ['TBT (ms)', 350, 210, 'Medium', '⚠️', 'Split large bundle'],
    ['Lazy-load inline images', '—', '—', 'High', '✅', 'Next/Image OK'],
    ['Minify JS & CSS', '—', '—', 'High', '⚠️', 'Tree-shake article layout'],
  ]);

  // On-Page
  const onp = ss.getSheetByName('On-Page SEO');
  onp.getRange(2,1,2,9).setValues([
    ['https://www.eutopias.co/posts/finding-family-and-food-nourishment-in-nature-the-grizzly-forager-way','✅','⚠️','✅','⚠️','✅','High','⚠️','Add meta description + image alts'],
    ['https://www.eutopias.co/posts/example-2','✅','✅','✅','✅','✅','Medium','✅',''],
  ]);

  // Schema
  const schema = ss.getSheetByName('Structured Data');
  schema.getRange(2,1,2,7).setValues([
    ['Homepage','WebSite',0,'✅','Medium','✅','SearchAction OK'],
    ['.../finding-family-...','Article',1,'⚠️','High','⚠️','Missing author'],
  ]);

  // Links
  const links = ss.getSheetByName('Internal Linking & Authority');
  links.getRange(2,1,2,7).setValues([
    ['Articles',3,64,17,'High','⚠️','Target +100 links'],
    ['Homepage',15,'—','—','Medium','✅',''],
  ]);

  // Analytics
  const a = ss.getSheetByName('Analytics & Monitoring');
  const today = new Date();
  const d1 = new Date(today); d1.setDate(d1.getDate()-1);
  const d2 = new Date(today); d2.setDate(d2.getDate()-2);
  a.getRange(2,1,2,6).setValues([
    [d2, 40, 2100, 0.018, 22.1, ''],
    [d1, 55, 2500, 0.022, 20.8, ''],
  ]);
}

/* ----------------------------
 * Google Search Console (optional)
 * Uses REST via UrlFetch + ScriptApp OAuth token
 * ---------------------------- */

/** Minimal REST helper for GSC SearchAnalytics.query */
function gscQueryUrlFetch(siteUrl, req) {
  var endpoint = 'https://searchconsole.googleapis.com/webmasters/v3/sites/' +
                 encodeURIComponent(siteUrl) + '/searchAnalytics/query';
  var resp = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(req),
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
  });
  var code = resp.getResponseCode();
  if (code >= 400) {
    throw new Error('GSC API error ' + code + ': ' + resp.getContentText());
  }
  return JSON.parse(resp.getContentText());
}

// Replace your old pullGSC_30d() with this headless-safe + modern version.
function pullGSC_30d() {
  try {
    const SITE_URL = 'https://www.eutopias.co'; // update if needed
    const token = ScriptApp.getOAuthToken();

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const payload = {
      startDate: Utilities.formatDate(start, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      endDate: Utilities.formatDate(end, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      dimensions: ['date']
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const apiUrl =
      'https://searchconsole.googleapis.com/v1/searchanalytics/query?siteUrl=' +
      encodeURIComponent(SITE_URL);

    const resp = UrlFetchApp.fetch(apiUrl, options);
    const json = JSON.parse(resp.getContentText());

    if (resp.getResponseCode() !== 200)
      throw new Error('GSC API error: ' + JSON.stringify(json));

    const rows = json.rows || [];
    const sh = SpreadsheetApp.getActive().getSheetByName('Analytics & Monitoring');
    if (!sh) throw new Error('Missing "Analytics & Monitoring" sheet');

    const startRow = Math.max(2, sh.getLastRow() + 1);
    const out = rows.map(r => {
      const date = new Date(r.keys[0]);
      return [
        date,
        r.clicks || 0,
        r.impressions || 0,
        r.ctr || 0,
        r.position || 0,
        'GSC import'
      ];
    });

    if (out.length) sh.getRange(startRow, 1, out.length, 6).setValues(out);
    Logger.log('GSC imported rows: ' + out.length);

    return { ok: true, rows: out.length };
  } catch (err) {
    Logger.log('GSC fetch failed: ' + err);
    return { ok: false, error: String(err) };
  }
}

