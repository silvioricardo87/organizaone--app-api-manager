import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { APIContract } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface SpecificationTabProps {
  api: APIContract
}

export function SpecificationTab({ api }: SpecificationTabProps) {
  if (!api.parsedSpec) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No OpenAPI specification available for this API.</p>
      </Card>
    )
  }

  const spec = api.parsedSpec

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-display font-semibold mb-4">API Information</h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Title</dt>
            <dd className="mt-1 text-sm font-mono">{spec.info?.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Version</dt>
            <dd className="mt-1 text-sm font-mono">{spec.info?.version}</dd>
          </div>
          {spec.info?.description && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd className="mt-1 text-sm whitespace-pre-wrap">{spec.info.description}</dd>
            </div>
          )}
        </dl>
      </Card>

      {spec.servers && spec.servers.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Servers</h2>
          <div className="space-y-2">
            {spec.servers.map((server: any, index: number) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <p className="font-mono text-sm">{server.url}</p>
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
          <Accordion type="multiple" className="space-y-2">
            {Object.entries(spec.paths).map(([path, pathItem]: [string, any]) => {
              const methods = Object.keys(pathItem).filter(key =>
                ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(key.toLowerCase())
              )

              return (
                <AccordionItem key={path} value={path} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 flex-1">
                      <code className="text-sm">{path}</code>
                      <div className="flex gap-1 ml-auto mr-2">
                        {methods.map(method => (
                          <Badge
                            key={method}
                            variant="outline"
                            className="text-xs uppercase"
                          >
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {methods.map(method => {
                        const operation = pathItem[method]
                        return (
                          <div key={method} className="border-l-2 border-primary/20 pl-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="uppercase">{method}</Badge>
                              {operation.summary && (
                                <span className="text-sm">{operation.summary}</span>
                              )}
                            </div>
                            {operation.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {operation.description}
                              </p>
                            )}
                            {operation.parameters && operation.parameters.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium mb-2">Parameters:</p>
                                <div className="space-y-1">
                                  {operation.parameters.map((param: any, idx: number) => (
                                    <div key={idx} className="text-xs font-mono bg-muted p-2 rounded">
                                      <span className="font-semibold">{param.name}</span>
                                      <span className="text-muted-foreground"> ({param.in})</span>
                                      {param.required && (
                                        <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {operation.responses && (
                              <div className="mt-3">
                                <p className="text-xs font-medium mb-2">Responses:</p>
                                <div className="space-y-1">
                                  {Object.entries(operation.responses).map(([code, response]: [string, any]) => (
                                    <div key={code} className="text-xs bg-muted p-2 rounded">
                                      <Badge variant="outline" className="mr-2">{code}</Badge>
                                      {response.description}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </Card>
      )}

      {spec.components?.schemas && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Schemas</h2>
          <Accordion type="multiple" className="space-y-2">
            {Object.entries(spec.components.schemas).map(([name, schema]: [string, any]) => (
              <AccordionItem key={name} value={name} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <code className="text-sm">{name}</code>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4">
                    {schema.description && (
                      <p className="text-sm text-muted-foreground mb-3">{schema.description}</p>
                    )}
                    {schema.properties && (
                      <div className="space-y-2">
                        {Object.entries(schema.properties).map(([propName, propSchema]: [string, any]) => (
                          <div key={propName} className="text-xs font-mono bg-muted p-2 rounded">
                            <span className="font-semibold">{propName}</span>
                            <span className="text-muted-foreground"> : {propSchema.type || 'object'}</span>
                            {schema.required?.includes(propName) && (
                              <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                            )}
                            {propSchema.description && (
                              <p className="text-muted-foreground mt-1 font-sans">{propSchema.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}
    </div>
  )
}
