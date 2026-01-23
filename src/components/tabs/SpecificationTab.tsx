import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { APIContract } from '@/lib/types'
import { Copy, CaretRight, MagnifyingGlass, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { resolveParameter, resolveRef, resolveSchema } from '@/lib/api-utils'
import { useSettings } from '@/hooks/use-settings'

interface SpecificationTabProps {
  api: APIContract
}

const METHOD_COLORS: Record<string, string> = {
  get: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  post: 'bg-green-500/10 text-green-700 border-green-500/20',
  put: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  patch: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  delete: 'bg-red-500/10 text-red-700 border-red-500/20',
  options: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  head: 'bg-gray-500/10 text-gray-700 border-gray-500/20'
}

function fieldMatchesSearch(fieldName: string, fieldSchema: any, filter: string, searchNameOnly: boolean, spec?: any): boolean {
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

function filterSchemaFields(schema: any, filter: string, searchNameOnly: boolean, spec?: any): any {
  if (!filter) return schema
  
  const resolvedSchema = spec && schema.$ref ? resolveRef(schema.$ref, spec) || schema : schema
  
  if (!resolvedSchema.properties) {
    return schema
  }
  
  const filteredProperties: Record<string, any> = {}
  
  for (const [fieldName, fieldSchema] of Object.entries(resolvedSchema.properties)) {
    if (fieldMatchesSearch(fieldName, fieldSchema as any, filter, searchNameOnly, spec)) {
      filteredProperties[fieldName] = fieldSchema
    } else {
      const nestedFiltered = filterSchemaFields(fieldSchema as any, filter, searchNameOnly, spec)
      if (nestedFiltered && nestedFiltered.properties && Object.keys(nestedFiltered.properties).length > 0) {
        filteredProperties[fieldName] = nestedFiltered
      }
    }
  }
  
  if (Object.keys(filteredProperties).length === 0) {
    return null
  }
  
  return {
    ...resolvedSchema,
    properties: filteredProperties
  }
}

function schemaHasMatchingFields(schema: any, filter: string, searchNameOnly: boolean, spec?: any): boolean {
  if (!filter) return true
  
  const resolvedSchema = spec && schema.$ref ? resolveRef(schema.$ref, spec) || schema : schema
  
  if (!resolvedSchema.properties) return false
  
  for (const [fieldName, fieldSchema] of Object.entries(resolvedSchema.properties)) {
    if (fieldMatchesSearch(fieldName, fieldSchema as any, filter, searchNameOnly, spec)) {
      return true
    }
    
    if (schemaHasMatchingFields(fieldSchema as any, filter, searchNameOnly, spec)) {
      return true
    }
  }
  
  return false
}

function endpointMatchesSearch(path: string, method: string, operation: any, filter: string, searchNameOnly: boolean, spec?: any): boolean {
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
  }
  
  return false
}

function SchemaViewer({ 
  schema, 
  name, 
  level = 0, 
  spec, 
  filter, 
  searchNameOnly 
}: { 
  schema: any; 
  name: string; 
  level?: number; 
  spec?: any;
  filter?: string;
  searchNameOnly?: boolean;
}) {
  const { t } = useSettings()
  const [expanded, setExpanded] = useState(level < 2)

  if (!schema) return null

  const resolvedSchema = spec && schema.$ref ? resolveRef(schema.$ref, spec) || schema : schema

  const hasProperties = resolvedSchema.properties && Object.keys(resolvedSchema.properties).length > 0
  const isArray = resolvedSchema.type === 'array'
  const isObject = resolvedSchema.type === 'object' || hasProperties
  const hasEnum = resolvedSchema.enum && resolvedSchema.enum.length > 0
  const hasExample = resolvedSchema.example !== undefined
  const hasAllOf = resolvedSchema.allOf && resolvedSchema.allOf.length > 0
  const hasOneOf = resolvedSchema.oneOf && resolvedSchema.oneOf.length > 0
  const hasAnyOf = resolvedSchema.anyOf && resolvedSchema.anyOf.length > 0
  const hasItems = isArray && resolvedSchema.items

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t.toasts.copiedToClipboard)
  }

  return (
    <div className={`${level > 0 ? 'ml-4 border-l-2 border-muted pl-4' : ''} space-y-2`}>
      <div className="flex items-start gap-2">
        {(hasProperties || hasItems || hasAllOf || hasOneOf || hasAnyOf) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CaretRight 
              size={16} 
              weight="bold" 
              className={`transition-transform ${expanded ? 'rotate-90' : ''}`} 
            />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono text-sm font-semibold text-primary">{name}</code>
            {resolvedSchema.type && (
              <Badge variant="outline" className="text-xs">
                {isArray && resolvedSchema.items?.type ? `array[${resolvedSchema.items.type}]` : resolvedSchema.type}
              </Badge>
            )}
            {resolvedSchema.format && (
              <Badge variant="secondary" className="text-xs">
                {resolvedSchema.format}
              </Badge>
            )}
            {resolvedSchema.required && (
              <Badge variant="destructive" className="text-xs">{t.specification.required}</Badge>
            )}
            {resolvedSchema.nullable && (
              <Badge variant="outline" className="text-xs">{t.common.nullable}</Badge>
            )}
            {resolvedSchema.readOnly && (
              <Badge variant="outline" className="text-xs">{t.common.readOnly}</Badge>
            )}
            {resolvedSchema.writeOnly && (
              <Badge variant="outline" className="text-xs">{t.common.writeOnly}</Badge>
            )}
            {resolvedSchema.deprecated && (
              <Badge variant="destructive" className="text-xs">{t.common.deprecated}</Badge>
            )}
          </div>

          {resolvedSchema.title && (
            <p className="text-xs font-semibold text-foreground mt-1">{resolvedSchema.title}</p>
          )}

          {resolvedSchema.description && (
            <p className="text-sm text-muted-foreground mt-1">{resolvedSchema.description}</p>
          )}

          {(resolvedSchema.minimum !== undefined || resolvedSchema.maximum !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              {t.specification.range}: {resolvedSchema.minimum ?? '-∞'} to {resolvedSchema.maximum ?? '+∞'}
              {resolvedSchema.exclusiveMinimum && ' (exclusive min)'}
              {resolvedSchema.exclusiveMaximum && ' (exclusive max)'}
            </p>
          )}

          {(resolvedSchema.minLength !== undefined || resolvedSchema.maxLength !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              {t.specification.length}: {resolvedSchema.minLength ?? '0'} to {resolvedSchema.maxLength ?? '∞'}
            </p>
          )}

          {(resolvedSchema.minItems !== undefined || resolvedSchema.maxItems !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              {t.specification.arraySize}: {resolvedSchema.minItems ?? '0'} to {resolvedSchema.maxItems ?? '∞'} {t.specification.items}
            </p>
          )}

          {resolvedSchema.uniqueItems && (
            <p className="text-xs text-muted-foreground mt-1">{t.specification.itemsMustBeUnique}</p>
          )}

          {resolvedSchema.pattern && (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{t.specification.pattern}:</p>
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono flex-1">{resolvedSchema.pattern}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(resolvedSchema.pattern)}
              >
                <Copy size={12} />
              </Button>
            </div>
          )}

          {resolvedSchema.default !== undefined && (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{t.specification.default}:</p>
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                {JSON.stringify(resolvedSchema.default)}
              </code>
            </div>
          )}

          {hasEnum && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">{t.specification.possibleValues}:</p>
              <div className="flex flex-wrap gap-1">
                {resolvedSchema.enum.map((value: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs font-mono">
                    {JSON.stringify(value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hasExample && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">{t.specification.example}:</p>
              <div className="bg-muted rounded p-2 relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(JSON.stringify(resolvedSchema.example, null, 2))}
                >
                  <Copy size={12} />
                </Button>
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(resolvedSchema.example, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {expanded && hasProperties && (
            <div className="mt-3 space-y-2">
              {Object.entries(resolvedSchema.properties)
                .filter(([propName, propSchema]: [string, any]) => {
                  if (!filter) return true
                  return fieldMatchesSearch(propName, propSchema, filter, searchNameOnly || false, spec) ||
                         schemaHasMatchingFields(propSchema, filter, searchNameOnly || false, spec)
                })
                .map(([propName, propSchema]: [string, any]) => (
                  <SchemaViewer
                    key={propName}
                    name={propName}
                    schema={{
                      ...propSchema,
                      required: Array.isArray(resolvedSchema.required) && resolvedSchema.required.includes(propName)
                    }}
                    level={level + 1}
                    spec={spec}
                    filter={filter}
                    searchNameOnly={searchNameOnly}
                  />
                ))}
            </div>
          )}

          {expanded && hasItems && (
            <div className="mt-3">
              <SchemaViewer
                name="items"
                schema={resolvedSchema.items}
                level={level + 1}
                spec={spec}
                filter={filter}
                searchNameOnly={searchNameOnly}
              />
            </div>
          )}

          {expanded && hasAllOf && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t.specification.allOf}:</p>
              {resolvedSchema.allOf.map((subSchema: any, idx: number) => (
                <SchemaViewer
                  key={idx}
                  name={subSchema.$ref ? subSchema.$ref.split('/').pop() : `Schema ${idx + 1}`}
                  schema={subSchema}
                  level={level + 1}
                  spec={spec}
                  filter={filter}
                  searchNameOnly={searchNameOnly}
                />
              ))}
            </div>
          )}

          {expanded && hasOneOf && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t.specification.oneOf}:</p>
              {resolvedSchema.oneOf.map((subSchema: any, idx: number) => (
                <SchemaViewer
                  key={idx}
                  name={subSchema.$ref ? subSchema.$ref.split('/').pop() : `Option ${idx + 1}`}
                  schema={subSchema}
                  level={level + 1}
                  spec={spec}
                  filter={filter}
                  searchNameOnly={searchNameOnly}
                />
              ))}
            </div>
          )}

          {expanded && hasAnyOf && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t.specification.anyOf}:</p>
              {resolvedSchema.anyOf.map((subSchema: any, idx: number) => (
                <SchemaViewer
                  key={idx}
                  name={subSchema.$ref ? subSchema.$ref.split('/').pop() : `Option ${idx + 1}`}
                  schema={subSchema}
                  level={level + 1}
                  spec={spec}
                  filter={filter}
                  searchNameOnly={searchNameOnly}
                />
              ))}
            </div>
          )}

          {schema.$ref && (
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                → {t.specification.reference}: {schema.$ref.split('/').pop()}
              </Badge>
            </div>
          )}

          {resolvedSchema.additionalProperties === false && (
            <p className="text-xs text-muted-foreground mt-1 italic">{t.specification.noAdditionalProperties}</p>
          )}

          {resolvedSchema.additionalProperties && typeof resolvedSchema.additionalProperties === 'object' && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">{t.specification.additionalProperties}:</p>
              <div className="ml-2">
                <SchemaViewer
                  name="additionalProperties"
                  schema={resolvedSchema.additionalProperties}
                  level={level + 1}
                  spec={spec}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RequestBodyViewer({ requestBody, spec }: { requestBody: any; spec: any }) {
  const { t } = useSettings()
  
  if (!requestBody) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">{t.specification.requestBody}</h4>
        {requestBody.required && (
          <Badge variant="destructive" className="text-xs">{t.specification.required}</Badge>
        )}
      </div>
      {requestBody.description && (
        <p className="text-sm text-muted-foreground">{requestBody.description}</p>
      )}
      {requestBody.content && (
        <Tabs defaultValue={Object.keys(requestBody.content)[0]} className="w-full">
          <TabsList>
            {Object.keys(requestBody.content).map(contentType => (
              <TabsTrigger key={contentType} value={contentType} className="text-xs">
                {contentType}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(requestBody.content).map(([contentType, content]: [string, any]) => (
            <TabsContent key={contentType} value={contentType} className="mt-3">
              {content.schema && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-2">{t.specification.schema}:</p>
                    <div className="border rounded-lg p-4 bg-card">
                      <SchemaViewer name="body" schema={content.schema} spec={spec} />
                    </div>
                  </div>
                  
                  {content.schema.example && (
                    <div>
                      <p className="text-xs font-medium mb-2">{t.specification.exampleRequest}:</p>
                      <div className="bg-muted rounded p-3 relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(content.schema.example, null, 2))}
                        >
                          <Copy size={12} />
                        </Button>
                        <pre className="text-xs font-mono overflow-x-auto max-h-96">
                          {JSON.stringify(content.schema.example, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {content.examples && Object.keys(content.examples).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-2">{t.specification.examples}:</p>
                  <div className="space-y-3">
                    {Object.entries(content.examples).map(([exampleName, example]: [string, any]) => (
                      <div key={exampleName} className="space-y-1">
                        <p className="text-xs font-semibold">{exampleName}</p>
                        {example.description && (
                          <p className="text-xs text-muted-foreground">{example.description}</p>
                        )}
                        <div className="bg-muted rounded p-3 relative group">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(example.value, null, 2))}
                          >
                            <Copy size={12} />
                          </Button>
                          <pre className="text-xs font-mono overflow-x-auto max-h-96">
                            {JSON.stringify(example.value, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

function ResponseViewer({ responses, spec }: { responses: any; spec: any }) {
  const { t } = useSettings()
  
  if (!responses) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">{t.specification.responses}</h4>
      <Accordion type="multiple" className="space-y-2">
        {Object.entries(responses).map(([statusCode, responseRef]: [string, any]) => {
          const response = responseRef.$ref ? resolveRef(responseRef.$ref, spec) || responseRef : responseRef
          
          return (
            <AccordionItem 
              key={statusCode} 
              value={statusCode}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={statusCode.startsWith('2') ? 'default' : statusCode.startsWith('4') || statusCode.startsWith('5') ? 'destructive' : 'secondary'}
                    className="font-mono"
                  >
                    {statusCode}
                  </Badge>
                  <span className="text-sm">{response.description || t.specification.noDescription}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-4">
              {response.content && (
                <Tabs defaultValue={Object.keys(response.content)[0]} className="w-full">
                  <TabsList>
                    {Object.keys(response.content).map(contentType => (
                      <TabsTrigger key={contentType} value={contentType} className="text-xs">
                        {contentType}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(response.content).map(([contentType, content]: [string, any]) => (
                    <TabsContent key={contentType} value={contentType} className="mt-3">
                      {content.schema && (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium mb-2">{t.specification.schema}:</p>
                            <div className="border rounded-lg p-4 bg-card">
                              <SchemaViewer name="response" schema={content.schema} spec={spec} />
                            </div>
                          </div>
                          
                          {content.schema.example && (
                            <div>
                              <p className="text-xs font-medium mb-2">{t.specification.exampleResponse}:</p>
                              <div className="bg-muted rounded p-3 relative group">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => navigator.clipboard.writeText(JSON.stringify(content.schema.example, null, 2))}
                                >
                                  <Copy size={12} />
                                </Button>
                                <pre className="text-xs font-mono overflow-x-auto max-h-96">
                                  {JSON.stringify(content.schema.example, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {content.examples && Object.keys(content.examples).length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-2">{t.specification.examples}:</p>
                          <div className="space-y-3">
                            {Object.entries(content.examples).map(([exampleName, example]: [string, any]) => (
                              <div key={exampleName} className="space-y-1">
                                <p className="text-xs font-semibold">{exampleName}</p>
                                {example.description && (
                                  <p className="text-xs text-muted-foreground">{example.description}</p>
                                )}
                                <div className="bg-muted rounded p-3 relative group">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(example.value, null, 2))}
                                  >
                                    <Copy size={12} />
                                  </Button>
                                  <pre className="text-xs font-mono overflow-x-auto max-h-96">
                                    {JSON.stringify(example.value, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
              {response.headers && Object.keys(response.headers).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-2">{t.specification.responseHeaders}:</p>
                  <div className="space-y-2">
                    {Object.entries(response.headers).map(([headerName, header]: [string, any]) => (
                      <div key={headerName} className="border rounded-lg p-3 bg-card">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="font-mono text-sm font-semibold text-primary">{headerName}</code>
                          {header.schema?.type && (
                            <Badge variant="outline" className="text-xs">
                              {header.schema.type}
                            </Badge>
                          )}
                          {header.required && (
                            <Badge variant="destructive" className="text-xs">{t.specification.required}</Badge>
                          )}
                        </div>
                        {header.description && (
                          <p className="text-xs text-muted-foreground mt-1">{header.description}</p>
                        )}
                        {header.schema && (
                          <div className="mt-2 ml-2">
                            <SchemaViewer name={headerName} schema={header.schema} level={1} spec={spec} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

export function SpecificationTab({ api }: SpecificationTabProps) {
  const { t } = useSettings()
  const spec = api.parsedSpec
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [schemaFilter, setSchemaFilter] = useState('')
  const [searchNameOnly, setSearchNameOnly] = useState(false)
  const [endpointFilter, setEndpointFilter] = useState('')
  const [endpointSearchNameOnly, setEndpointSearchNameOnly] = useState(false)

  const description = spec?.info?.description || ''
  const descriptionLines = description.split('\n')
  const MAX_LINES = 5
  const shouldTruncate = descriptionLines.length > MAX_LINES
  const displayedDescription = shouldTruncate && !showFullDescription
    ? descriptionLines.slice(0, MAX_LINES).join('\n')
    : description

  if (!api.parsedSpec) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t.specification.noSpecification}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {description && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t.specification.description}</h2>
          <div className="space-y-3">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono">
              {displayedDescription}
              {shouldTruncate && !showFullDescription && '...'}
            </p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary"
              >
                {showFullDescription ? t.specification.showLess : t.specification.showMore}
              </Button>
            )}
          </div>
        </Card>
      )}

      {spec.info?.version && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t.specification.version}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base px-3 py-1 font-mono">
              {spec.info.version}
            </Badge>
          </div>
        </Card>
      )}

      {spec.info?.license && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t.specification.license}</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{t.specification.name}:</span>
              <span className="text-sm">{spec.info.license.name}</span>
            </div>
            {spec.info.license.url && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t.specification.url}:</span>
                <a 
                  href={spec.info.license.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {spec.info.license.url}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {spec.info?.contact && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t.specification.contact}</h2>
          <div className="space-y-2">
            {spec.info.contact.name && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t.specification.name}:</span>
                <span className="text-sm">{spec.info.contact.name}</span>
              </div>
            )}
            {spec.info.contact.email && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t.specification.email}:</span>
                <a 
                  href={`mailto:${spec.info.contact.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {spec.info.contact.email}
                </a>
              </div>
            )}
            {spec.info.contact.url && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t.specification.url}:</span>
                <a 
                  href={spec.info.contact.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {spec.info.contact.url}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {spec.servers && spec.servers.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t.specification.servers}</h2>
          <div className="space-y-2">
            {spec.servers.map((server: any, index: number) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <code className="text-sm font-mono">{server.url}</code>
                {server.description && (
                  <p className="text-xs text-muted-foreground mt-1">{server.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {spec.paths && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t.specification.endpoints}</h2>
          
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border space-y-3">
            <div className="relative">
              <MagnifyingGlass 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={t.specification.filterEndpoints}
                value={endpointFilter}
                onChange={(e) => setEndpointFilter(e.target.value)}
                className="pl-10 pr-10"
              />
              {endpointFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setEndpointFilter('')}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="endpoint-search-name-only" 
                checked={endpointSearchNameOnly}
                onCheckedChange={(checked) => setEndpointSearchNameOnly(checked === true)}
              />
              <Label htmlFor="endpoint-search-name-only" className="text-sm cursor-pointer">
                {t.specification.searchNameOnly}
              </Label>
            </div>
          </div>
          
          {(() => {
            const filteredEndpoints: Array<{ path: string; method: string; operation: any; operationId: string }> = []
            
            Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
              const methods = Object.keys(pathItem).filter(key =>
                ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(key.toLowerCase())
              )

              methods.forEach(method => {
                const operation = pathItem[method]
                if (endpointMatchesSearch(path, method, operation, endpointFilter, endpointSearchNameOnly, spec)) {
                  filteredEndpoints.push({
                    path,
                    method,
                    operation,
                    operationId: `${path}-${method}`
                  })
                }
              })
            })
            
            if (filteredEndpoints.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t.specification.noEndpointsMatch} &quot;{endpointFilter}&quot;</p>
                </div>
              )
            }
            
            return (
              <Accordion type="single" collapsible className="space-y-3">
                {filteredEndpoints.map(({ path, method, operation, operationId }) => (
                  <AccordionItem key={operationId} value={operationId} className="border rounded-lg">
                    <AccordionTrigger className="hover:no-underline px-4">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge className={`uppercase font-mono text-xs ${METHOD_COLORS[method.toLowerCase()]}`}>
                          {method}
                        </Badge>
                        <code className="text-sm font-mono">{path}</code>
                        {operation.summary && (
                          <span className="text-sm text-muted-foreground ml-auto mr-2 hidden md:block">
                            {operation.summary}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-6 pt-4">
                        {operation.summary && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">{t.specification.summary}</h4>
                            <p className="text-sm">{operation.summary}</p>
                          </div>
                        )}

                        {operation.description && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">{t.specification.description}</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {operation.description}
                            </p>
                          </div>
                        )}

                        {operation.tags && operation.tags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">{t.specification.tags}</h4>
                            <div className="flex flex-wrap gap-1">
                              {operation.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {operation.parameters && operation.parameters.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3">{t.specification.parameters}</h4>
                            <div className="space-y-3">
                              {operation.parameters.map((paramRef: any, idx: number) => {
                                const param = resolveParameter(paramRef, spec)
                                return (
                                  <div key={idx} className="border rounded-lg p-4 bg-card space-y-2">
                                    <div className="flex items-start gap-2">
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <code className="font-mono text-sm font-semibold text-primary">{param.name}</code>
                                          {param.schema?.type && (
                                            <Badge variant="outline" className="text-xs">
                                              {param.schema.type}
                                            </Badge>
                                          )}
                                          {param.schema?.format && (
                                            <Badge variant="secondary" className="text-xs">
                                              {param.schema.format}
                                            </Badge>
                                          )}
                                          <Badge variant="outline" className="text-xs capitalize">
                                            {t.specification.location}: {param.in}
                                          </Badge>
                                          {param.required && (
                                            <Badge variant="destructive" className="text-xs">{t.specification.required}</Badge>
                                          )}
                                          {param.deprecated && (
                                            <Badge variant="destructive" className="text-xs">{t.common.deprecated}</Badge>
                                          )}
                                          {param.allowEmptyValue && (
                                            <Badge variant="outline" className="text-xs">{t.specification.allowEmpty}</Badge>
                                          )}
                                        </div>
                                        
                                        {param.description && (
                                          <p className="text-sm text-muted-foreground">{param.description}</p>
                                        )}

                                        {(param.schema?.minimum !== undefined || param.schema?.maximum !== undefined) && (
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">{t.specification.range}:</p>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                              {param.schema.minimum ?? '-∞'} to {param.schema.maximum ?? '+∞'}
                                            </code>
                                          </div>
                                        )}

                                        {(param.schema?.minLength !== undefined || param.schema?.maxLength !== undefined) && (
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">{t.specification.length}:</p>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                              {param.schema.minLength ?? '0'} to {param.schema.maxLength ?? '∞'}
                                            </code>
                                          </div>
                                        )}

                                        {(param.schema?.minItems !== undefined || param.schema?.maxItems !== undefined) && (
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">{t.specification.arrayItems}:</p>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                              {param.schema.minItems ?? '0'} to {param.schema.maxItems ?? '∞'}
                                            </code>
                                          </div>
                                        )}

                                        {param.schema?.pattern && (
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">{t.specification.pattern}:</p>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono flex-1">
                                              {param.schema.pattern}
                                            </code>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={() => {
                                                navigator.clipboard.writeText(param.schema.pattern)
                                                toast.success(t.toasts.copiedToClipboard)
                                              }}
                                            >
                                              <Copy size={12} />
                                            </Button>
                                          </div>
                                        )}
                                        
                                        {param.schema?.enum && param.schema.enum.length > 0 && (
                                          <div>
                                            <p className="text-xs font-medium mb-1">{t.specification.possibleValues}:</p>
                                            <div className="flex flex-wrap gap-1">
                                              {param.schema.enum.map((value: any, enumIdx: number) => (
                                                <Badge key={enumIdx} variant="secondary" className="text-xs font-mono">
                                                  {JSON.stringify(value)}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {param.schema?.default !== undefined && (
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">{t.specification.default}:</p>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                              {JSON.stringify(param.schema.default)}
                                            </code>
                                          </div>
                                        )}
                                        
                                        {param.example !== undefined && (
                                          <div>
                                            <p className="text-xs font-medium mb-1">{t.specification.example}:</p>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono block">
                                              {JSON.stringify(param.example)}
                                            </code>
                                          </div>
                                        )}

                                        {param.examples && Object.keys(param.examples).length > 0 && (
                                          <div>
                                            <p className="text-xs font-medium mb-1">{t.specification.examples}:</p>
                                            <div className="space-y-1">
                                              {Object.entries(param.examples).map(([exName, ex]: [string, any]) => (
                                                <div key={exName} className="bg-muted rounded p-2">
                                                  <p className="text-xs font-semibold mb-1">{exName}</p>
                                                  {ex.description && (
                                                    <p className="text-xs text-muted-foreground mb-1">{ex.description}</p>
                                                  )}
                                                  <code className="text-xs font-mono">
                                                    {JSON.stringify(ex.value)}
                                                  </code>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {operation.requestBody && (
                          <RequestBodyViewer requestBody={operation.requestBody} spec={spec} />
                        )}

                        {operation.responses && (
                          <ResponseViewer responses={operation.responses} spec={spec} />
                        )}

                        {operation.security && operation.security.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">{t.specification.security}</h4>
                            <div className="space-y-1">
                              {operation.security.map((security: any, idx: number) => (
                                <div key={idx} className="text-xs bg-muted p-2 rounded">
                                  {Object.keys(security).join(', ')}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {operation.deprecated && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <p className="text-sm font-semibold text-destructive">
                              ⚠️ {t.specification.deprecatedEndpoint}
                            </p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )
          })()}
        </Card>
      )}

      {spec.components?.schemas && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t.specification.schemas}</h2>
          
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border space-y-3">
            <div className="relative">
              <MagnifyingGlass 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={t.specification.filterSchemas}
                value={schemaFilter}
                onChange={(e) => setSchemaFilter(e.target.value)}
                className="pl-10 pr-10"
              />
              {schemaFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setSchemaFilter('')}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="search-name-only" 
                checked={searchNameOnly}
                onCheckedChange={(checked) => setSearchNameOnly(checked === true)}
              />
              <Label htmlFor="search-name-only" className="text-sm cursor-pointer">
                {t.specification.searchNameOnly}
              </Label>
            </div>
          </div>
          {(() => {
            const filteredSchemas = Object.entries(spec.components.schemas).filter(
              ([_, schema]: [string, any]) => schemaHasMatchingFields(schema, schemaFilter, searchNameOnly, spec)
            )
            
            if (filteredSchemas.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t.specification.noSchemasMatch} &quot;{schemaFilter}&quot;</p>
                </div>
              )
            }
            
            return (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredSchemas.map(([name, schema]: [string, any]) => (
                  <AccordionItem key={name} value={name} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <code className="text-sm font-mono">{name}</code>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <SchemaViewer 
                        name={name} 
                        schema={schema} 
                        spec={spec} 
                        filter={schemaFilter}
                        searchNameOnly={searchNameOnly}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )
          })()}
        </Card>
      )}

      {spec.components?.securitySchemes && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t.specification.securitySchemes}</h2>
          <div className="space-y-3">
            {Object.entries(spec.components.securitySchemes).map(([name, scheme]: [string, any]) => (
              <div key={name} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <code className="font-mono text-sm font-semibold">{name}</code>
                  <Badge variant="secondary" className="text-xs">{scheme.type}</Badge>
                </div>
                {scheme.description && (
                  <p className="text-sm text-muted-foreground mb-2">{scheme.description}</p>
                )}
                <dl className="text-xs space-y-1">
                  {scheme.scheme && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">{t.specification.scheme}:</dt>
                      <dd className="font-mono">{scheme.scheme}</dd>
                    </div>
                  )}
                  {scheme.bearerFormat && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">{t.specification.format}:</dt>
                      <dd className="font-mono">{scheme.bearerFormat}</dd>
                    </div>
                  )}
                  {scheme.in && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">{t.specification.location}:</dt>
                      <dd className="font-mono">{scheme.in}</dd>
                    </div>
                  )}
                  {scheme.name && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">{t.specification.parameterName}:</dt>
                      <dd className="font-mono">{scheme.name}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
