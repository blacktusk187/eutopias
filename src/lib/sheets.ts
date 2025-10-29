import { google } from 'googleapis'

export type SheetSummaryRow = [
  string,
  string | number | null,
  string | null,
  string | null,
  string | null,
  string | null,
]

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  return google.sheets({ version: 'v4', auth })
}

export async function readSummary() {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!
  // Read Summary rows A2:F (Metric, Current, Target, Status, Last Checked, Notes)
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Summary!A2:F100',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  })
  const rows = (resp.data.values || []) as SheetSummaryRow[]
  return rows.filter((r) => (r[0] ?? '') !== '')
}
