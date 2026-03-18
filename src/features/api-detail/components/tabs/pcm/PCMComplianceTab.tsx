import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Warning } from '@phosphor-icons/react'
import { APIContract } from '@/shared/lib/types'
import { findPCMReferenceAPI } from '@/shared/lib/pcm-reference'
import { generateComplianceReport } from '@/shared/lib/pcm-compliance'
import { useSettings } from '@/shared/hooks/use-settings'

interface PCMComplianceTabProps {
  api: APIContract
  apis: APIContract[]
}

export function PCMComplianceTab({ api, apis }: PCMComplianceTabProps) {
  const { t } = useSettings()
  const pcmApi = findPCMReferenceAPI(apis)

  const report = useMemo(() => {
    if (!pcmApi) return null
    return generateComplianceReport(api, pcmApi)
  }, [api, pcmApi])

  if (!pcmApi) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('pcmCompliance.noPCMReference')}</p>
      </Card>
    )
  }

  if (!report) return null

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{t('pcmCompliance.complianceScore')}</h3>
          <span className="text-2xl font-bold">{report.overallScore}%</span>
        </div>
        <Progress value={report.overallScore} className="h-3" />
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <CheckCircle size={24} weight="duotone" className="mx-auto text-green-500 mb-1" />
          <p className="text-2xl font-bold">{report.matchedFields}</p>
          <p className="text-xs text-muted-foreground">{t('pcmCompliance.matchedFields')}</p>
        </Card>
        <Card className="p-4 text-center">
          <XCircle size={24} weight="duotone" className="mx-auto text-red-500 mb-1" />
          <p className="text-2xl font-bold">{report.missingMandatoryFields.length}</p>
          <p className="text-xs text-muted-foreground">{t('pcmCompliance.missingMandatory')}</p>
        </Card>
        <Card className="p-4 text-center">
          <Warning size={24} weight="duotone" className="mx-auto text-amber-500 mb-1" />
          <p className="text-2xl font-bold">{report.extraFields.length}</p>
          <p className="text-xs text-muted-foreground">{t('pcmCompliance.extraFields')}</p>
        </Card>
      </div>

      {report.missingMandatoryFields.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">{t('pcmCompliance.missingMandatory')}</h4>
          <div className="space-y-2">
            {report.missingMandatoryFields.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded">
                <XCircle size={16} className="text-red-500 shrink-0" />
                <code className="text-sm font-mono">{item.field}</code>
                {item.rule && (
                  <span className="text-xs text-muted-foreground truncate">{item.rule.description}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.matchedFieldsList.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">{t('pcmCompliance.matchedFields')}</h4>
          <div className="space-y-1">
            {[...new Set(report.matchedFieldsList.map(m => m.field))].map(field => (
              <div key={field} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/10 rounded">
                <CheckCircle size={16} className="text-green-500 shrink-0" />
                <code className="text-sm font-mono">{field}</code>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
