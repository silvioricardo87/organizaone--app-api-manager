import { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, XCircle, Info } from '@phosphor-icons/react'
import { APIContract } from '@/shared/lib/types'
import { generateComplianceReport } from '@/shared/lib/pcm-compliance'
import { useSettings } from '@/shared/hooks/use-settings'

interface PCMComplianceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  api: APIContract
  pcmApi: APIContract
  onProceed: () => void
}

export function PCMComplianceDialog({ open, onOpenChange, api, pcmApi, onProceed }: PCMComplianceDialogProps) {
  const { t } = useSettings()

  const report = useMemo(() => generateComplianceReport(api, pcmApi), [api, pcmApi])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('pcmCompliance.compliancePreview')}</DialogTitle>
          <DialogDescription>
            {t('pcmCompliance.compliancePreviewDesc')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-2">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {report.overallScore}%
              </Badge>
              <div className="text-sm text-muted-foreground">
                {report.matchedFields}/{report.totalPCMFields} {t('pcmCompliance.matchedFields').toLowerCase()}
              </div>
            </div>

            {report.missingMandatoryFields.length > 0 && (
              <Card className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" />
                  {t('pcmCompliance.missingMandatory')} ({report.missingMandatoryFields.length})
                </h4>
                <div className="space-y-1">
                  {report.missingMandatoryFields.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-1">
                      <code className="font-mono text-red-600 dark:text-red-400">{item.field}</code>
                      {item.rule?.apiFamily && <Badge variant="outline" className="text-xs">{item.rule.apiFamily}</Badge>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {report.matchedFields > 0 && (
              <Card className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  {t('pcmCompliance.matchedFields')} ({report.matchedFields})
                </h4>
                <div className="space-y-1">
                  {[...new Set(report.matchedFieldsList.map(m => m.field))].map(field => (
                    <div key={field} className="flex items-center gap-2 text-sm p-1">
                      <code className="font-mono text-green-600 dark:text-green-400">{field}</code>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
              <Info size={16} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{t('pcmCompliance.compliancePreviewHint')}</span>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
          <Button onClick={onProceed}>
            {t('common.continue')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
