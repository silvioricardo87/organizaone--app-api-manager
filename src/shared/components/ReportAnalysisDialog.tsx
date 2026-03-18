import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UploadSimple, CheckCircle, XCircle, FileText } from '@phosphor-icons/react'
import { APIContract } from '@/shared/lib/types'
import { parseCSV, validateReportAgainstPCMRules } from '@/shared/lib/pcm-csv-validator'
import { ALL_PCM_RULES } from '@/shared/lib/pcm-rules-data'
import { detectAPIFamily } from '@/shared/lib/pcm-field-generator'
import { extractEndpoints } from '@/shared/lib/api-utils'
import { useSettings } from '@/shared/hooks/use-settings'

interface ReportAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  api: APIContract
}

type ReportFormat = 'fvp' | 'pcm' | 'unknown'

interface AnalysisResult {
  format: ReportFormat
  rowCount: number
  headers: string[]
  pcmValidation: ReturnType<typeof validateReportAgainstPCMRules> | null
  matchedEndpoints: string[]
  unmatchedEndpoints: string[]
}

function detectFormat(headers: string[]): ReportFormat {
  const lower = headers.map(h => h.toLowerCase())
  if (lower.includes('api_family')) return 'fvp'
  if (lower.includes('reportid')) return 'pcm'
  return 'unknown'
}

export function ReportAnalysisDialog({ open, onOpenChange, api }: ReportAnalysisDialogProps) {
  const { t } = useSettings()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setIsProcessing(true)

    try {
      const text = await f.text()
      const rows = parseCSV(text)
      if (rows.length === 0) {
        setResult(null)
        return
      }

      const headers = Object.keys(rows[0])
      const format = detectFormat(headers)

      // Get applicable PCM rules
      const endpoints = api.parsedSpec ? extractEndpoints(api.parsedSpec) : []
      const family = detectAPIFamily(api.name, endpoints)
      const applicableRules = ALL_PCM_RULES.filter(rule => !rule.apiFamily || rule.apiFamily === family?.family)

      // PCM validation
      const pcmValidation = validateReportAgainstPCMRules(rows, applicableRules)

      // Endpoint matching
      const apiEndpoints = endpoints.flatMap(ep => ep.methods.map(m => `${m.toUpperCase()} ${ep.path}`))
      const reportEndpoints = new Set<string>()

      if (format === 'fvp') {
        for (const row of rows) {
          const ep = (row as Record<string, string>).endpoint
          if (ep) reportEndpoints.add(ep)
        }
      } else if (format === 'pcm') {
        for (const row of rows) {
          const ep = (row as Record<string, string>).endpoint
          const method = (row as Record<string, string>).httpmethod
          if (ep && method) reportEndpoints.add(`${method.toUpperCase()} ${ep}`)
        }
      }

      const apiEndpointPaths = endpoints.map(ep => ep.path)
      const matchedEndpoints = [...reportEndpoints].filter(re => {
        const path = re.includes(' ') ? re.split(' ')[1] : re
        return apiEndpointPaths.some(aep => path.includes(aep.replace(/\{[^}]+\}/g, '')))
      })
      const unmatchedEndpoints = [...reportEndpoints].filter(re => !matchedEndpoints.includes(re))

      // suppress unused variable warning
      void apiEndpoints

      setResult({
        format,
        rowCount: rows.length,
        headers,
        pcmValidation,
        matchedEndpoints,
        unmatchedEndpoints,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('pcm.analyzeReport')}</DialogTitle>
          <DialogDescription>{t('pcm.analyzeReportDesc')}</DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
              <div className="flex flex-col items-center">
                <UploadSimple size={32} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('pcm.uploadCSVFile')}</p>
              </div>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
            {isProcessing && <p className="text-sm">{t('pcm.processing')}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-muted-foreground" />
              <span className="text-sm font-medium">{file?.name}</span>
              <Badge variant={result.format === 'fvp' ? 'default' : result.format === 'pcm' ? 'secondary' : 'outline'}>
                {result.format.toUpperCase()}
              </Badge>
              <Badge variant="outline">{result.rowCount} {t('pcm.totalRecords').toLowerCase()}</Badge>
            </div>

            {/* Endpoint matching */}
            <Card className="p-4 space-y-2">
              <h4 className="font-medium">{t('pcm.endpointCoverage')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                    <CheckCircle size={14} className="inline mr-1" weight="bold" />
                    {t('pcm.matched')} ({result.matchedEndpoints.length})
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.matchedEndpoints.slice(0, 10).map((ep, i) => (
                      <p key={i} className="text-xs font-mono truncate">{ep}</p>
                    ))}
                    {result.matchedEndpoints.length > 10 && (
                      <p className="text-xs text-muted-foreground">+{result.matchedEndpoints.length - 10} more</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">
                    <XCircle size={14} className="inline mr-1" weight="bold" />
                    {t('pcm.unmatched')} ({result.unmatchedEndpoints.length})
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.unmatchedEndpoints.slice(0, 10).map((ep, i) => (
                      <p key={i} className="text-xs font-mono truncate">{ep}</p>
                    ))}
                    {result.unmatchedEndpoints.length > 10 && (
                      <p className="text-xs text-muted-foreground">+{result.unmatchedEndpoints.length - 10} more</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* PCM validation */}
            {result.pcmValidation && (
              <Card className="p-4 space-y-3">
                <h4 className="font-medium">{t('pcmCompliance.pcmCrossValidation')}</h4>

                {result.pcmValidation.mandatoryMissing.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                      {t('pcmCompliance.mandatoryMissing')} ({result.pcmValidation.mandatoryMissing.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.pcmValidation.mandatoryMissing.map(item => (
                        <Badge key={item.field} variant="destructive" className="text-xs">{item.field}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.pcmValidation.fieldsInReportAndPCM.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                      {t('pcmCompliance.fieldsInReportAndPCM')} ({result.pcmValidation.fieldsInReportAndPCM.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.pcmValidation.fieldsInReportAndPCM.map(field => (
                        <Badge key={field} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20">{field}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.pcmValidation.fieldsInReportNotPCM.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                      {t('pcmCompliance.fieldsInReportNotPCM')} ({result.pcmValidation.fieldsInReportNotPCM.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.pcmValidation.fieldsInReportNotPCM.map(field => (
                        <Badge key={field} variant="outline" className="text-xs">{field}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>{t('common.close')}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
