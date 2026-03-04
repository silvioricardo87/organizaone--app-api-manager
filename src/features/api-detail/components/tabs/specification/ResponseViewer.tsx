import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy } from '@phosphor-icons/react'
import { resolveRef } from '@/shared/lib/api-utils'
import { useSettings } from '@/shared/hooks/use-settings'
import { SchemaViewer } from './SchemaViewer'

export function ResponseViewer({ responses, spec, filter, searchNameOnly }: { responses: any; spec: any; filter?: string; searchNameOnly?: boolean }) {
  const { t } = useSettings()

  if (!responses) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">{t('specification.responses')}</h4>
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
                  <span className="text-sm">{response.description || t('specification.noDescription')}</span>
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
                            <p className="text-xs font-medium mb-2">{t('specification.schema')}:</p>
                            <div className="border rounded-lg p-4 bg-card">
                              <SchemaViewer
                                name="response"
                                schema={content.schema}
                                spec={spec}
                                filter={filter}
                                searchNameOnly={searchNameOnly}
                              />
                            </div>
                          </div>

                          {content.schema.example && (
                            <div>
                              <p className="text-xs font-medium mb-2">{t('specification.exampleResponse')}:</p>
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
                          <p className="text-xs font-medium mb-2">{t('specification.examples')}:</p>
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
                  <p className="text-xs font-medium mb-2">{t('specification.responseHeaders')}:</p>
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
                            <Badge variant="destructive" className="text-xs">{t('specification.required')}</Badge>
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
