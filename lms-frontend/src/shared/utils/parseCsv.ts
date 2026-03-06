// Simple CSV parser for browser (comma-separated, no quotes/escapes)
export function parseCsv(text: string): Array<Record<string, string>> {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/)
  const headers = headerLine.split(',').map(h => h.trim())
  return lines.filter(Boolean).map(line => {
    const values = line.split(',').map(v => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  })
}
