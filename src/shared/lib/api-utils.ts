import yaml, { JSON_SCHEMA, YAMLException } from 'js-yaml'

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

export type YAMLValidationError = { message: string; path?: string }

const VALID_HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'])
const OPENAPI_PATH_FIELDS = new Set([...VALID_HTTP_METHODS, 'summary', 'description', 'servers', 'parameters', '$ref'])

export function parseOpenAPIYAML(yamlContent: string): {
  success: boolean
  data?: any
  error?: string
  errors?: YAMLValidationError[]
} {
  let parsed: unknown
  try {
    parsed = yaml.load(yamlContent, { schema: JSON_SCHEMA })
  } catch (error) {
    if (error instanceof YAMLException && error.mark) {
      const line = error.mark.line + 1
      return {
        success: false,
        error: `YAML syntax error at line ${line}`,
        errors: [{ message: `yaml_syntax_error:${line}` }],
      }
    }
    const msg = error instanceof Error ? error.message : 'Failed to parse YAML'
    return { success: false, error: msg, errors: [{ message: msg }] }
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      success: false,
      error: 'Invalid YAML content',
      errors: [{ message: 'Invalid YAML content' }],
    }
  }

  const spec = parsed as Record<string, unknown>
  const errors: YAMLValidationError[] = []

  // Required top-level: openapi
  if (!spec.openapi) {
    errors.push({ message: 'missing_field:openapi', path: 'openapi' })
  } else if (typeof spec.openapi !== 'string') {
    errors.push({ message: 'invalid_field:openapi', path: 'openapi' })
  }

  // Required top-level: info (object)
  if (!spec.info) {
    errors.push({ message: 'missing_field:info', path: 'info' })
  } else if (typeof spec.info !== 'object' || Array.isArray(spec.info)) {
    errors.push({ message: 'invalid_field:info', path: 'info' })
  } else {
    const info = spec.info as Record<string, unknown>
    if (!info.title) {
      errors.push({ message: 'missing_field:info.title', path: 'info.title' })
    }
    if (!info.version) {
      errors.push({ message: 'missing_field:info.version', path: 'info.version' })
    }
  }

  // Required top-level: paths (object)
  if (!spec.paths) {
    errors.push({ message: 'missing_field:paths', path: 'paths' })
  } else if (typeof spec.paths !== 'object' || Array.isArray(spec.paths)) {
    errors.push({ message: 'invalid_field:paths', path: 'paths' })
  } else {
    const paths = spec.paths as Record<string, unknown>
    for (const [pathKey, pathValue] of Object.entries(paths)) {
      if (!pathValue || typeof pathValue !== 'object' || Array.isArray(pathValue)) continue
      const pathItem = pathValue as Record<string, unknown>

      for (const key of Object.keys(pathItem)) {
        if (OPENAPI_PATH_FIELDS.has(key) || key.startsWith('x-')) continue
        errors.push({
          message: `invalid_method:${key}`,
          path: `paths.${pathKey}.${key}`,
        })
      }

      for (const method of VALID_HTTP_METHODS) {
        if (!(method in pathItem)) continue
        const operation = pathItem[method]
        if (!operation || typeof operation !== 'object') continue
        const op = operation as Record<string, unknown>
        if (!op.responses) {
          errors.push({
            message: `missing_field:responses`,
            path: `paths.${pathKey}.${method}.responses`,
          })
        }
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors[0].message,
      errors,
    }
  }

  return { success: true, data: spec }
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

    const visited = new Set<string>()
    const extractFieldsFromSchema = (schema: any, prefix = '') => {
      if (!schema) return

      if (schema.$ref) {
        if (visited.has(schema.$ref)) return
        visited.add(schema.$ref)
        const component = resolveRef(schema.$ref, spec)
        if (component) {
          extractFieldsFromSchema(component, prefix)
        }
        return
      }

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
      operation.parameters.forEach((p: any) => {
        const param = resolveParameter(p, spec)
        if (param && param.name) {
          fields.add(param.name)
        }
      })
    }
  } catch (error) {
    console.error('Error extracting fields:', error)
  }
  
  return Array.from(fields).filter(f => typeof f === 'string' && f.length > 0)
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
    if (DANGEROUS_KEYS.has(part)) return null
    if (!Object.prototype.hasOwnProperty.call(current, part)) return null
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

export function resolveSchema(schema: any, spec: any, visited: Set<string> = new Set()): any {
  if (!schema) return schema

  if (schema.$ref) {
    if (visited.has(schema.$ref)) return schema
    visited.add(schema.$ref)
    const resolved = resolveRef(schema.$ref, spec)
    return resolved ? resolveSchema(resolved, spec, visited) : schema
  }

  if (schema.allOf) {
    const merged: any = {}
    schema.allOf.forEach((subSchema: any) => {
      const resolved = resolveSchema(subSchema, spec, visited)
      Object.assign(merged, resolved)
      if (resolved.properties) {
        merged.properties = { ...merged.properties, ...resolved.properties }
      }
    })
    return { ...schema, ...merged }
  }

  return schema
}
