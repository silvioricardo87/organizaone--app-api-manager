import { PCMField } from '@/lib/types'
import { extractEndpoints } from '@/lib/api-utils'
import { generateId } from '@/lib/api-utils'
import { BASE_PCM_FIELDS, API_FAMILY_RULES, type APIFamilyRules } from '@/lib/pcm-rules'

export interface DetectedFamily {
  family: string
  rules: APIFamilyRules
}

export function detectAPIFamily(apiName: string, endpoints: Array<{ path: string; methods: string[] }>): DetectedFamily | null {
  const nameLower = apiName.toLowerCase()
  const allPaths = endpoints.map(e => e.path.toLowerCase())

  for (const familyRules of API_FAMILY_RULES) {
    const pathMatch = familyRules.pathPatterns.some(pattern =>
      allPaths.some(path => path.includes(pattern))
    )
    if (pathMatch) {
      return { family: familyRules.family, rules: familyRules }
    }
  }

  for (const familyRules of API_FAMILY_RULES) {
    const nameMatch = familyRules.keywords.some(keyword =>
      nameLower.includes(keyword.toLowerCase())
    )
    if (nameMatch) {
      return { family: familyRules.family, rules: familyRules }
    }
  }

  return null
}

export function generatePCMFields(
  apiName: string,
  parsedSpec: any,
  version: string
): { fields: PCMField[]; detectedFamily: DetectedFamily | null } {
  const endpoints = parsedSpec ? extractEndpoints(parsedSpec) : []
  const detectedFamily = detectAPIFamily(apiName, endpoints)

  const allRules = [...BASE_PCM_FIELDS]
  if (detectedFamily) {
    allRules.push(...detectedFamily.rules.additionalFields)
  }

  const versionTag = version.replace(/^v?/, 'v').split('.')[0]
  const fields: PCMField[] = []

  for (const ep of endpoints) {
    for (const method of ep.methods) {
      for (const rule of allRules) {
        fields.push({
          id: generateId(),
          endpoint: ep.path,
          method,
          field: rule.field,
          isCustomField: true,
          definition: rule.definition,
          fillingRule: rule.fillingRule,
          roles: [...rule.roles],
          httpCodes: [...rule.httpCodes],
          domain: rule.domain,
          versions: [versionTag],
          maxSize: rule.maxSize,
          pattern: rule.pattern,
          example: rule.example,
          mandatory: rule.mandatory,
        })
      }
    }
  }

  return { fields, detectedFamily }
}

export function mergeWithExistingFields(
  newFields: PCMField[],
  existingFields: PCMField[]
): PCMField[] {
  const existingKeys = new Set(
    existingFields.map(f => `${f.endpoint}|${f.method}|${f.field}`)
  )

  const uniqueNew = newFields.filter(f => {
    const key = `${f.endpoint}|${f.method}|${f.field}`
    return !existingKeys.has(key)
  })

  return [...existingFields, ...uniqueNew]
}
