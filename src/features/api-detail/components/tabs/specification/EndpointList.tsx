import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Copy, MagnifyingGlass, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { resolveParameter } from '@/shared/lib/api-utils'
import { useSettings } from '@/shared/hooks/use-settings'
import { endpointMatchesSearch, METHOD_COLORS } from './schema-utils'
import { RequestBodyViewer } from './RequestBodyViewer'
import { ResponseViewer } from './ResponseViewer'

interface EndpointListProps {
  spec: any
  endpointFilter: string
  setEndpointFilter: (value: string) => void
  endpointSearchNameOnly: boolean
  setEndpointSearchNameOnly: (value: boolean) => void
}

export function EndpointList({
  spec,
  endpointFilter,
  setEndpointFilter,
  endpointSearchNameOnly,
  setEndpointSearchNameOnly
}: EndpointListProps) {
  const { t } = useSettings()

  if (!spec.paths) return null

  return (
    <Card className="p-6">
      <h2 className="text-xl font-display font-semibold mb-4">{t('specification.endpoints')}</h2>

      <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border space-y-3">
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={t('specification.filterEndpoints')}
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
            {t('specification.searchNameOnly')}
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
              <p>{t('specification.noEndpointsMatch')} &quot;{endpointFilter}&quot;</p>
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
                        <h4 className="text-sm font-semibold mb-1">{t('specification.summary')}</h4>
                        <p className="text-sm">{operation.summary}</p>
                      </div>
                    )}

                    {operation.description && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">{t('specification.description')}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {operation.description}
                        </p>
                      </div>
                    )}

                    {operation.tags && operation.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">{t('specification.tags')}</h4>
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
                        <h4 className="text-sm font-semibold mb-3">{t('specification.parameters')}</h4>
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
                                        {t('specification.location')}: {param.in}
                                      </Badge>
                                      {param.required && (
                                        <Badge variant="destructive" className="text-xs">{t('specification.required')}</Badge>
                                      )}
                                      {param.deprecated && (
                                        <Badge variant="destructive" className="text-xs">{t('common.deprecated')}</Badge>
                                      )}
                                      {param.allowEmptyValue && (
                                        <Badge variant="outline" className="text-xs">{t('specification.allowEmpty')}</Badge>
                                      )}
                                    </div>

                                    {param.description && (
                                      <p className="text-sm text-muted-foreground">{param.description}</p>
                                    )}

                                    {(param.schema?.minimum !== undefined || param.schema?.maximum !== undefined) && (
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">{t('specification.range')}:</p>
                                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                          {param.schema.minimum ?? '-\u221E'} to {param.schema.maximum ?? '+\u221E'}
                                        </code>
                                      </div>
                                    )}

                                    {(param.schema?.minLength !== undefined || param.schema?.maxLength !== undefined) && (
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">{t('specification.length')}:</p>
                                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                          {param.schema.minLength ?? '0'} to {param.schema.maxLength ?? '\u221E'}
                                        </code>
                                      </div>
                                    )}

                                    {(param.schema?.minItems !== undefined || param.schema?.maxItems !== undefined) && (
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">{t('specification.arrayItems')}:</p>
                                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                          {param.schema.minItems ?? '0'} to {param.schema.maxItems ?? '\u221E'}
                                        </code>
                                      </div>
                                    )}

                                    {param.schema?.pattern && (
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">{t('specification.pattern')}:</p>
                                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono flex-1">
                                          {param.schema.pattern}
                                        </code>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => {
                                            navigator.clipboard.writeText(param.schema.pattern)
                                            toast.success(t('toasts.copiedToClipboard'))
                                          }}
                                        >
                                          <Copy size={12} />
                                        </Button>
                                      </div>
                                    )}

                                    {param.schema?.enum && param.schema.enum.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium mb-1">{t('specification.possibleValues')}:</p>
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
                                        <p className="text-xs text-muted-foreground">{t('specification.default')}:</p>
                                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                          {JSON.stringify(param.schema.default)}
                                        </code>
                                      </div>
                                    )}

                                    {param.example !== undefined && (
                                      <div>
                                        <p className="text-xs font-medium mb-1">{t('specification.example')}:</p>
                                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono block">
                                          {JSON.stringify(param.example)}
                                        </code>
                                      </div>
                                    )}

                                    {param.examples && Object.keys(param.examples).length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium mb-1">{t('specification.examples')}:</p>
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
                      <RequestBodyViewer
                        requestBody={operation.requestBody}
                        spec={spec}
                        filter={endpointFilter}
                        searchNameOnly={endpointSearchNameOnly}
                      />
                    )}

                    {operation.responses && (
                      <ResponseViewer
                        responses={operation.responses}
                        spec={spec}
                        filter={endpointFilter}
                        searchNameOnly={endpointSearchNameOnly}
                      />
                    )}

                    {operation.security && operation.security.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">{t('specification.security')}</h4>
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
                          {'\u26A0\uFE0F'} {t('specification.deprecatedEndpoint')}
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
  )
}
