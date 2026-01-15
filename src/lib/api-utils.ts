import yaml from 'js-yaml'

export function parseOpenAPIYAML(yamlContent: string): { success: boolean; data?: any; error?: string } {
  try {
    const parsed = yaml.load(yamlContent)
    
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid YAML content' }
    }

    const spec = parsed as any
    
    if (!spec.openapi || !spec.info) {
      return { success: false, error: 'Not a valid OpenAPI 3.0 specification' }
    }

    return { success: true, data: spec }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to parse YAML' 
    }
  }
}

export function extractAPIMetadata(spec: any): { version: string; summary: string } {
  return {
    version: spec.info?.version || '1.0.0',
    summary: spec.info?.description?.split('\n')[0] || spec.info?.title || 'No summary available'
  }
}

export function extractEndpoints(spec: any): Array<{ path: string; methods: string[] }> {
  const endpoints: Array<{ path: string; methods: string[] }> = []
  
  if (spec.paths) {
    Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
      const methods = Object.keys(pathItem).filter(key => 
        ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(key.toLowerCase())
      )
      endpoints.push({ path, methods: methods.map(m => m.toUpperCase()) })
    })
  }
  
  return endpoints
}

export function getEndpointFields(spec: any, endpoint: string, method: string): string[] {
  const fields: Set<string> = new Set()
  
  try {
    const pathItem = spec.paths?.[endpoint]
    if (!pathItem) return []
    
    const operation = pathItem[method.toLowerCase()]
    if (!operation) return []

    const extractFieldsFromSchema = (schema: any, prefix = '') => {
      if (!schema) return
      
      if (schema.properties) {
        Object.keys(schema.properties).forEach(prop => {
          const fullPath = prefix ? `${prefix}.${prop}` : prop
          fields.add(fullPath)
          extractFieldsFromSchema(schema.properties[prop], fullPath)
        })
      }
      
      if (schema.items) {
        extractFieldsFromSchema(schema.items, prefix)
      }
      
      if (schema.$ref) {
        const refPath = schema.$ref.split('/').pop()
        const component = spec.components?.schemas?.[refPath]
        if (component) {
          extractFieldsFromSchema(component, prefix)
        }
      }
    }

    if (operation.requestBody?.content) {
      Object.values(operation.requestBody.content).forEach((content: any) => {
        extractFieldsFromSchema(content.schema)
      })
    }

    if (operation.responses) {
      Object.values(operation.responses).forEach((response: any) => {
        if (response.content) {
          Object.values(response.content).forEach((content: any) => {
            extractFieldsFromSchema(content.schema)
          })
        }
      })
    }

    if (operation.parameters) {
      operation.parameters.forEach((param: any) => {
        fields.add(param.name)
      })
    }
  } catch (error) {
    console.error('Error extracting fields:', error)
  }
  
  return Array.from(fields)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function resolveRef(ref: string, spec: any): any {
  if (!ref || !ref.startsWith('#/')) return null
  
  const parts = ref.split('/').slice(1)
  let current = spec
  
  for (const part of parts) {
    if (!current || typeof current !== 'object') return null
    current = current[part]
  }
  
  return current
}

export function resolveParameter(param: any, spec: any): any {
  if (param.$ref) {
    const resolved = resolveRef(param.$ref, spec)
    return resolved || param
  }
  return param
}

export function resolveSchema(schema: any, spec: any): any {
  if (!schema) return schema
  
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, spec)
    return resolved ? resolveSchema(resolved, spec) : schema
  }
  
  if (schema.allOf) {
    const merged: any = {}
    schema.allOf.forEach((subSchema: any) => {
      const resolved = resolveSchema(subSchema, spec)
      Object.assign(merged, resolved)
      if (resolved.properties) {
        merged.properties = { ...merged.properties, ...resolved.properties }
      }
    })
    return { ...schema, ...merged }
  }
  
  return schema
}
