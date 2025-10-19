#!/usr/bin/env node
/**
 * Side-by-side diff report for Payload "blocks" folders.
 *
 * Usage:
 *   node scripts/diff-blocks.js <OLD_BLOCKS_DIR> <NEW_BLOCKS_DIR> [OUTPUT_HTML]
 *
 * Example:
 *   node scripts/diff-blocks.js ../eutopias/src/blocks ./src/blocks ./blocks-diff.html
 *
 * Dependencies:
 *   npm i diff
 */

const fs = require('fs')
const path = require('path')
const Diff = require('diff')

const VALID_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json'])

function walk(dir, base = dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, base, files)
    } else {
      const ext = path.extname(entry.name).toLowerCase()
      if (VALID_EXT.has(ext)) {
        const rel = path.relative(base, full)
        files.push({ rel, full })
      }
    }
  }
  return files
}

function escapeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildIndexRow(status, rel, leftOnly, rightOnly, changed) {
  let badgeClass = 'unchanged'
  if (leftOnly || rightOnly) badgeClass = 'only'
  if (changed) badgeClass = 'changed'

  return `
    <tr>
      <td><span class="badge ${badgeClass}">${status}</span></td>
      <td><a href="#file-${hash(rel)}">${escapeHTML(rel)}</a></td>
    </tr>`
}

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Attempt to align removed/added chunks for side-by-side.
 * We pair a "removed" part with the next "added" part, line-by-line.
 */
function diffSideBySide(aText, bText) {
  const parts = Diff.diffLines(aText, bText)
  const rows = []
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]

    // Pair remove/add that follow each other for better alignment
    if (p.removed && i + 1 < parts.length && parts[i + 1].added) {
      const next = parts[i + 1]
      const leftLines = p.value.split('\n')
      const rightLines = next.value.split('\n')

      // remove trailing "" from split if text ends with \n
      if (leftLines.length && leftLines[leftLines.length - 1] === '') leftLines.pop()
      if (rightLines.length && rightLines[rightLines.length - 1] === '') rightLines.pop()

      const max = Math.max(leftLines.length, rightLines.length)
      for (let r = 0; r < max; r++) {
        rows.push({
          left: leftLines[r] ?? '',
          right: rightLines[r] ?? '',
          leftClass: 'removed',
          rightClass: 'added',
        })
      }
      i++ // consumed the paired "added"
      continue
    }

    // Unchanged block
    if (!p.added && !p.removed) {
      const lines = p.value.split('\n')
      if (lines.length && lines[lines.length - 1] === '') lines.pop()
      for (const line of lines) {
        rows.push({
          left: line,
          right: line,
          leftClass: 'unchanged',
          rightClass: 'unchanged',
        })
      }
      continue
    }

    // Lone added or removed chunk
    const lines = p.value.split('\n')
    if (lines.length && lines[lines.length - 1] === '') lines.pop()
    for (const line of lines) {
      if (p.added) {
        rows.push({ left: '', right: line, leftClass: 'empty', rightClass: 'added' })
      } else if (p.removed) {
        rows.push({ left: line, right: '', leftClass: 'removed', rightClass: 'empty' })
      }
    }
  }

  return rows
}

function renderFileSection(titleRel, leftPath, rightPath) {
  const id = `file-${hash(titleRel)}`
  const leftExists = !!leftPath
  const rightExists = !!rightPath
  const leftText = leftExists ? fs.readFileSync(leftPath, 'utf8') : ''
  const rightText = rightExists ? fs.readFileSync(rightPath, 'utf8') : ''

  const rows = diffSideBySide(leftText, rightText)

  const changed =
    rows.some((r) => r.leftClass === 'removed' || r.rightClass === 'added') ||
    !leftExists ||
    !rightExists

  const headerBadge = !leftExists
    ? `<span class="badge only">only new</span>`
    : !rightExists
      ? `<span class="badge only">only old</span>`
      : changed
        ? `<span class="badge changed">changed</span>`
        : `<span class="badge unchanged">unchanged</span>`

  let htmlRows = ''
  let lno = 0
  let rno = 0
  for (const r of rows) {
    const leftLine = r.left !== '' ? ++lno : ''
    const rightLine = r.right !== '' ? ++rno : ''
    htmlRows += `
      <tr>
        <td class="gutter">${leftLine}</td>
        <td class="code ${r.leftClass}">${escapeHTML(r.left)}</td>
        <td class="gutter">${rightLine}</td>
        <td class="code ${r.rightClass}">${escapeHTML(r.right)}</td>
      </tr>`
  }

  return {
    id,
    changed,
    section: `
    <section id="${id}">
      <h3>${escapeHTML(titleRel)} ${headerBadge}</h3>
      <table class="sbs">
        <thead>
          <tr><th class="gutter">#</th><th>OLD</th><th class="gutter">#</th><th>NEW</th></tr>
        </thead>
        <tbody>
          ${htmlRows || `<tr><td colspan="4" class="empty-msg">No content.</td></tr>`}
        </tbody>
      </table>
    </section>
  `,
  }
}

function buildReport(oldDir, newDir, outFile) {
  const left = walk(oldDir)
  const right = walk(newDir)

  const leftMap = new Map(left.map((f) => [f.rel, f.full]))
  const rightMap = new Map(right.map((f) => [f.rel, f.full]))

  const allRels = Array.from(new Set([...leftMap.keys(), ...rightMap.keys()])).sort()

  // Index table
  let idxRows = ''
  const sections = []

  for (const rel of allRels) {
    const leftPath = leftMap.get(rel)
    const rightPath = rightMap.get(rel)

    const leftOnly = !!leftPath && !rightPath
    const rightOnly = !!rightPath && !leftPath

    const { section, changed, id } = renderFileSection(rel, leftPath, rightPath)
    sections.push(section)

    const status = leftOnly
      ? 'only old'
      : rightOnly
        ? 'only new'
        : changed
          ? 'changed'
          : 'unchanged'

    idxRows += buildIndexRow(status, rel, leftOnly, rightOnly, changed)
  }

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Blocks Diff Report</title>
<style>
  :root { --bg:#0b0f14; --panel:#0f1520; --text:#e6e9ef; --muted:#a0a6b0; --add:#0f3; --rem:#f33; --unch:#2a2f3a; --only:#d99600; }
  body { margin:0; font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; background: var(--bg); color: var(--text); }
  header { position: sticky; top:0; background: rgba(15,21,32,.95); padding:12px 20px; border-bottom:1px solid #1d2533; z-index:10; }
  header h1 { margin:0; font-size:16px; }
  main { padding: 16px 20px 40px; }
  table.idx { width:100%; border-collapse: collapse; margin: 12px 0 24px; }
  table.idx td, table.idx th { padding:8px 10px; border-bottom: 1px solid #1d2533; }
  .badge { padding:2px 8px; border-radius: 10px; font-size: 12px; }
  .badge.changed { background:#1d3a24; color:#8fffab; border:1px solid #2f5a39; }
  .badge.only { background:#3a2a1d; color:#ffd18f; border:1px solid #5a3f2f; }
  .badge.unchanged { background:#1b2230; color:#a0a6b0; border:1px solid #2b3547; }
  section { margin:26px 0 40px; }
  h3 { margin: 0 0 10px; font-size: 15px; }
  table.sbs { width:100%; border-collapse: collapse; table-layout: fixed; border:1px solid #1d2533; }
  table.sbs thead th { background:#141b28; color:#a0a6b0; padding:6px 8px; border-bottom:1px solid #1d2533; }
  table.sbs td { vertical-align: top; }
  .gutter { width:48px; text-align:right; color:#8b93a1; background:#121826; border-right:1px solid #1d2533; padding:4px 6px; }
  .code { font-family: inherit; white-space: pre; overflow-wrap: anywhere; padding:4px 8px; border-right:1px solid #1d2533; background:#101726; }
  .code:last-child, .gutter:last-child { border-right:none; }
  .code.added { background: #0f1a13; box-shadow: inset 3px 0 0 #2d7f47; }
  .code.removed { background: #1a0f0f; box-shadow: inset 3px 0 0 #7f2d2d; }
  .code.unchanged { background:#101726; }
  .code.empty { background:#0d1320; color:#4b5567; }
  .empty-msg { color:#8b93a1; text-align:center; padding:12px; }
  a { color:#9fc6ff; text-decoration:none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <header><h1>Blocks Diff Report</h1></header>
  <main>
    <h2>Index</h2>
    <table class="idx">
      <thead><tr><th>Status</th><th>Path</th></tr></thead>
      <tbody>
        ${idxRows || '<tr><td colspan="2">No files found.</td></tr>'}
      </tbody>
    </table>

    ${sections.join('\n')}
  </main>
</body>
</html>`

  fs.writeFileSync(outFile, html, 'utf8')
  return outFile
}

;(function cli() {
  const [, , oldDir, newDir, out = 'blocks-diff.html'] = process.argv
  if (!oldDir || !newDir) {
    console.error(
      'Usage: node scripts/diff-blocks.js <OLD_BLOCKS_DIR> <NEW_BLOCKS_DIR> [OUTPUT_HTML]',
    )
    process.exit(2)
  }
  const outFile = path.resolve(process.cwd(), out)
  const result = buildReport(path.resolve(oldDir), path.resolve(newDir), outFile)
  console.log(`✓ Wrote report: ${result}`)
})()
