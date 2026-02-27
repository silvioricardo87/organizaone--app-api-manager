import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { UploadSimple, FilePdf, CheckCircle, Warning, X, Info } from '@phosphor-icons/react'
import { APIContract } from '@/lib/types'
import { parseCSV, validateReport, type ValidationResult } from '@/lib/pcm-csv-validator'
import { exportValidationPDF } from '@/lib/pcm-validation-pdf'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

interface ValidateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  api: APIContract
}

export function ValidateReportDialog({ open, onOpenChange, api }: ValidateReportDialogProps) {
  const { t, language } = useSettings()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    setSelectedFile(null)
    setResult(null)
    setProgress(0)
    setIsProcessing(false)
    onOpenChange(false)
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error(t.toasts.invalidFileFormat)
      return
    }
    setSelectedFile(file)
    setResult(null)
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
    if (file) handleFileSelect(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleValidate = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(20)

    try {
      const text = await selectedFile.text()
      setProgress(50)

      const rows = parseCSV(text)
      setProgress(70)

      if (rows.length === 0) {
        toast.error(t.pcm.csvParseError)
        setIsProcessing(false)
        return
      }

      const validationResult = validateReport(rows, api)
      setProgress(100)

      await new Promise(resolve => setTimeout(resolve, 200))
      setResult(validationResult)
      setIsProcessing(false)
    } catch (error) {
      console.error('Error validating CSV:', error)
      toast.error(t.pcm.csvParseError)
      setIsProcessing(false)
    }
  }

  const handleExportPDF = () => {
    if (!result) return
    exportValidationPDF(api, result, language)
    toast.success(t.pcm.pdfExported)
  }

  const severityIcon = (type: string) => {
    switch (type) {
      case 'error': return <Warning size={16} weight="fill" className="text-destructive" />
      case 'warning': return <Warning size={16} weight="fill" className="text-amber-500" />
      default: return <Info size={16} weight="fill" className="text-blue-500" />
    }
  }

  const severityBadge = (type: string) => {
    switch (type) {
      case 'error': return <Badge variant="destructive">{t.pcm.error}</Badge>
      case 'warning': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">{t.pcm.warning}</Badge>
      default: return <Badge variant="secondary">{t.pcm.info}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:!max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.pcm.validationTitle}</DialogTitle>
          <DialogDescription>{t.pcm.validationDescription}</DialogDescription>
        </DialogHeader>

        {!result && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UploadSimple size={20} weight="duotone" className="text-primary" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <UploadSimple size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <Button type="button" variant="outline">
                      {t.pcm.uploadCSV}
                    </Button>
                    <p className="text-sm text-muted-foreground">{t.importAPIDialog.dropFile}</p>
                    <p className="text-xs text-muted-foreground">CSV</p>
                  </div>
                </>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.pcm.processing}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleValidate} disabled={!selectedFile || isProcessing}>
                {t.pcm.validateReport}
              </Button>
            </div>
          </>
        )}

        {result && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{t.pcm.totalRecords}</p>
                <p className="text-2xl font-bold">{result.totalRecords}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{t.pcm.matchedRecords}</p>
                <p className="text-2xl font-bold text-green-600">{result.matchedRecords}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{t.pcm.unmatchedRecords}</p>
                <p className="text-2xl font-bold text-muted-foreground">{result.unmatchedRecords}</p>
              </Card>
            </div>

            {/* Date range */}
            {result.dateRange && (
              <Card className="p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">{t.pcm.dateRange}:</span>
                  <span className="font-mono text-xs">{result.dateRange.min} — {result.dateRange.max}</span>
                </div>
              </Card>
            )}

            {/* Pairing stats */}
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-3">{t.pcm.pairingStats}</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">{t.pcm.paired}</p>
                  <p className="text-lg font-bold text-green-600">{result.pairedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.pcm.unpaired}</p>
                  <p className="text-lg font-bold text-red-500">{result.unpairedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.pcm.pairedInconsistent}</p>
                  <p className="text-lg font-bold text-amber-500">{result.pairedInconsistentCount}</p>
                </div>
              </div>
            </Card>

            {/* Status distribution */}
            {Object.keys(result.statusCodeDistribution).length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-3">{t.pcm.statusDistribution}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.statusCodeDistribution)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([code, count]) => (
                      <Badge
                        key={code}
                        variant={parseInt(code) >= 400 ? 'destructive' : 'secondary'}
                        className="font-mono"
                      >
                        {code}: {count}
                      </Badge>
                    ))}
                </div>
              </Card>
            )}

            {/* Endpoint coverage */}
            {result.endpointCoverage.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold text-sm mb-3">{t.pcm.endpointCoverage}</h4>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {result.endpointCoverage.map((ep) => (
                    <div key={ep.endpoint} className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-muted/50">
                      {ep.inSpec && ep.inCSV ? (
                        <CheckCircle size={14} weight="fill" className="text-green-500 shrink-0" />
                      ) : ep.inCSV && !ep.inSpec ? (
                        <Warning size={14} weight="fill" className="text-amber-500 shrink-0" />
                      ) : (
                        <Info size={14} weight="fill" className="text-muted-foreground shrink-0" />
                      )}
                      <code className="font-mono truncate flex-1">{ep.endpoint}</code>
                      <span className="text-muted-foreground shrink-0">
                        {ep.csvCount > 0 ? `${ep.csvCount} calls` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Inconsistencies */}
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-3">{t.pcm.inconsistencies}</h4>
              {result.inconsistencies.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle size={16} weight="fill" />
                  {t.pcm.noInconsistencies}
                </div>
              ) : (
                <div className="space-y-2">
                  {result.inconsistencies.map((inc, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded bg-muted/50">
                      {severityIcon(inc.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {severityBadge(inc.type)}
                        </div>
                        <p className="text-xs text-muted-foreground">{inc.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                {t.common.close}
              </Button>
              <Button onClick={handleExportPDF}>
                <FilePdf size={16} weight="bold" className="mr-2" />
                {t.pcm.downloadPDFReport}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
