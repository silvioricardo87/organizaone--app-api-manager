import type { APIContract } from '@/lib/types'
import { extractEndpoints } from '@/lib/api-utils'
import { API_FAMILY_RULES } from '@/lib/pcm-rules'

export interface CSVRow {
  orgid: string
  clientid: string
  serverid: string
  reporter: string
  iniciador: string
  detentor: string
  status: string
  statuscode: string
  api_family: string
  api_version: string
  endpoint: string
  data_chamada: string
  role_reporter: string
  org_faltante: string
  nome_faltante: string
  role_faltante: string
  qtd_paired: number
  qtd_paired_inconsistent: number
  qtd_unpaired: number
  qtd_chamadas: number
  percent_paired: string
  percent_paired_inconsistent: string
  percent_unpaired: string
}

export interface ValidationInconsistency {
  type: 'warning' | 'error' | 'info'
  message: string
}

export interface EndpointCoverage {
  endpoint: string
  inSpec: boolean
  inCSV: boolean
  csvCount: number
}

export interface ValidationResult {
  totalRecords: number
  matchedRecords: number
  unmatchedRecords: number
  pairedCount: number
  unpairedCount: number
  pairedInconsistentCount: number
  statusCodeDistribution: Record<string, number>
  endpointCoverage: EndpointCoverage[]
  dateRange: { min: string; max: string } | null
  organizations: { reporters: Set<string>; detentores: Set<string> }
  inconsistencies: ValidationInconsistency[]
  matchedRows: CSVRow[]
}

export function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue

    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j]
    }

    rows.push({
      orgid: row['orgid'] || '',
      clientid: row['clientid'] || '',
      serverid: row['serverid'] || '',
      reporter: row['reporter'] || '',
      iniciador: row['iniciador'] || '',
      detentor: row['detentor'] || '',
      status: row['status'] || '',
      statuscode: row['statuscode'] || '',
      api_family: row['api_family'] || '',
      api_version: row['api_version'] || '',
      endpoint: row['endpoint'] || '',
      data_chamada: row['data_chamada'] || '',
      role_reporter: row['role_reporter'] || '',
      org_faltante: row['org_faltante'] || '',
      nome_faltante: row['nome_faltante'] || '',
      role_faltante: row['role_faltante'] || '',
      qtd_paired: parseInt(row['qtd_paired'] || '0', 10),
      qtd_paired_inconsistent: parseInt(row['qtd_paired_inconsistent'] || '0', 10),
      qtd_unpaired: parseInt(row['qtd_unpaired'] || '0', 10),
      qtd_chamadas: parseInt(row['qtd_chamadas'] || '0', 10),
      percent_paired: row['percent_paired'] || '0%',
      percent_paired_inconsistent: row['percent_paired_inconsistent'] || '0%',
      percent_unpaired: row['percent_unpaired'] || '0%',
    })
  }

  return rows
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"' && !inQuotes) {
      inQuotes = true
    } else if (char === '"' && inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = false
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())

  return values
}

export function detectCSVFamily(api: APIContract): string | null {
  if (!api.parsedSpec) return null
  const endpoints = extractEndpoints(api.parsedSpec)
  const allPaths = endpoints.map(e => e.path.toLowerCase())

  for (const familyRules of API_FAMILY_RULES) {
    const pathMatch = familyRules.pathPatterns.some(pattern =>
      allPaths.some(path => path.includes(pattern))
    )
    if (pathMatch) return familyRules.family
  }

  return null
}

export function filterMatchingRows(rows: CSVRow[], api: APIContract): { matched: CSVRow[]; unmatched: CSVRow[] } {
  const family = detectCSVFamily(api)
  const versionTag = api.version.replace(/^v?/, 'v').split('.')[0]

  const matched: CSVRow[] = []
  const unmatched: CSVRow[] = []

  for (const row of rows) {
    const familyMatch = family ? row.api_family.toLowerCase() === family.toLowerCase() : false
    const versionMatch = row.api_version.toLowerCase() === versionTag.toLowerCase()

    if (familyMatch && versionMatch) {
      matched.push(row)
    } else {
      unmatched.push(row)
    }
  }

  return { matched, unmatched }
}

export function validateReport(rows: CSVRow[], api: APIContract): ValidationResult {
  const { matched, unmatched } = filterMatchingRows(rows, api)

  const endpoints = api.parsedSpec ? extractEndpoints(api.parsedSpec) : []
  const specEndpoints = new Set(endpoints.map(e => e.path))

  // Status distribution
  const statusCodeDistribution: Record<string, number> = {}
  for (const row of matched) {
    statusCodeDistribution[row.statuscode] = (statusCodeDistribution[row.statuscode] || 0) + row.qtd_chamadas
  }

  // Pairing stats
  let pairedCount = 0
  let unpairedCount = 0
  let pairedInconsistentCount = 0
  for (const row of matched) {
    pairedCount += row.qtd_paired
    unpairedCount += row.qtd_unpaired
    pairedInconsistentCount += row.qtd_paired_inconsistent
  }

  // Endpoint coverage
  const csvEndpoints = new Set(matched.map(r => r.endpoint))
  const allEndpoints = new Set([...specEndpoints, ...csvEndpoints])
  const endpointCoverage: EndpointCoverage[] = []
  for (const ep of allEndpoints) {
    const csvCount = matched.filter(r => r.endpoint === ep).reduce((sum, r) => sum + r.qtd_chamadas, 0)
    endpointCoverage.push({
      endpoint: ep,
      inSpec: specEndpoints.has(ep),
      inCSV: csvEndpoints.has(ep),
      csvCount,
    })
  }
  endpointCoverage.sort((a, b) => b.csvCount - a.csvCount)

  // Date range
  const dates = matched.map(r => r.data_chamada).filter(Boolean).sort()
  const dateRange = dates.length > 0 ? { min: dates[0], max: dates[dates.length - 1] } : null

  // Organizations
  const reporters = new Set(matched.map(r => r.reporter).filter(Boolean))
  const detentores = new Set(matched.map(r => r.detentor).filter(Boolean))

  // Inconsistencies
  const inconsistencies: ValidationInconsistency[] = []

  // Endpoints in CSV but not in spec
  const csvOnlyEndpoints = endpointCoverage.filter(e => e.inCSV && !e.inSpec)
  if (csvOnlyEndpoints.length > 0) {
    inconsistencies.push({
      type: 'warning',
      message: `${csvOnlyEndpoints.length} endpoint(s) in CSV not found in spec: ${csvOnlyEndpoints.map(e => e.endpoint).slice(0, 3).join(', ')}${csvOnlyEndpoints.length > 3 ? '...' : ''}`,
    })
  }

  // Endpoints in spec but not in CSV
  const specOnlyEndpoints = endpointCoverage.filter(e => e.inSpec && !e.inCSV)
  if (specOnlyEndpoints.length > 0) {
    inconsistencies.push({
      type: 'info',
      message: `${specOnlyEndpoints.length} endpoint(s) in spec not found in CSV: ${specOnlyEndpoints.map(e => e.endpoint).slice(0, 3).join(', ')}${specOnlyEndpoints.length > 3 ? '...' : ''}`,
    })
  }

  // High unpaired percentage
  const totalCalls = pairedCount + unpairedCount + pairedInconsistentCount
  if (totalCalls > 0) {
    const unpairedPercent = (unpairedCount / totalCalls) * 100
    if (unpairedPercent > 20) {
      inconsistencies.push({
        type: 'error',
        message: `High unpaired rate: ${unpairedPercent.toFixed(1)}% of calls are unpaired`,
      })
    } else if (unpairedPercent > 5) {
      inconsistencies.push({
        type: 'warning',
        message: `Moderate unpaired rate: ${unpairedPercent.toFixed(1)}% of calls are unpaired`,
      })
    }
  }

  // Inconsistent paired
  if (pairedInconsistentCount > 0) {
    inconsistencies.push({
      type: 'warning',
      message: `${pairedInconsistentCount} paired-inconsistent calls detected`,
    })
  }

  // Error status codes
  const errorCodes = Object.entries(statusCodeDistribution)
    .filter(([code]) => parseInt(code) >= 400)
    .sort(([, a], [, b]) => b - a)
  if (errorCodes.length > 0) {
    const total = Object.values(statusCodeDistribution).reduce((s, v) => s + v, 0)
    const errorTotal = errorCodes.reduce((s, [, v]) => s + v, 0)
    const errorPercent = (errorTotal / total) * 100
    if (errorPercent > 10) {
      inconsistencies.push({
        type: 'warning',
        message: `${errorPercent.toFixed(1)}% error status codes (${errorCodes.map(([c, n]) => `${c}: ${n}`).join(', ')})`,
      })
    }
  }

  return {
    totalRecords: rows.length,
    matchedRecords: matched.length,
    unmatchedRecords: unmatched.length,
    pairedCount,
    unpairedCount,
    pairedInconsistentCount,
    statusCodeDistribution,
    endpointCoverage,
    dateRange,
    organizations: { reporters, detentores },
    inconsistencies,
    matchedRows: matched,
  }
}
