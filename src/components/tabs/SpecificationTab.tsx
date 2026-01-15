import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { APIContract } from '@/lib/types'
import { Copy, CaretRight } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { marked } from 'marked'

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

function SchemaViewer({ schema, name, level = 0 }: { schema: any; name: string; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2)

  if (!schema) return null

  const hasProperties = schema.properties && Object.keys(schema.properties).length > 0
  const isArray = schema.type === 'array'
  const isObject = schema.type === 'object' || hasProperties
  const hasEnum = schema.enum && schema.enum.length > 0
  const hasExample = schema.example !== undefined
  const hasAllOf = schema.allOf && schema.allOf.length > 0
  const hasOneOf = schema.oneOf && schema.oneOf.length > 0
  const hasAnyOf = schema.anyOf && schema.anyOf.length > 0

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className={`${level > 0 ? 'ml-4 border-l-2 border-muted pl-4' : ''} space-y-2`}>
      <div className="flex items-start gap-2">
        {(hasProperties || isArray || hasAllOf || hasOneOf || hasAnyOf) && (
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
            {schema.type && (
              <Badge variant="outline" className="text-xs">
                {isArray ? `array[${schema.items?.type || 'object'}]` : schema.type}
              </Badge>
            )}
            {schema.format && (
              <Badge variant="secondary" className="text-xs">
                {schema.format}
              </Badge>
            )}
            {schema.required && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
            {schema.nullable && (
              <Badge variant="outline" className="text-xs">Nullable</Badge>
            )}
            {schema.readOnly && (
              <Badge variant="outline" className="text-xs">Read-only</Badge>
            )}
            {schema.writeOnly && (
              <Badge variant="outline" className="text-xs">Write-only</Badge>
            )}
          </div>

          {schema.description && (
            <p className="text-sm text-muted-foreground mt-1">{schema.description}</p>
          )}

          {(schema.minimum !== undefined || schema.maximum !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              Range: {schema.minimum ?? '∞'} to {schema.maximum ?? '∞'}
            </p>
          )}

          {(schema.minLength !== undefined || schema.maxLength !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              Length: {schema.minLength ?? '0'} to {schema.maxLength ?? '∞'}
            </p>
          )}

          {schema.pattern && (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Pattern:</p>
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{schema.pattern}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(schema.pattern)}
              >
                <Copy size={12} />
              </Button>
            </div>
          )}

          {schema.default !== undefined && (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Default:</p>
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                {JSON.stringify(schema.default)}
              </code>
            </div>
          )}

          {hasEnum && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">Possible values:</p>
              <div className="flex flex-wrap gap-1">
                {schema.enum.map((value: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs font-mono">
                    {JSON.stringify(value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hasExample && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">Example:</p>
              <div className="bg-muted rounded p-2 relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(JSON.stringify(schema.example, null, 2))}
                >
                  <Copy size={12} />
                </Button>
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(schema.example, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {expanded && hasProperties && (
            <div className="mt-3 space-y-2">
              {Object.entries(schema.properties).map(([propName, propSchema]: [string, any]) => (
                <SchemaViewer
                  key={propName}
                  name={propName}
                  schema={{
                    ...propSchema,
                    required: schema.required?.includes(propName)
                  }}
                  level={level + 1}
                />
              ))}
            </div>
          )}

          {expanded && isArray && schema.items && (
            <div className="mt-3">
              <SchemaViewer
                name="items"
                schema={schema.items}
                level={level + 1}
              />
            </div>
          )}

          {expanded && hasAllOf && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">All of:</p>
              {schema.allOf.map((subSchema: any, idx: number) => (
                <SchemaViewer
                  key={idx}
                  name={subSchema.$ref ? subSchema.$ref.split('/').pop() : `Option ${idx + 1}`}
                  schema={subSchema}
                  level={level + 1}
                />
              ))}
            </div>
          )}

          {expanded && hasOneOf && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">One of:</p>
              {schema.oneOf.map((subSchema: any, idx: number) => (
                <SchemaViewer
                  key={idx}
                  name={subSchema.$ref ? subSchema.$ref.split('/').pop() : `Option ${idx + 1}`}
                  schema={subSchema}
                  level={level + 1}
                />
              ))}
            </div>
          )}

          {expanded && hasAnyOf && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Any of:</p>
              {schema.anyOf.map((subSchema: any, idx: number) => (
                <SchemaViewer
                  key={idx}
                  name={subSchema.$ref ? subSchema.$ref.split('/').pop() : `Option ${idx + 1}`}
                  schema={subSchema}
                  level={level + 1}
                />
              ))}
            </div>
          )}

          {schema.$ref && (
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                → {schema.$ref.split('/').pop()}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RequestBodyViewer({ requestBody }: { requestBody: any }) {
  if (!requestBody) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">Request Body</h4>
        {requestBody.required && (
          <Badge variant="destructive" className="text-xs">Required</Badge>
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
                <div className="border rounded-lg p-4 bg-card">
                  <SchemaViewer name="body" schema={content.schema} />
                </div>
              )}
              {content.examples && Object.keys(content.examples).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-2">Examples:</p>
                  <Accordion type="single" collapsible>
                    {Object.entries(content.examples).map(([exampleName, example]: [string, any]) => (
                      <AccordionItem key={exampleName} value={exampleName}>
                        <AccordionTrigger className="text-xs">{exampleName}</AccordionTrigger>
                        <AccordionContent>
                          {example.description && (
                            <p className="text-xs text-muted-foreground mb-2">{example.description}</p>
                          )}
                          <div className="bg-muted rounded p-2 relative group">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => navigator.clipboard.writeText(JSON.stringify(example.value, null, 2))}
                            >
                              <Copy size={12} />
                            </Button>
                            <pre className="text-xs font-mono overflow-x-auto">
                              {JSON.stringify(example.value, null, 2)}
                            </pre>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

function ResponseViewer({ responses }: { responses: any }) {
  if (!responses) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Responses</h4>
      <Accordion type="multiple" className="space-y-2">
        {Object.entries(responses).map(([statusCode, response]: [string, any]) => (
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
                <span className="text-sm">{response.description}</span>
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
                        <div className="border rounded-lg p-4 bg-card">
                          <SchemaViewer name="response" schema={content.schema} />
                        </div>
                      )}
                      {content.examples && Object.keys(content.examples).length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-2">Examples:</p>
                          <div className="space-y-2">
                            {Object.entries(content.examples).map(([exampleName, example]: [string, any]) => (
                              <div key={exampleName} className="space-y-1">
                                <p className="text-xs font-medium">{exampleName}</p>
                                {example.description && (
                                  <p className="text-xs text-muted-foreground">{example.description}</p>
                                )}
                                <div className="bg-muted rounded p-2 relative group">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(example.value, null, 2))}
                                  >
                                    <Copy size={12} />
                                  </Button>
                                  <pre className="text-xs font-mono overflow-x-auto">
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
                <div>
                  <p className="text-xs font-medium mb-2">Headers:</p>
                  <div className="space-y-1">
                    {Object.entries(response.headers).map(([headerName, header]: [string, any]) => (
                      <div key={headerName} className="text-xs bg-muted p-2 rounded">
                        <code className="font-semibold">{headerName}</code>
                        {header.description && (
                          <p className="text-muted-foreground mt-1">{header.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export function SpecificationTab({ api }: SpecificationTabProps) {
  const spec = api.parsedSpec

  const apiInfoMarkdown = useMemo(() => {
    if (!spec) return ''
    
    const lines: string[] = []
    
    lines.push(`## ${spec.info?.title || 'API Information'}`)
    lines.push('')
    lines.push(`**Version:** \`${spec.info?.version}\``)
    lines.push('')
    
    if (spec.info?.description) {
      lines.push(`### Description`)
      lines.push('')
      lines.push(spec.info.description)
      lines.push('')
    }
    
    if (spec.info?.contact) {
      lines.push(`### Contact Information`)
      lines.push('')
      if (spec.info.contact.name) {
        lines.push(`- **Name:** ${spec.info.contact.name}`)
      }
      if (spec.info.contact.email) {
        lines.push(`- **Email:** ${spec.info.contact.email}`)
      }
      if (spec.info.contact.url) {
        lines.push(`- **URL:** [${spec.info.contact.url}](${spec.info.contact.url})`)
      }
      lines.push('')
    }
    
    if (spec.info?.license) {
      lines.push(`### License`)
      lines.push('')
      lines.push(`- **Name:** ${spec.info.license.name}`)
      if (spec.info.license.url) {
        lines.push(`- **URL:** [${spec.info.license.url}](${spec.info.license.url})`)
      }
      lines.push('')
    }
    
    return marked(lines.join('\n'))
  }, [spec])

  if (!api.parsedSpec) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No OpenAPI specification available for this API.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div 
          className="prose prose-sm max-w-none prose-headings:font-display prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4 prose-p:text-sm prose-ul:text-sm prose-strong:font-semibold prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: apiInfoMarkdown }}
        />
      </Card>

      {spec.servers && spec.servers.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Servers</h2>
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
          <h2 className="text-xl font-display font-semibold mb-4">Endpoints</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {Object.entries(spec.paths).map(([path, pathItem]: [string, any]) => {
              const methods = Object.keys(pathItem).filter(key =>
                ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(key.toLowerCase())
              )

              return methods.map(method => {
                const operation = pathItem[method]
                const operationId = `${path}-${method}`

                return (
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
                            <h4 className="text-sm font-semibold mb-1">Summary</h4>
                            <p className="text-sm">{operation.summary}</p>
                          </div>
                        )}

                        {operation.description && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {operation.description}
                            </p>
                          </div>
                        )}

                        {operation.tags && operation.tags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Tags</h4>
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
                            <h4 className="text-sm font-semibold mb-3">Parameters</h4>
                            <div className="space-y-3">
                              {operation.parameters.map((param: any, idx: number) => (
                                <div key={idx} className="border rounded-lg p-3 bg-card">
                                  <SchemaViewer 
                                    name={param.name} 
                                    schema={{
                                      ...param.schema,
                                      description: param.description,
                                      required: param.required
                                    }}
                                  />
                                  <div className="mt-2 flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      in: {param.in}
                                    </Badge>
                                    {param.deprecated && (
                                      <Badge variant="destructive" className="text-xs">
                                        Deprecated
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {operation.requestBody && (
                          <RequestBodyViewer requestBody={operation.requestBody} />
                        )}

                        {operation.responses && (
                          <ResponseViewer responses={operation.responses} />
                        )}

                        {operation.security && operation.security.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Security</h4>
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
                              ⚠️ This endpoint is deprecated
                            </p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })
            })}
          </Accordion>
        </Card>
      )}

      {spec.components?.schemas && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Schemas</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {Object.entries(spec.components.schemas).map(([name, schema]: [string, any]) => (
              <AccordionItem key={name} value={name} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <code className="text-sm font-mono">{name}</code>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <SchemaViewer name={name} schema={schema} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {spec.components?.securitySchemes && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Security Schemes</h2>
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
                      <dt className="text-muted-foreground">Scheme:</dt>
                      <dd className="font-mono">{scheme.scheme}</dd>
                    </div>
                  )}
                  {scheme.bearerFormat && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Format:</dt>
                      <dd className="font-mono">{scheme.bearerFormat}</dd>
                    </div>
                  )}
                  {scheme.in && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Location:</dt>
                      <dd className="font-mono">{scheme.in}</dd>
                    </div>
                  )}
                  {scheme.name && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Parameter name:</dt>
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
