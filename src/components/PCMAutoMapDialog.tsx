import { useState, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lightning, CheckSquare, Square } from '@phosphor-icons/react'
import { PCMField } from '@/lib/types'
import { useSettings } from '@/hooks/use-settings'

interface PCMAutoMapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fields: PCMField[]
  detectedFamily: string | null
  baseFieldCount: number
  additionalFieldCount: number
  onConfirm: (selectedFields: PCMField[]) => void
}

export function PCMAutoMapDialog({
  open,
  onOpenChange,
  fields,
  detectedFamily,
  baseFieldCount,
  additionalFieldCount,
  onConfirm,
}: PCMAutoMapDialogProps) {
  const { t } = useSettings()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(fields.map(f => f.id)))

  const groupedFields = useMemo(() => {
    const groups: Record<string, PCMField[]> = {}
    for (const field of fields) {
      const key = `${field.method} ${field.endpoint}`
      if (!groups[key]) groups[key] = []
      groups[key].push(field)
    }
    return groups
  }, [fields])

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedIds(new Set(fields.map(f => f.id)))
  }

  const handleDeselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleConfirm = () => {
    const selected = fields.filter(f => selectedIds.has(f.id))
    onConfirm(selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightning size={20} weight="fill" className="text-primary" />
            {t.pcm.autoMapTitle}
          </DialogTitle>
          <DialogDescription>
            {t.pcm.autoMapDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-3">
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">{t.pcm.detectedFamily}</p>
            <p className="font-semibold text-sm mt-1">
              {detectedFamily ? (
                <Badge variant="secondary">{detectedFamily}</Badge>
              ) : (
                <span className="text-muted-foreground text-xs">{t.pcm.noFamilyDetected}</span>
              )}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">{t.pcm.baseFields} / {t.pcm.additionalInfoFields}</p>
            <p className="font-semibold text-sm mt-1">{baseFieldCount} / {additionalFieldCount}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground">{t.pcm.totalFields}</p>
            <p className="font-semibold text-sm mt-1">
              {selectedIds.size} / {fields.length}
            </p>
          </Card>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            <CheckSquare size={16} className="mr-1" />
            {t.common.selectAll}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            <Square size={16} className="mr-1" />
            {t.common.deselectAll}
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0 max-h-[400px] border rounded-md p-3">
          <div className="space-y-4">
            {Object.entries(groupedFields).map(([key, groupFields]) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {key.split(' ')[0]}
                  </Badge>
                  <code className="text-xs font-mono text-muted-foreground">
                    {key.split(' ').slice(1).join(' ')}
                  </code>
                </div>
                <div className="grid grid-cols-2 gap-1 pl-4">
                  {groupFields.map(field => (
                    <label
                      key={field.id}
                      className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIds.has(field.id)}
                        onCheckedChange={() => handleToggle(field.id)}
                      />
                      <span className="font-mono text-xs truncate">{field.field}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto shrink-0">
                        {field.mandatory === 'both' ? 'C+S' : field.mandatory === 'client' ? 'C' : field.mandatory === 'server' ? 'S' : '-'}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
            <Lightning size={16} weight="fill" className="mr-1" />
            {t.common.apply} ({selectedIds.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
