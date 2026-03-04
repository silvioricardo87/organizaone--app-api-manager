import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy } from '@phosphor-icons/react'
import { useSettings } from '@/shared/hooks/use-settings'
import { SchemaViewer } from './SchemaViewer'

export function RequestBodyViewer({ requestBody, spec, filter, searchNameOnly }: { requestBody: any; spec: any; filter?: string; searchNameOnly?: boolean }) {
  const { t } = useSettings()

  if (!requestBody) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">{t('specification.requestBody')}</h4>
        {requestBody.required && (
          <Badge variant="destructive" className="text-xs">{t('specification.required')}</Badge>
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
                    <p className="text-xs font-medium mb-2">{t('specification.schema')}:</p>
                    <div className="border rounded-lg p-4 bg-card">
                      <SchemaViewer
                        name="body"
                        schema={content.schema}
                        spec={spec}
                        filter={filter}
                        searchNameOnly={searchNameOnly}
                      />
                    </div>
                  </div>

                  {content.schema.example && (
                    <div>
                      <p className="text-xs font-medium mb-2">{t('specification.exampleRequest')}:</p>
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
    </div>
  )
}
