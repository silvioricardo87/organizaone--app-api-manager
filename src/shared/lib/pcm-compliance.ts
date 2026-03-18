import type { APIContract, PCMComplianceResult, PCMComplianceItem, PCMRule } from '@/shared/lib/types'
import { extractEndpoints } from '@/shared/lib/api-utils'
import { detectAPIFamily } from '@/shared/lib/pcm-field-generator'
import { ALL_PCM_RULES } from '@/shared/lib/pcm-rules-data'

export function generateComplianceReport(
  dcApi: APIContract,
  pcmApi: APIContract
): PCMComplianceResult {
  const endpoints = dcApi.parsedSpec ? extractEndpoints(dcApi.parsedSpec) : []
  const detectedFamily = detectAPIFamily(dcApi.name, endpoints)
  const familyName = detectedFamily?.family || undefined

  const applicableRules = ALL_PCM_RULES.filter(rule => {
    if (rule.apiFamily && rule.apiFamily !== familyName) return false
    return true
  })

  const configuredFieldNames = new Set(dcApi.pcmFields.map(f => f.field))

  const matched: PCMComplianceItem[] = []
  const missing: PCMComplianceItem[] = []
  const extra: PCMComplianceItem[] = []

  for (const rule of applicableRules) {
    if (rule.severity !== 'error') continue

    const ruleEndpoints = rule.endpoints.includes('*')
      ? endpoints.flatMap(ep => ep.methods.map(m => ({ path: ep.path, method: m })))
      : rule.endpoints.flatMap(ruleEp => {
          return endpoints
            .filter(ep => {
              const pattern = ruleEp.replace('/vx/', '/v\\d+/')
              return new RegExp(pattern).test(ep.path)
            })
            .flatMap(ep => ep.methods.map(m => ({ path: ep.path, method: m })))
        })

    for (const { path, method } of ruleEndpoints) {
      if (configuredFieldNames.has(rule.field)) {
        matched.push({ field: rule.field, endpoint: path, method, status: 'matched', rule })
      } else {
        missing.push({ field: rule.field, endpoint: path, method, status: 'missing', rule })
      }
    }
  }

  const ruleFieldNames = new Set(applicableRules.map(r => r.field))
  for (const field of dcApi.pcmFields) {
    if (!ruleFieldNames.has(field.field)) {
      extra.push({ field: field.field, endpoint: field.endpoint, method: field.method, status: 'extra' })
    }
  }

  const uniqueMissing = Array.from(new Map(missing.map(m => [m.field, m])).values())
  const totalRequired = new Set(applicableRules.filter(r => r.severity === 'error').map(r => r.field)).size
  const matchedCount = new Set(matched.map(m => m.field)).size
  const score = totalRequired > 0 ? Math.round((matchedCount / totalRequired) * 100) : 100

  return {
    apiId: dcApi.id,
    apiName: dcApi.name,
    totalPCMFields: totalRequired,
    matchedFields: matchedCount,
    missingMandatoryFields: uniqueMissing,
    extraFields: extra,
    matchedFieldsList: matched,
    rulesApplied: applicableRules,
    overallScore: score,
  }
}

export function checkReportAgainstPCM(
  csvColumnHeaders: string[],
  _dcApi: APIContract,
  applicableRules: PCMRule[]
): {
  inReportAndPCM: string[]
  inReportNotPCM: string[]
  inPCMNotReport: string[]
  mandatoryMissing: PCMComplianceItem[]
} {
  const csvFieldMap = new Map<string, string>()
  for (const header of csvColumnHeaders) {
    const lower = header.toLowerCase()
    if (lower.startsWith('additionalinfo_')) {
      csvFieldMap.set(header, lower.replace('additionalinfo_', ''))
    } else {
      csvFieldMap.set(header, lower)
    }
  }
  const csvFields = new Set(csvFieldMap.values())

  const pcmFields = new Set(applicableRules.filter(r => r.severity === 'error').map(r => r.field.toLowerCase()))

  const inReportAndPCM = [...csvFields].filter(f => pcmFields.has(f))
  const inReportNotPCM = [...csvFields].filter(f => !pcmFields.has(f))
  const inPCMNotReport = [...pcmFields].filter(f => !csvFields.has(f))

  const mandatoryMissing: PCMComplianceItem[] = inPCMNotReport.map(field => {
    const rule = applicableRules.find(r => r.field.toLowerCase() === field && r.severity === 'error')
    return {
      field,
      endpoint: '*',
      method: '*',
      status: 'missing' as const,
      rule,
      detail: rule?.rule,
    }
  })

  return { inReportAndPCM, inReportNotPCM, inPCMNotReport, mandatoryMissing }
}
