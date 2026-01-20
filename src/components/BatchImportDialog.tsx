import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, X } from '@phosphor-icons/react'
import { useSettings } from '@/hooks/use-settings'
import { APIContract } from '@/lib/types'
import { toast } from 'sonner'

interface BatchImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (apis: APIContract[]) => void
  existingAPIs: APIContract[]
}

export function BatchImportDialog({ open, onOpenChange, onImport, existingAPIs }: BatchImportDialogProps) {
  const { t } = useSettings()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      setSelectedFile(file)
    } else {
      toast.error(t.toasts.invalidFileFormat)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    try {
      const text = await selectedFile.text()
      const data = JSON.parse(text)

      if (!Array.isArray(data.apis)) {
        toast.error(t.toasts.invalidFileFormat)
        return
      }

      const apisToImport: APIContract[] = []
      const skippedAPIs: string[] = []

      for (const api of data.apis) {
        const duplicate = existingAPIs.find(
          (existing) => existing.name === api.name && existing.version === api.version
        )

        if (duplicate) {
          skippedAPIs.push(`${api.name} (${api.version})`)
        } else {
          apisToImport.push(api)
        }
      }

      if (apisToImport.length > 0) {
        onImport(apisToImport)
        toast.success(t.toasts.allApisImported.replace('{count}', String(apisToImport.length)))
        
        if (skippedAPIs.length > 0) {
          toast.warning(
            `${skippedAPIs.length} APIs foram ignoradas (já existem): ${skippedAPIs.join(', ')}`
          )
        }
        
        onOpenChange(false)
        setSelectedFile(null)
      } else {
        toast.warning('Nenhuma API nova para importar. Todas já existem.')
      }
    } catch (error) {
      console.error('Error importing APIs:', error)
      toast.error(t.toasts.errorImportingAll)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.settings.importAll}</DialogTitle>
          <DialogDescription>{t.settings.importAllDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />

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
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t.importAPIDialog.selectFile}
                  </Button>
                  <p className="text-sm text-muted-foreground">{t.importAPIDialog.dropFile}</p>
                  <p className="text-xs text-muted-foreground">{t.importAPIDialog.supportedFormats}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile}>
            {t.common.import}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
