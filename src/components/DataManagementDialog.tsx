import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Upload, Download, X, FileArrowDown, CheckCircle, Warning } from '@phosphor-icons/react'
import { APIContract } from '@/lib/types'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

interface DataManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apis: APIContract[]
  onImport: (apis: APIContract[]) => void
}

type ViewState = 'menu' | 'export' | 'import'

export function DataManagementDialog({ open, onOpenChange, apis, onImport }: DataManagementDialogProps) {
  const { t } = useSettings()
  const [viewState, setViewState] = useState<ViewState>('menu')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportData, setExportData] = useState<{ version: string; exportDate: string; apis: APIContract[] } | null>(null)
  const [importSummary, setImportSummary] = useState<{ toImport: APIContract[]; skipped: string[] } | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    setViewState('menu')
    setSelectedFile(null)
    setImportSummary(null)
    setExportData(null)
    setDownloadUrl(null)
    setProgress(0)
    setIsProcessing(false)
    onOpenChange(false)
  }

  const handleExportClick = async () => {
    setViewState('export')
    setIsProcessing(true)
    setProgress(20)

    await new Promise(resolve => setTimeout(resolve, 300))
    setProgress(50)

    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      apis: apis,
    }

    setExportData(data)
    setProgress(80)

    await new Promise(resolve => setTimeout(resolve, 200))
    setProgress(100)
    setIsProcessing(false)
  }

  const handleConfirmExport = () => {
    if (!exportData) return

    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      const a = document.createElement('a')
      a.href = url
      a.download = `all-apis-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.success(t.toasts.allApisExported)
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error(t.toasts.errorExportingAll)
    }
  }

  const handleImportClick = () => {
    setViewState('import')
  }

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/json') {
      toast.error(t.toasts.invalidFileFormat)
      return
    }
    setSelectedFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleAnalyzeFile = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(20)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setProgress(40)

      const text = await selectedFile.text()
      const data = JSON.parse(text)

      setProgress(60)

      if (!Array.isArray(data.apis)) {
        toast.error(t.toasts.invalidFileFormat)
        setIsProcessing(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      setProgress(80)

      const apisToImport: APIContract[] = []
      const skippedAPIs: string[] = []

      for (const api of data.apis) {
        const duplicate = apis.find(
          (existing) => existing.name === api.name && existing.version === api.version
        )

        if (duplicate) {
          skippedAPIs.push(`${api.name} (${api.version})`)
          continue
        }

        apisToImport.push(api)
      }

      setProgress(100)
      setImportSummary({ toImport: apisToImport, skipped: skippedAPIs })
      setIsProcessing(false)
    } catch (error) {
      console.error('Error analyzing file:', error)
      toast.error(t.toasts.invalidFileFormat)
      setIsProcessing(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!importSummary) return

    setIsProcessing(true)
    setProgress(30)

    await new Promise(resolve => setTimeout(resolve, 300))
    setProgress(70)

    onImport(importSummary.toImport)

    await new Promise(resolve => setTimeout(resolve, 200))
    setProgress(100)

    toast.success(t.toasts.allApisImported.replace('{count}', String(importSummary.toImport.length)))

    if (importSummary.skipped.length > 0) {
      toast.warning(`${t.toasts.duplicateAPI}: ${importSummary.skipped.join(', ')}`)
    }

    setIsProcessing(false)
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.settings.dataManagement}</DialogTitle>
          <DialogDescription>
            {viewState === 'menu' && t.settings.dataManagementDescription}
            {viewState === 'export' && t.settings.exportDescription}
            {viewState === 'import' && t.settings.importDescription}
          </DialogDescription>
        </DialogHeader>

        {viewState === 'menu' && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={handleExportClick}>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Download size={32} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1">{t.settings.exportData}</h3>
                  <p className="text-sm text-muted-foreground">{t.settings.exportDataDescription}</p>
                </div>
                <Button variant="outline" className="w-full">
                  {t.settings.exportData}
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={handleImportClick}>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-accent/10 rounded-full">
                  <Upload size={32} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1">{t.settings.importData}</h3>
                  <p className="text-sm text-muted-foreground">{t.settings.importDataDescription}</p>
                </div>
                <Button variant="outline" className="w-full">
                  {t.settings.importData}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {viewState === 'export' && (
          <div className="space-y-4 py-4">
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.settings.preparingExport}</span>
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
                      <h4 className="font-semibold mb-2">{t.settings.exportSummary}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.settings.totalAPIs}:</span>
                          <span className="font-medium">{exportData.apis.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.settings.exportDate}:</span>
                          <span className="font-medium font-mono text-xs">
                            {new Date(exportData.exportDate).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.settings.version}:</span>
                          <span className="font-medium font-mono text-xs">{exportData.version}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {downloadUrl && (
                  <Card className="p-4 bg-success/10 border-success/20">
                    <div className="flex items-center gap-3">
                      <FileArrowDown size={24} weight="duotone" className="text-success" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t.settings.downloadReady}</p>
                        <p className="text-xs text-muted-foreground">{t.settings.downloadReadyDescription}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                {downloadUrl ? t.common.close : t.common.cancel}
              </Button>
              {!downloadUrl && !isProcessing && (
                <Button onClick={handleConfirmExport}>
                  <Download size={16} weight="duotone" className="mr-2" />
                  {t.settings.downloadFile}
                </Button>
              )}
            </div>
          </div>
        )}

        {viewState === 'import' && (
          <div className="space-y-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload size={20} weight="duotone" className="text-primary" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setImportSummary(null)
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                    >
                      {t.importAPIDialog.selectFile}
                    </Button>
                    <p className="text-sm text-muted-foreground">{t.importAPIDialog.dropFile}</p>
                    <p className="text-xs text-muted-foreground">{t.importAPIDialog.supportedFormats}</p>
                  </div>
                </>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.settings.analyzingFile}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {importSummary && !isProcessing && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-start gap-3">
                  {importSummary.toImport.length > 0 ? (
                    <CheckCircle size={24} weight="duotone" className="text-success mt-0.5" />
                  ) : (
                    <Warning size={24} weight="duotone" className="text-warning mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{t.settings.importSummary}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.settings.apisToImport}:</span>
                        <span className="font-medium">{importSummary.toImport.length}</span>
                      </div>
                      {importSummary.skipped.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-warning">{t.settings.apisSkipped}:</span>
                          <span className="font-medium text-warning">{importSummary.skipped.length}</span>
                        </div>
                      )}
                    </div>
                    {importSummary.skipped.length > 0 && (
                      <div className="mt-3 p-2 bg-warning/10 rounded text-xs">
                        <p className="font-medium text-warning mb-1">{t.settings.skippedReason}</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                          {importSummary.skipped.slice(0, 5).map((api, index) => (
                            <li key={index}>{api}</li>
                          ))}
                          {importSummary.skipped.length > 5 && (
                            <li>{t.settings.andMore.replace('{count}', String(importSummary.skipped.length - 5))}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                {t.common.cancel}
              </Button>
              {selectedFile && !importSummary && (
                <Button onClick={handleAnalyzeFile} disabled={isProcessing}>
                  {t.settings.analyzeFile}
                </Button>
              )}
              {importSummary && (
                <Button 
                  onClick={handleConfirmImport} 
                  disabled={importSummary.toImport.length === 0 || isProcessing}
                >
                  <Upload size={16} weight="duotone" className="mr-2" />
                  {t.settings.confirmImport}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
