import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload } from '@phosphor-icons/react'
import { parseOpenAPIYAML, extractAPIMetadata, generateId, extractEndpoints } from '@/lib/api-utils'
import { generatePCMFields, mergeWithExistingFields } from '@/lib/pcm-field-generator'
import { BASE_PCM_FIELDS } from '@/lib/pcm-rules'
import { APIContract, LifecyclePhaseData, PCMField } from '@/lib/types'
import { PCMAutoMapDialog } from '@/components/PCMAutoMapDialog'
import { useSettings } from '@/hooks/use-settings'
import { toast } from 'sonner'

interface NewAPIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (api: APIContract) => void
  existingAPIs: APIContract[]
}

export function NewAPIDialog({ open, onOpenChange, onSave, existingAPIs }: NewAPIDialogProps) {
  const { t } = useSettings()
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [useDisplayName, setUseDisplayName] = useState(false)
  const [isUseDisplayNameManuallySet, setIsUseDisplayNameManuallySet] = useState(false)
  const [apiGroup, setApiGroup] = useState('')
  const [isBeta, setIsBeta] = useState(false)
  const [yamlContent, setYamlContent] = useState('')
  const [version, setVersion] = useState('')
  const [summary, setSummary] = useState('')
  const [parsedSpec, setParsedSpec] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoMapDialogOpen, setAutoMapDialogOpen] = useState(false)
  const [pendingAPI, setPendingAPI] = useState<APIContract | null>(null)
  const [autoMapFields, setAutoMapFields] = useState<PCMField[]>([])
  const [autoMapFamily, setAutoMapFamily] = useState<string | null>(null)
  const [autoMapBaseCount, setAutoMapBaseCount] = useState(0)
  const [autoMapAdditionalCount, setAutoMapAdditionalCount] = useState(0)
  const autoMapConfirmedRef = useRef(false)

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

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

    const normalizedName = name.trim()
    const normalizedVersion = version.trim() || '1.0.0'

    const isDuplicate = existingAPIs.some(
      api => api.name === normalizedName && api.version === normalizedVersion
    )

    if (isDuplicate) {
      toast.error(t.toasts.duplicateAPI)
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
      name: normalizedName,
      displayName: displayName.trim() || undefined,
      useDisplayName: displayName.trim() ? useDisplayName : false,
      apiGroup: apiGroup.trim() || undefined,
      isBeta,
      version: normalizedVersion,
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

    if (parsedSpec) {
      const { fields, detectedFamily } = generatePCMFields(normalizedName, parsedSpec, normalizedVersion)
      if (fields.length > 0) {
        const endpoints = extractEndpoints(parsedSpec)
        const endpointCount = endpoints.reduce((acc: number, ep: { methods: string[] }) => acc + ep.methods.length, 0)
        const baseCount = endpointCount * BASE_PCM_FIELDS.length
        const additionalCount = fields.length - baseCount

        setPendingAPI(newAPI)
        setAutoMapFields(fields)
        setAutoMapFamily(detectedFamily?.family || null)
        setAutoMapBaseCount(baseCount)
        setAutoMapAdditionalCount(Math.max(0, additionalCount))
        setAutoMapDialogOpen(true)
        return
      }
    }

    onSave(newAPI)
    onOpenChange(false)
    toast.success(t.newAPIDialog.successTitle, {
      description: t.newAPIDialog.successMessage
    })
  }

  const handleAutoMapConfirm = (selectedFields: PCMField[]) => {
    if (!pendingAPI) return
    autoMapConfirmedRef.current = true
    onSave({ ...pendingAPI, pcmFields: selectedFields })
    setPendingAPI(null)
    onOpenChange(false)
    toast.success(t.newAPIDialog.successTitle, {
      description: t.toasts.pcmAutoMapped.replace('{count}', String(selectedFields.length))
    })
  }

  const handleAutoMapSkip = () => {
    if (!pendingAPI) return
    onSave(pendingAPI)
    setPendingAPI(null)
    setAutoMapDialogOpen(false)
    onOpenChange(false)
    toast.success(t.newAPIDialog.successTitle, {
      description: t.newAPIDialog.successMessage
    })
  }

  const resetForm = () => {
    setName('')
    setDisplayName('')
    setUseDisplayName(false)
    setIsUseDisplayNameManuallySet(false)
    setApiGroup('')
    setIsBeta(false)
    setYamlContent('')
    setVersion('')
    setSummary('')
    setParsedSpec(null)
    setPendingAPI(null)
    setAutoMapFields([])
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

          <div className="space-y-2">
            <Label htmlFor="api-display-name">{t.newAPIDialog.displayName}</Label>
            <Input
              id="api-display-name"
              value={displayName}
              onChange={(e) => {
                const value = e.target.value
                setDisplayName(value)
                if (!isUseDisplayNameManuallySet) {
                  setUseDisplayName(value.trim().length > 0)
                }
              }}
              placeholder={t.newAPIDialog.displayNamePlaceholder}
            />
            {displayName.trim() && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="use-display-name"
                  checked={useDisplayName}
                  onCheckedChange={(checked) => {
                    setUseDisplayName(checked === true)
                    setIsUseDisplayNameManuallySet(true)
                  }}
                />
                <label
                  htmlFor="use-display-name"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {t.newAPIDialog.useDisplayNameLabel}
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-group">{t.newAPIDialog.apiGroup}</Label>
            <Input
              id="api-group"
              value={apiGroup}
              onChange={(e) => setApiGroup(e.target.value)}
              placeholder={t.newAPIDialog.apiGroupPlaceholder}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-beta"
              checked={isBeta}
              onCheckedChange={(checked) => setIsBeta(checked === true)}
            />
            <label
              htmlFor="is-beta"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t.newAPIDialog.isBetaLabel}
            </label>
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

      <PCMAutoMapDialog
        open={autoMapDialogOpen}
        onOpenChange={(open) => {
          setAutoMapDialogOpen(open)
          if (!open && !autoMapConfirmedRef.current) {
            handleAutoMapSkip()
          }
          autoMapConfirmedRef.current = false
        }}
        fields={autoMapFields}
        detectedFamily={autoMapFamily}
        baseFieldCount={autoMapBaseCount}
        additionalFieldCount={autoMapAdditionalCount}
        onConfirm={handleAutoMapConfirm}
      />
    </Dialog>
  )
}
