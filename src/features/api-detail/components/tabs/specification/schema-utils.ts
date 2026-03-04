import { resolveRef, resolveParameter } from '@/shared/lib/api-utils'

export const METHOD_COLORS: Record<string, string> = {
  get: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  post: 'bg-green-500/10 text-green-700 border-green-500/20',
  put: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  patch: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  delete: 'bg-red-500/10 text-red-700 border-red-500/20',
  options: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  head: 'bg-gray-500/10 text-gray-700 border-gray-500/20'
}

export function fieldMatchesSearch(fieldName: string, fieldSchema: any, filter: string, searchNameOnly: boolean, spec?: any): boolean {
  if (!filter) return true

  const lowerFilter = filter.toLowerCase()
  const resolvedSchema = spec && fieldSchema.$ref ? resolveRef(fieldSchema.$ref, spec) || fieldSchema : fieldSchema

  if (fieldName.toLowerCase().includes(lowerFilter)) {
    return true
  }

  if (!searchNameOnly && resolvedSchema.description && resolvedSchema.description.toLowerCase().includes(lowerFilter)) {
    return true
  }

  return false
}

export function filterSchemaFields(schema: any, filter: string, searchNameOnly: boolean, spec?: any): any {
  if (!filter) return schema
  if (!schema) return null

  const resolvedSchema = spec && schema.$ref ? resolveRef(schema.$ref, spec) || schema : schema

  if (!resolvedSchema.properties && !resolvedSchema.items && !resolvedSchema.allOf && !resolvedSchema.oneOf && !resolvedSchema.anyOf) {
    return schema
  }

  const filteredProperties: Record<string, any> = {}
  let filteredItems: any = null
  let filteredAllOf: any[] | null = null
  let filteredOneOf: any[] | null = null
  let filteredAnyOf: any[] | null = null

  if (resolvedSchema.properties) {
    for (const [fieldName, fieldSchema] of Object.entries(resolvedSchema.properties)) {
      if (fieldMatchesSearch(fieldName, fieldSchema as any, filter, searchNameOnly, spec)) {
        filteredProperties[fieldName] = fieldSchema
      } else {
        const nestedFiltered = filterSchemaFields(fieldSchema as any, filter, searchNameOnly, spec)
        if (nestedFiltered && (
          (nestedFiltered.properties && Object.keys(nestedFiltered.properties).length > 0) ||
          nestedFiltered.items ||
          nestedFiltered.allOf ||
          nestedFiltered.oneOf ||
          nestedFiltered.anyOf
        )) {
          filteredProperties[fieldName] = nestedFiltered
        }
      }
    }
  }

  if (resolvedSchema.items) {
    const itemsFiltered = filterSchemaFields(resolvedSchema.items, filter, searchNameOnly, spec)
    if (itemsFiltered) {
      filteredItems = itemsFiltered
    }
  }

  if (resolvedSchema.allOf) {
    const filtered = resolvedSchema.allOf
      .map((subSchema: any) => filterSchemaFields(subSchema, filter, searchNameOnly, spec))
      .filter((s: any) => s !== null)
    if (filtered.length > 0) {
      filteredAllOf = filtered
    }
  }

  if (resolvedSchema.oneOf) {
    const filtered = resolvedSchema.oneOf
      .map((subSchema: any) => filterSchemaFields(subSchema, filter, searchNameOnly, spec))
      .filter((s: any) => s !== null)
    if (filtered.length > 0) {
      filteredOneOf = filtered
    }
  }

  if (resolvedSchema.anyOf) {
    const filtered = resolvedSchema.anyOf
      .map((subSchema: any) => filterSchemaFields(subSchema, filter, searchNameOnly, spec))
      .filter((s: any) => s !== null)
    if (filtered.length > 0) {
      filteredAnyOf = filtered
    }
  }

  if (Object.keys(filteredProperties).length === 0 && !filteredItems && !filteredAllOf && !filteredOneOf && !filteredAnyOf) {
    return null
  }

  return {
    ...resolvedSchema,
    properties: Object.keys(filteredProperties).length > 0 ? filteredProperties : undefined,
    items: filteredItems || undefined,
    allOf: filteredAllOf || undefined,
    oneOf: filteredOneOf || undefined,
    anyOf: filteredAnyOf || undefined
  }
}

export function schemaHasMatchingFields(schema: any, filter: string, searchNameOnly: boolean, spec?: any): boolean {
  if (!filter) return true
  if (!schema) return false

  const resolvedSchema = spec && schema.$ref ? resolveRef(schema.$ref, spec) || schema : schema

  if (resolvedSchema.properties) {
    for (const [fieldName, fieldSchema] of Object.entries(resolvedSchema.properties)) {
      if (fieldMatchesSearch(fieldName, fieldSchema as any, filter, searchNameOnly, spec)) {
        return true
      }

      if (schemaHasMatchingFields(fieldSchema as any, filter, searchNameOnly, spec)) {
        return true
      }
    }
  }

  if (resolvedSchema.items) {
    if (schemaHasMatchingFields(resolvedSchema.items, filter, searchNameOnly, spec)) {
      return true
    }
  }

  if (resolvedSchema.allOf) {
    for (const subSchema of resolvedSchema.allOf) {
      if (schemaHasMatchingFields(subSchema, filter, searchNameOnly, spec)) {
        return true
      }
    }
  }

  if (resolvedSchema.oneOf) {
    for (const subSchema of resolvedSchema.oneOf) {
      if (schemaHasMatchingFields(subSchema, filter, searchNameOnly, spec)) {
        return true
      }
    }
  }

  if (resolvedSchema.anyOf) {
    for (const subSchema of resolvedSchema.anyOf) {
      if (schemaHasMatchingFields(subSchema, filter, searchNameOnly, spec)) {
        return true
      }
    }
  }

  if (resolvedSchema.additionalProperties && typeof resolvedSchema.additionalProperties === 'object') {
    if (schemaHasMatchingFields(resolvedSchema.additionalProperties, filter, searchNameOnly, spec)) {
      return true
    }
  }

  return false
}

export function endpointMatchesSearch(path: string, method: string, operation: any, filter: string, searchNameOnly: boolean, spec?: any): boolean {
  if (!filter) return true

  const lowerFilter = filter.toLowerCase()

  if (path.toLowerCase().includes(lowerFilter)) {
    return true
  }

  if (method.toLowerCase().includes(lowerFilter)) {
    return true
  }

  if (!searchNameOnly) {
    if (operation.summary && operation.summary.toLowerCase().includes(lowerFilter)) {
      return true
    }

    if (operation.description && operation.description.toLowerCase().includes(lowerFilter)) {
      return true
    }

    if (operation.operationId && operation.operationId.toLowerCase().includes(lowerFilter)) {
      return true
    }

    if (operation.tags && operation.tags.some((tag: string) => tag.toLowerCase().includes(lowerFilter))) {
      return true
    }

    if (operation.parameters) {
      for (const paramRef of operation.parameters) {
        const param = resolveParameter(paramRef, spec)
        if (param.name && param.name.toLowerCase().includes(lowerFilter)) {
          return true
        }
        if (param.description && param.description.toLowerCase().includes(lowerFilter)) {
          return true
        }
      }
    }

    if (operation.requestBody?.content) {
      for (const content of Object.values(operation.requestBody.content) as any[]) {
        if (content.schema && schemaHasMatchingFields(content.schema, filter, searchNameOnly, spec)) {
          return true
        }
      }
    }

    if (operation.responses) {
      for (const response of Object.values(operation.responses) as any[]) {
        const resolvedResponse = response.$ref ? resolveRef(response.$ref, spec) || response : response
        if (resolvedResponse.content) {
          for (const content of Object.values(resolvedResponse.content) as any[]) {
            if (content.schema && schemaHasMatchingFields(content.schema, filter, searchNameOnly, spec)) {
              return true
            }
          }
        }
      }
    }
  }

  return false
}
