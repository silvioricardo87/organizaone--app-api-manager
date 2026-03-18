import type { APIContract } from '@/shared/lib/types'
import { extractEndpoints } from '@/shared/lib/api-utils'

export function findPCMReferenceAPI(apis: APIContract[]): APIContract | null {
  return apis.find(api => api.isPCMReference === true) || null
}

export function hasPCMReferenceAPI(apis: APIContract[]): boolean {
  return apis.some(api => api.isPCMReference === true)
}

export function getPCMEndpoints(pcmApi: APIContract): Array<{ path: string; methods: string[] }> {
  if (!pcmApi.parsedSpec) return []
  return extractEndpoints(pcmApi.parsedSpec)
}

export function getPCMEndpointList(pcmApi: APIContract): string[] {
  const endpoints = getPCMEndpoints(pcmApi)
  const result: string[] = []
  for (const ep of endpoints) {
    for (const method of ep.methods) {
      result.push(`${method.toUpperCase()} ${ep.path}`)
    }
  }
  return result
}

export function getPCMAdditionalInfoFields(pcmApi: APIContract): string[] {
  if (!pcmApi.parsedSpec?.components?.schemas) return []
  const schemas = pcmApi.parsedSpec.components.schemas
  const fields = new Set<string>()

  const clientSchema = schemas['ClientReportRequest']
  if (clientSchema?.properties?.additionalInfo?.properties) {
    for (const key of Object.keys(clientSchema.properties.additionalInfo.properties)) {
      fields.add(key)
    }
  }

  const serverSchema = schemas['ServerReportRequest']
  if (serverSchema?.properties?.additionalInfo?.properties) {
    for (const key of Object.keys(serverSchema.properties.additionalInfo.properties)) {
      fields.add(key)
    }
  }

  return Array.from(fields).sort()
}

export function matchDCEndpointToPCM(
  dcEndpoint: string,
  _pcmApi: APIContract
): { matched: boolean; pcmReportEndpoint: string; apiFamily: string | null } {
  const familyMatch = dcEndpoint.match(/\/open-banking\/([^/]+)\/v\d+/)
  const apiFamily = familyMatch ? familyMatch[1] : null
  return {
    matched: apiFamily !== null,
    pcmReportEndpoint: '/report-api/v1/private/report/',
    apiFamily,
  }
}
