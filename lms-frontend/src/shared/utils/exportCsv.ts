type CsvColumn<T> = {
  key: keyof T | string
  label: string
  value?: (row: T) => string | number | null | undefined
}

const escapeCsv = (value: string) => {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

export const exportToCsv = <T,>(filename: string, rows: T[], columns: CsvColumn<T>[]) => {
  const header = columns.map((c) => escapeCsv(c.label)).join(',')
  const body = rows.map((row) => {
    return columns.map((c) => {
      const raw = c.value ? c.value(row) : (row as any)[c.key]
      const value = raw === null || raw === undefined ? '' : String(raw)
      return escapeCsv(value)
    }).join(',')
  }).join('\n')

  const csv = `${header}\n${body}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
