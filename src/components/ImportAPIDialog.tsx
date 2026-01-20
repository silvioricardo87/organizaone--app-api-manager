import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UploadSimple } from '@phosphor-icons/react'
import { APIContract } from '@/lib/types'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

interface ImportAPIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (api: APIContract) => void
  existingAPIs: APIContract[]
}

export function ImportAPIDialog({ open, onOpenChange, onImport, existingAPIs }: ImportAPIDialogProps) {
  const { t } = useSettings()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/json') {
      toast.error(t.toasts.invalidFileFormat)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)

        if (!importedData.api || !importedData.api.id || !importedData.api.name) {
          toast.error(t.toasts.invalidFileFormat)
          return
        }

        const restoredAPI: APIContract = {
          id: importedData.api.id,
          name: importedData.api.name,
          version: importedData.api.version || '1.0.0',
          summary: importedData.api.summary || '',
          yamlContent: importedData.contract || '',
          parsedSpec: importedData.specification,
          lifecyclePhases: importedData.lifecycle?.phases || [],
          milestones: importedData.lifecycle?.milestones || [],
          knownIssues: importedData.issues || [],
          backlogItems: importedData.backlog || [],
          pcmFields: importedData.pcm || [],
          createdAt: importedData.api.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const isDuplicate = existingAPIs.some(
          api => api.name === restoredAPI.name && api.version === restoredAPI.version
        )

        if (isDuplicate) {
          toast.error(t.toasts.duplicateAPI)
          return
        }

        onImport(restoredAPI)
        onOpenChange(false)
        toast.success(t.toasts.apiImported)
      } catch (error) {
        console.error('Error parsing import file:', error)
        toast.error(t.toasts.errorImportingAPI)
      }
    }

    reader.onerror = () => {
      toast.error(t.toasts.errorImportingAPI)
    }

    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.importAPIDialog.title}</DialogTitle>
          <DialogDescription>
            {t.importAPIDialog.description}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <UploadSimple size={32} weight="duotone" className="text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">{t.importAPIDialog.selectFile}</p>
              <p className="text-sm text-muted-foreground">{t.importAPIDialog.dropFile}</p>
              <p className="text-xs text-muted-foreground">{t.importAPIDialog.supportedFormats}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadSimple size={16} weight="bold" className="mr-2" />
              {t.importAPIDialog.selectFile}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
