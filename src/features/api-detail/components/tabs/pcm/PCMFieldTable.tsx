import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash, Pencil } from '@phosphor-icons/react'
import { PCMField } from '@/shared/lib/types'
import { useSettings } from '@/shared/hooks/use-settings'

interface PCMFieldTableProps {
  fields: PCMField[]
  onEdit: (field: PCMField) => void
  onDelete: (fieldId: string) => void
}

export function PCMFieldTable({ fields, onEdit, onDelete }: PCMFieldTableProps) {
  const { t } = useSettings()

  if (fields.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('pcm.noFields')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {fields.map(pcmField => (
        <Card key={pcmField.id} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary text-primary-foreground">{pcmField.method}</Badge>
                <code className="text-sm font-mono">{pcmField.endpoint}</code>
                <Badge variant="outline">{pcmField.field}</Badge>
                {pcmField.isCustomField && (
                  <Badge variant="secondary" className="text-xs">
                    {t('pcm.customField')}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">{t('pcm.definition')}:</span>
                  <p>{pcmField.definition || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">{t('pcm.fillingRule')}:</span>
                  <p>{pcmField.fillingRule || '-'}</p>
                </div>
                {pcmField.roles.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">{t('pcm.roles')}:</span>
                    <p>{pcmField.roles.join(', ')}</p>
                  </div>
                )}
                {pcmField.httpCodes.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">{t('pcm.httpCodes')}:</span>
                    <p>{pcmField.httpCodes.join(', ')}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-muted-foreground">{t('pcm.mandatory')}:</span>
                  <Badge variant="outline" className="ml-2">
                    {pcmField.mandatory === 'none' ? '-' : t(`badges.${pcmField.mandatory}`)}
                  </Badge>
                </div>
                {pcmField.maxSize && (
                  <div>
                    <span className="font-medium text-muted-foreground">{t('pcm.maxSize')}:</span>
                    <p>{pcmField.maxSize}</p>
                  </div>
                )}
              </div>

              {pcmField.example && (
                <div className="p-3 bg-muted rounded-lg">
                  <span className="text-xs font-medium text-muted-foreground">{t('pcm.example')}:</span>
                  <pre className="text-xs font-mono mt-1">{pcmField.example}</pre>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(pcmField)}>
                <Pencil size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(pcmField.id)}>
                <Trash size={18} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
