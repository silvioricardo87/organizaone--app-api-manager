import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from '@phosphor-icons/react'
import { parseOpenAPIYAML, extractAPIMetadata, generateId } from '@/lib/api-utils'
import { APIContract, LifecyclePhaseData } from '@/lib/types'
import { useSettings } from '@/hooks/use-settings'
import { toast } from 'sonner'

interface NewAPIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (api: APIContract) => void
}

export function NewAPIDialog({ open, onOpenChange, onSave }: NewAPIDialogProps) {
  const { t } = useSettings()
  const [name, setName] = useState('')
  const [yamlContent, setYamlContent] = useState('')
  const [version, setVersion] = useState('')
  const [summary, setSummary] = useState('')
  const [parsedSpec, setParsedSpec] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      const content = await file.text()
      const result = parseOpenAPIYAML(content)
      
      if (!result.success) {
        toast.error(t.newAPIDialog.errorTitle, {
          description: t.newAPIDialog.errorImporting
        })
        return
      }

      setYamlContent(content)
      setParsedSpec(result.data)
      
      const metadata = extractAPIMetadata(result.data)
      setVersion(metadata.version)
      setSummary(metadata.summary)
      
      if (!name && result.data.info?.title) {
        setName(result.data.info.title)
      }

      toast.success(t.newAPIDialog.successTitle, {
        description: t.newAPIDialog.successMessage
      })
    } catch (error) {
      toast.error(t.newAPIDialog.errorTitle)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t.newAPIDialog.errorTitle)
      return
    }

    const lifecyclePhases: LifecyclePhaseData[] = [
      { phase: 'implementing' },
      { phase: 'certifying' },
      { phase: 'current' },
      { phase: 'deprecated' },
      { phase: 'retired' }
    ]

    const newAPI: APIContract = {
      id: generateId(),
      name: name.trim(),
      version: version.trim() || '1.0.0',
      summary: summary.trim() || 'No summary provided',
      yamlContent,
      parsedSpec,
      lifecyclePhases,
      milestones: [],
      knownIssues: [],
      backlogItems: [],
      pcmFields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(newAPI)
    resetForm()
    onOpenChange(false)
    toast.success(t.newAPIDialog.successTitle, {
      description: t.newAPIDialog.successMessage
    })
  }

  const resetForm = () => {
    setName('')
    setYamlContent('')
    setVersion('')
    setSummary('')
    setParsedSpec(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{t.newAPIDialog.title}</DialogTitle>
          <DialogDescription>
            {t.newAPIDialog.importContract}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="yaml-upload">{t.apiDetail.importYAML}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="yaml-upload"
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="cursor-pointer"
              />
              <Button
                variant="outline"
                size="icon"
                disabled={isProcessing}
                onClick={() => document.getElementById('yaml-upload')?.click()}
              >
                <Upload size={20} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-name">{t.newAPIDialog.name} *</Label>
            <Input
              id="api-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.newAPIDialog.namePlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api-version">{t.newAPIDialog.version}</Label>
              <Input
                id="api-version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder={t.newAPIDialog.versionPlaceholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-summary">{t.newAPIDialog.description}</Label>
            <Textarea
              id="api-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t.newAPIDialog.descriptionPlaceholder}
              rows={3}
            />
          </div>

          {parsedSpec && (
            <div className="rounded-lg bg-success/10 border border-success/20 p-4">
              <p className="text-sm text-success-foreground font-medium">
                ✓ {t.newAPIDialog.successMessage}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.keys(parsedSpec.paths || {}).length} {t.apiDetail.endpoints.toLowerCase()}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.newAPIDialog.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {t.newAPIDialog.create}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
