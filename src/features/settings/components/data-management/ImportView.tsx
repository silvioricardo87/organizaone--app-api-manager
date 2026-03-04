import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Upload, X, CheckCircle, Warning, Database } from '@phosphor-icons/react'
import { APIContract } from '@/shared/lib/types'
import { generatePCMFields } from '@/shared/lib/pcm-field-generator'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useSettings } from '@/shared/hooks/use-settings'

interface ImportViewProps {
  apis: APIContract[]
  onImport: (apis: APIContract[]) => void
  onClose: () => void
  autoMapPCM: boolean
  mode: 'import' | 'sample'
}

export function ImportView({ apis, onImport, onClose, autoMapPCM: initialAutoMapPCM, mode }: ImportViewProps) {
  const { t } = useSettings()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importSummary, setImportSummary] = useState<{ toImport: APIContract[]; skipped: string[] } | null>(null)
  const [autoMapPCM, setAutoMapPCM] = useState(initialAutoMapPCM)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLoadSampleData = async () => {
    setIsProcessing(true)
    setProgress(20)

    try {
      const response = await fetch('/sample-data.json')
      if (!response.ok) throw new Error('Failed to fetch')

      setProgress(40)
      const data = await response.json()

      if (!Array.isArray(data.apis)) {
        toast.error(t('toasts.invalidFileFormat'))
        setIsProcessing(false)
        return
      }

      setProgress(60)

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

      setProgress(80)

      let apisWithPCM = apisToImport
      if (autoMapPCM) {
        apisWithPCM = apisToImport.map(api => {
          if (api.parsedSpec && (!api.pcmFields || api.pcmFields.length === 0)) {
            const { fields } = generatePCMFields(api.name, api.parsedSpec, api.version)
            if (fields.length > 0) {
              return { ...api, pcmFields: fields }
            }
          }
          return api
        })
      }

      if (apisWithPCM.length > 0) {
        onImport(apisWithPCM)
      }

      setProgress(100)

      toast.success(t('settings.sampleDataLoaded').replace('{count}', String(apisWithPCM.length)))

      if (skippedAPIs.length > 0) {
        toast.warning(`${t('toasts.duplicateAPI')}: ${skippedAPIs.slice(0, 3).join(', ')}${skippedAPIs.length > 3 ? '...' : ''}`)
      }

      setIsProcessing(false)
      onClose()
    } catch (error) {
      console.error('Error loading sample data:', error)
      toast.error(t('settings.sampleDataError'))
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/json') {
      toast.error(t('toasts.invalidFileFormat'))
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
        toast.error(t('toasts.invalidFileFormat'))
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
      toast.error(t('toasts.invalidFileFormat'))
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

    toast.success(t('toasts.allApisImported').replace('{count}', String(importSummary.toImport.length)))

    if (importSummary.skipped.length > 0) {
      toast.warning(`${t('toasts.duplicateAPI')}: ${importSummary.skipped.join(', ')}`)
    }

    setIsProcessing(false)
    onClose()
  }

  if (mode === 'sample') {
    return (
      <div className="space-y-4 py-4">
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Database size={24} weight="duotone" className="text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold mb-2">{t('settings.loadSampleData')}</h4>
              <p className="text-sm text-muted-foreground">{t('settings.loadSampleDataDescription')}</p>
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="auto-map-pcm"
                  checked={autoMapPCM}
                  onCheckedChange={(checked) => setAutoMapPCM(checked === true)}
                />
                <label
                  htmlFor="auto-map-pcm"
                  className="text-sm font-medium cursor-pointer"
                >
                  {t('settings.autoMapPCMOnImport')}
                </label>
              </div>
            </div>
          </div>
        </Card>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('settings.loadingSampleData')}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleLoadSampleData} disabled={isProcessing}>
            <Database size={16} weight="duotone" className="mr-2" />
            {t('settings.loadSampleData')}
          </Button>
        </div>
      </div>
    )
  }

  return (
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
                {t('importAPIDialog.selectFile')}
              </Button>
              <p className="text-sm text-muted-foreground">{t('importAPIDialog.dropFile')}</p>
              <p className="text-xs text-muted-foreground">{t('importAPIDialog.supportedFormats')}</p>
            </div>
          </>
        )}
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('settings.analyzingFile')}</span>
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
              <h4 className="font-semibold mb-2">{t('settings.importSummary')}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('settings.apisToImport')}:</span>
                  <span className="font-medium">{importSummary.toImport.length}</span>
                </div>
                {importSummary.skipped.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-warning">{t('settings.apisSkipped')}:</span>
                    <span className="font-medium text-warning">{importSummary.skipped.length}</span>
                  </div>
                )}
              </div>
              {importSummary.skipped.length > 0 && (
                <div className="mt-3 p-2 bg-warning/10 rounded text-xs">
                  <p className="font-medium text-warning mb-1">{t('settings.skippedReason')}</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    {importSummary.skipped.slice(0, 5).map((api, index) => (
                      <li key={index}>{api}</li>
                    ))}
                    {importSummary.skipped.length > 5 && (
                      <li>{t('settings.andMore').replace('{count}', String(importSummary.skipped.length - 5))}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        {selectedFile && !importSummary && (
          <Button onClick={handleAnalyzeFile} disabled={isProcessing}>
            {t('settings.analyzeFile')}
          </Button>
        )}
        {importSummary && (
          <Button
            onClick={handleConfirmImport}
            disabled={importSummary.toImport.length === 0 || isProcessing}
          >
            <Upload size={16} weight="duotone" className="mr-2" />
            {t('settings.confirmImport')}
          </Button>
        )}
      </div>
    </div>
  )
}
