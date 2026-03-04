import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Download, FileArrowDown, CheckCircle } from '@phosphor-icons/react'
import { APIContract } from '@/shared/lib/types'
import { toast } from 'sonner'
import { useSettings } from '@/shared/hooks/use-settings'

interface ExportViewProps {
  apis: APIContract[]
  onClose: () => void
}

export function ExportView({ apis, onClose }: ExportViewProps) {
  const { t } = useSettings()
  const [isProcessing, setIsProcessing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [exportData, setExportData] = useState<{ version: string; exportDate: string; apis: APIContract[] } | null>(null)
  const [downloaded, setDownloaded] = useState(false)

  // Start export process on mount
  useEffect(() => {
    let cancelled = false

    const runExport = async () => {
      setProgress(20)

      await new Promise(resolve => setTimeout(resolve, 300))
      if (cancelled) return
      setProgress(50)

      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        apis: apis,
      }

      setExportData(data)
      setProgress(80)

      await new Promise(resolve => setTimeout(resolve, 200))
      if (cancelled) return
      setProgress(100)
      setIsProcessing(false)
    }

    runExport()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConfirmExport = () => {
    if (!exportData) return

    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `all-apis-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDownloaded(true)

      toast.success(t('toasts.allApisExported'))
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error(t('toasts.errorExportingAll'))
    }
  }

  return (
    <div className="space-y-4 py-4">
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('settings.preparingExport')}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {!isProcessing && exportData && (
        <div className="space-y-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <CheckCircle size={24} weight="duotone" className="text-success mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">{t('settings.exportSummary')}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('settings.totalAPIs')}:</span>
                    <span className="font-medium">{exportData.apis.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('settings.exportDate')}:</span>
                    <span className="font-medium font-mono text-xs">
                      {new Date(exportData.exportDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('settings.version')}:</span>
                    <span className="font-medium font-mono text-xs">{exportData.version}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {downloaded && (
            <Card className="p-4 bg-success/10 border-success/20">
              <div className="flex items-center gap-3">
                <FileArrowDown size={24} weight="duotone" className="text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('settings.downloadReady')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.downloadReadyDescription')}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          {downloaded ? t('common.close') : t('common.cancel')}
        </Button>
        {!downloaded && !isProcessing && (
          <Button onClick={handleConfirmExport}>
            <Download size={16} weight="duotone" className="mr-2" />
            {t('settings.downloadFile')}
          </Button>
        )}
      </div>
    </div>
  )
}
