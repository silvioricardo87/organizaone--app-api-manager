import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Lightning, FilePdf, FileMagnifyingGlass } from '@phosphor-icons/react'
import { APIContract, PCMField } from '@/shared/lib/types'
import { extractEndpoints } from '@/shared/lib/api-utils'
import { generatePCMFields, mergeWithExistingFields } from '@/shared/lib/pcm-field-generator'
import { BASE_PCM_FIELDS } from '@/shared/lib/pcm-rules'
import { exportPCMFieldsPDF } from '@/shared/lib/pcm-pdf-export'
import { PCMAutoMapDialog } from '@/shared/components/PCMAutoMapDialog'
import { ValidateReportDialog } from '@/shared/components/ValidateReportDialog'
import { toast } from 'sonner'
import { useSettings } from '@/shared/hooks/use-settings'
import { PCMFieldForm } from './PCMFieldForm'
import { PCMFieldTable } from './PCMFieldTable'

interface PCMTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

export function PCMTab({ api, onUpdate }: PCMTabProps) {
  const { t, language } = useSettings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<PCMField | null>(null)
  const [autoMapDialogOpen, setAutoMapDialogOpen] = useState(false)
  const [autoMapFields, setAutoMapFields] = useState<PCMField[]>([])
  const [autoMapFamily, setAutoMapFamily] = useState<string | null>(null)
  const [autoMapBaseCount, setAutoMapBaseCount] = useState(0)
  const [autoMapAdditionalCount, setAutoMapAdditionalCount] = useState(0)
  const [validateDialogOpen, setValidateDialogOpen] = useState(false)

  const openDialog = (pcmField?: PCMField) => {
    setEditingField(pcmField || null)
    setDialogOpen(true)
  }

  const handleSave = (newField: PCMField, isEditing: boolean) => {
    let updatedFields: PCMField[]

    if (isEditing) {
      updatedFields = api.pcmFields.map(f => f.id === newField.id ? newField : f)
      toast.success(t('toasts.metricUpdated'))
    } else {
      updatedFields = [...api.pcmFields, newField]
      toast.success(t('toasts.metricCreated'))
    }

    onUpdate({
      ...api,
      pcmFields: updatedFields,
      updatedAt: new Date().toISOString()
    })
  }

  const handleDelete = (fieldId: string) => {
    if (!confirm(t('apiDetail.confirmDeleteMessage'))) return

    const updatedFields = api.pcmFields.filter(f => f.id !== fieldId)
    onUpdate({
      ...api,
      pcmFields: updatedFields,
      updatedAt: new Date().toISOString()
    })
    toast.success(t('toasts.metricDeleted'))
  }

  const handleAutoMap = () => {
    const { fields, detectedFamily } = generatePCMFields(api.name, api.parsedSpec, api.version)
    const endpoints = api.parsedSpec ? extractEndpoints(api.parsedSpec) : []
    const endpointCount = endpoints.reduce((acc, ep) => acc + ep.methods.length, 0)
    const baseCount = endpointCount * BASE_PCM_FIELDS.length
    const additionalCount = fields.length - baseCount

    setAutoMapFields(fields)
    setAutoMapFamily(detectedFamily?.family || null)
    setAutoMapBaseCount(baseCount)
    setAutoMapAdditionalCount(Math.max(0, additionalCount))
    setAutoMapDialogOpen(true)
  }

  const handleAutoMapConfirm = (selectedFields: PCMField[]) => {
    if (api.pcmFields.length > 0) {
      const merged = mergeWithExistingFields(selectedFields, api.pcmFields)
      const newCount = merged.length - api.pcmFields.length
      const skippedCount = selectedFields.length - newCount
      onUpdate({
        ...api,
        pcmFields: merged,
        updatedAt: new Date().toISOString(),
      })
      toast.success(t('toasts.pcmFieldsMerged')
        .replace('{new}', String(newCount))
        .replace('{skipped}', String(skippedCount)))
    } else {
      onUpdate({
        ...api,
        pcmFields: selectedFields,
        updatedAt: new Date().toISOString(),
      })
      toast.success(t('toasts.pcmAutoMapped').replace('{count}', String(selectedFields.length)))
    }
  }

  const handleExportPDF = () => {
    exportPCMFieldsPDF(api, language)
    toast.success(t('pcm.pdfExported'))
  }

  if (!api.parsedSpec) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          {t('pcm.requiresSpec')}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 flex-wrap">
        <Button variant="outline" onClick={handleAutoMap}>
          <Lightning size={20} weight="bold" className="mr-2" />
          {t('pcm.autoMapButton')}
        </Button>
        {api.pcmFields.length > 0 && (
          <>
            <Button variant="outline" onClick={handleExportPDF}>
              <FilePdf size={20} weight="bold" className="mr-2" />
              {t('pcm.exportPDF')}
            </Button>
            <Button variant="outline" onClick={() => setValidateDialogOpen(true)}>
              <FileMagnifyingGlass size={20} weight="bold" className="mr-2" />
              {t('pcm.validateReport')}
            </Button>
          </>
        )}
        <Button onClick={() => openDialog()}>
          <Plus size={20} weight="bold" className="mr-2" />
          {t('pcm.addField')}
        </Button>
      </div>

      <PCMFieldTable
        fields={api.pcmFields}
        onEdit={openDialog}
        onDelete={handleDelete}
      />

      <PCMAutoMapDialog
        open={autoMapDialogOpen}
        onOpenChange={setAutoMapDialogOpen}
        fields={autoMapFields}
        detectedFamily={autoMapFamily}
        baseFieldCount={autoMapBaseCount}
        additionalFieldCount={autoMapAdditionalCount}
        onConfirm={handleAutoMapConfirm}
      />

      <ValidateReportDialog
        open={validateDialogOpen}
        onOpenChange={setValidateDialogOpen}
        api={api}
      />

      <PCMFieldForm
        api={api}
        editingField={editingField}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </div>
  )
}
