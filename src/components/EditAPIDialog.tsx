import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { APIContract } from '@/lib/types'
import { useSettings } from '@/hooks/use-settings'
import { toast } from 'sonner'

interface EditAPIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  api: APIContract
  onSave: (api: APIContract) => void
}

export function EditAPIDialog({ open, onOpenChange, api, onSave }: EditAPIDialogProps) {
  const { t } = useSettings()
  const [name, setName] = useState(api.name)
  const [displayName, setDisplayName] = useState(api.displayName || '')
  const [useDisplayName, setUseDisplayName] = useState(api.useDisplayName || false)
  const [apiGroup, setApiGroup] = useState(api.apiGroup || '')
  const [isBeta, setIsBeta] = useState(api.isBeta || false)
  const [version, setVersion] = useState(api.version)
  const [summary, setSummary] = useState(api.summary)

  useEffect(() => {
    if (open) {
      setName(api.name)
      setDisplayName(api.displayName || '')
      setUseDisplayName(api.useDisplayName || false)
      setApiGroup(api.apiGroup || '')
      setIsBeta(api.isBeta || false)
      setVersion(api.version)
      setSummary(api.summary)
    }
  }, [open, api])

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t.newAPIDialog.errorTitle)
      return
    }

    const updatedAPI: APIContract = {
      ...api,
      name: name.trim(),
      displayName: displayName.trim() || undefined,
      useDisplayName: displayName.trim() ? useDisplayName : false,
      apiGroup: apiGroup.trim() || undefined,
      isBeta,
      version: version.trim() || '1.0.0',
      summary: summary.trim(),
      updatedAt: new Date().toISOString(),
    }

    onSave(updatedAPI)
    onOpenChange(false)
    toast.success(t.toasts.apiUpdated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{t.common.edit} API</DialogTitle>
          <DialogDescription>
            {t.common.edit} {api.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-api-name">{t.newAPIDialog.name} *</Label>
            <Input
              id="edit-api-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.newAPIDialog.namePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-api-display-name">{t.newAPIDialog.displayName}</Label>
            <Input
              id="edit-api-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.newAPIDialog.displayNamePlaceholder}
            />
            {displayName.trim() && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="edit-use-display-name"
                  checked={useDisplayName}
                  onCheckedChange={(checked) => setUseDisplayName(checked === true)}
                />
                <label
                  htmlFor="edit-use-display-name"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {t.newAPIDialog.useDisplayNameLabel}
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-api-group">{t.newAPIDialog.apiGroup}</Label>
            <Input
              id="edit-api-group"
              value={apiGroup}
              onChange={(e) => setApiGroup(e.target.value)}
              placeholder={t.newAPIDialog.apiGroupPlaceholder}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-is-beta"
              checked={isBeta}
              onCheckedChange={(checked) => setIsBeta(checked === true)}
            />
            <label
              htmlFor="edit-is-beta"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t.newAPIDialog.isBetaLabel}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-api-version">{t.newAPIDialog.version}</Label>
              <Input
                id="edit-api-version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder={t.newAPIDialog.versionPlaceholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-api-summary">{t.newAPIDialog.description}</Label>
            <Textarea
              id="edit-api-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t.newAPIDialog.descriptionPlaceholder}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave}>
            {t.common.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
