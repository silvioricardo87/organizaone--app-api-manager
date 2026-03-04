import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { APIContract } from '@/shared/lib/types'
import { MagnifyingGlass, X, Code } from '@phosphor-icons/react'
import { useSettings } from '@/shared/hooks/use-settings'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { schemaHasMatchingFields } from './schema-utils'
import { SchemaViewer } from './SchemaViewer'
import { EndpointList } from './EndpointList'

interface SpecificationTabProps {
  api: APIContract
}

export function SpecificationTab({ api }: SpecificationTabProps) {
  const { t } = useSettings()
  const spec = api.parsedSpec
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showRawDescription, setShowRawDescription] = useState(false)
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

  const parseMarkdown = (text: string) => {
    try {
      const html = marked.parse(text, { breaks: true, gfm: true })
      // Content is sanitized with DOMPurify before rendering
      return DOMPurify.sanitize(html as string)
    } catch {
      return ''
    }
  }

  if (!api.parsedSpec) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('specification.noSpecification')}</p>
      </Card>
    )
  }

  // Sanitized HTML for the description section
  const sanitizedDescriptionHtml = parseMarkdown(displayedDescription)

  return (
    <div className="space-y-6">
      {description && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">{t('specification.description')}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawDescription(!showRawDescription)}
              className="gap-2"
            >
              <Code size={16} weight={showRawDescription ? "fill" : "regular"} />
              {showRawDescription ? t('specification.showFormatted') : t('specification.showRaw')}
            </Button>
          </div>
          <div className="space-y-3">
            {showRawDescription ? (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono bg-muted p-4 rounded-lg w-full">
                {displayedDescription}
                {shouldTruncate && !showFullDescription && '...'}
              </p>
            ) : (
              <div
                className="prose prose-sm md:prose-base max-w-none w-full dark:prose-invert prose-headings:font-display prose-headings:font-semibold prose-a:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-p:max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedDescriptionHtml }}
              />
            )}
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary"
              >
                {showFullDescription ? t('specification.showLess') : t('specification.showMore')}
              </Button>
            )}
          </div>
        </Card>
      )}

      {spec.info?.version && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t('specification.version')}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base px-3 py-1 font-mono">
              {spec.info.version}
            </Badge>
          </div>
        </Card>
      )}

      {spec.info?.license && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t('specification.license')}</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{t('specification.name')}:</span>
              <span className="text-sm">{spec.info.license.name}</span>
            </div>
            {spec.info.license.url && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t('specification.url')}:</span>
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
          <h2 className="text-xl font-display font-semibold mb-4">{t('specification.contact')}</h2>
          <div className="space-y-2">
            {spec.info.contact.name && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t('specification.name')}:</span>
                <span className="text-sm">{spec.info.contact.name}</span>
              </div>
            )}
            {spec.info.contact.email && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t('specification.email')}:</span>
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
                <span className="text-sm font-semibold">{t('specification.url')}:</span>
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
          <h2 className="text-xl font-display font-semibold mb-4">{t('specification.servers')}</h2>
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

      <EndpointList
        spec={spec}
        endpointFilter={endpointFilter}
        setEndpointFilter={setEndpointFilter}
        endpointSearchNameOnly={endpointSearchNameOnly}
        setEndpointSearchNameOnly={setEndpointSearchNameOnly}
      />

      {spec.components?.schemas && (
        <Card className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">{t('specification.schemas')}</h2>

          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border space-y-3">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={t('specification.filterSchemas')}
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
                {t('specification.searchNameOnly')}
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
                  <p>{t('specification.noSchemasMatch')} &quot;{schemaFilter}&quot;</p>
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
          <h2 className="text-xl font-display font-semibold mb-4">{t('specification.securitySchemes')}</h2>
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
                      <dt className="text-muted-foreground">{t('specification.scheme')}:</dt>
                      <dd className="font-mono">{scheme.scheme}</dd>
                    </div>
                  )}
                  {scheme.bearerFormat && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">{t('specification.format')}:</dt>
                      <dd className="font-mono">{scheme.bearerFormat}</dd>
                    </div>
                  )}
                  {scheme.in && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">{t('specification.location')}:</dt>
                      <dd className="font-mono">{scheme.in}</dd>
                    </div>
                  )}
                  {scheme.name && (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">{t('specification.parameterName')}:</dt>
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
