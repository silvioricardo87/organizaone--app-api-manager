import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, CaretRight } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { resolveRef } from '@/shared/lib/api-utils'
import { useSettings } from '@/shared/hooks/use-settings'
import { fieldMatchesSearch, schemaHasMatchingFields } from './schema-utils'

export function SchemaViewer({
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
    toast.success(t('toasts.copiedToClipboard'))
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
              <Badge variant="destructive" className="text-xs">{t('specification.required')}</Badge>
            )}
            {resolvedSchema.nullable && (
              <Badge variant="outline" className="text-xs">{t('common.nullable')}</Badge>
            )}
            {resolvedSchema.readOnly && (
              <Badge variant="outline" className="text-xs">{t('common.readOnly')}</Badge>
            )}
            {resolvedSchema.writeOnly && (
              <Badge variant="outline" className="text-xs">{t('common.writeOnly')}</Badge>
            )}
            {resolvedSchema.deprecated && (
              <Badge variant="destructive" className="text-xs">{t('common.deprecated')}</Badge>
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
              {t('specification.range')}: {resolvedSchema.minimum ?? '-\u221E'} to {resolvedSchema.maximum ?? '+\u221E'}
              {resolvedSchema.exclusiveMinimum && ' (exclusive min)'}
              {resolvedSchema.exclusiveMaximum && ' (exclusive max)'}
            </p>
          )}

          {(resolvedSchema.minLength !== undefined || resolvedSchema.maxLength !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('specification.length')}: {resolvedSchema.minLength ?? '0'} to {resolvedSchema.maxLength ?? '\u221E'}
            </p>
          )}

          {(resolvedSchema.minItems !== undefined || resolvedSchema.maxItems !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('specification.arraySize')}: {resolvedSchema.minItems ?? '0'} to {resolvedSchema.maxItems ?? '\u221E'} {t('specification.items')}
            </p>
          )}

          {resolvedSchema.uniqueItems && (
            <p className="text-xs text-muted-foreground mt-1">{t('specification.itemsMustBeUnique')}</p>
          )}

          {resolvedSchema.pattern && (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{t('specification.pattern')}:</p>
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
              <p className="text-xs text-muted-foreground">{t('specification.default')}:</p>
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                {JSON.stringify(resolvedSchema.default)}
              </code>
            </div>
          )}

          {hasEnum && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">{t('specification.possibleValues')}:</p>
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
              <p className="text-xs font-medium mb-1">{t('specification.example')}:</p>
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
              {(!filter || schemaHasMatchingFields(resolvedSchema.items, filter, searchNameOnly || false, spec)) && (
                <SchemaViewer
                  name="items"
                  schema={resolvedSchema.items}
                  level={level + 1}
                  spec={spec}
                  filter={filter}
                  searchNameOnly={searchNameOnly}
                />
              )}
            </div>
          )}

          {expanded && hasAllOf && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t('specification.allOf')}:</p>
              {resolvedSchema.allOf
                .filter((subSchema: any) => {
                  if (!filter) return true
                  return schemaHasMatchingFields(subSchema, filter, searchNameOnly || false, spec)
                })
                .map((subSchema: any, idx: number) => (
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
              <p className="text-xs font-medium text-muted-foreground">{t('specification.oneOf')}:</p>
              {resolvedSchema.oneOf
                .filter((subSchema: any) => {
                  if (!filter) return true
                  return schemaHasMatchingFields(subSchema, filter, searchNameOnly || false, spec)
                })
                .map((subSchema: any, idx: number) => (
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
              <p className="text-xs font-medium text-muted-foreground">{t('specification.anyOf')}:</p>
              {resolvedSchema.anyOf
                .filter((subSchema: any) => {
                  if (!filter) return true
                  return schemaHasMatchingFields(subSchema, filter, searchNameOnly || false, spec)
                })
                .map((subSchema: any, idx: number) => (
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
                → {t('specification.reference')}: {schema.$ref.split('/').pop()}
              </Badge>
            </div>
          )}

          {resolvedSchema.additionalProperties === false && (
            <p className="text-xs text-muted-foreground mt-1 italic">{t('specification.noAdditionalProperties')}</p>
          )}

          {resolvedSchema.additionalProperties && typeof resolvedSchema.additionalProperties === 'object' && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">{t('specification.additionalProperties')}:</p>
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
