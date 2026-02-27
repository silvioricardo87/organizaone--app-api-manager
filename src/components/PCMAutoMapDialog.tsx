import { useState, useMemo, useEffect } from 'react'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Lightning, CheckSquare, Square, CaretRight } from '@phosphor-icons/react'
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(fields.map(f => f.id)))
    }
  }, [open, fields])

  const groupedFields = useMemo(() => {
    const groups: Record<string, PCMField[]> = {}
    for (const field of fields) {
      const key = `${field.method} ${field.endpoint}`
      if (!groups[key]) groups[key] = []
      groups[key].push(field)
    }
    return groups
  }, [fields])

  const groupKeys = useMemo(() => Object.keys(groupedFields), [groupedFields])

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

  const handleToggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleExpandAll = () => {
    setExpandedGroups(new Set(groupKeys))
  }

  const handleCollapseAll = () => {
    setExpandedGroups(new Set())
  }

  const handleSelectGroup = (key: string) => {
    const groupFields = groupedFields[key]
    setSelectedIds(prev => {
      const next = new Set(prev)
      groupFields.forEach(f => next.add(f.id))
      return next
    })
  }

  const handleDeselectGroup = (key: string) => {
    const groupFields = groupedFields[key]
    setSelectedIds(prev => {
      const next = new Set(prev)
      groupFields.forEach(f => next.delete(f.id))
      return next
    })
  }

  const getGroupSelectedCount = (key: string) => {
    const groupFields = groupedFields[key]
    return groupFields.filter(f => selectedIds.has(f.id)).length
  }

  const handleConfirm = () => {
    const selected = fields.filter(f => selectedIds.has(f.id))
    onConfirm(selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden p-8">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Lightning size={20} weight="fill" className="text-primary" />
            {t.pcm.autoMapTitle}
          </DialogTitle>
          <DialogDescription>
            {t.pcm.autoMapDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 shrink-0">
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

        <div className="flex items-center gap-2 shrink-0 pt-1">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            <CheckSquare size={16} className="mr-1" />
            {t.common.selectAll}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            <Square size={16} className="mr-1" />
            {t.common.deselectAll}
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleExpandAll}>
              {t.common.expand}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCollapseAll}>
              {t.common.collapse}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto border rounded-md p-2 space-y-1">
          {groupKeys.map(key => {
            const groupFields = groupedFields[key]
            const selectedCount = getGroupSelectedCount(key)
            const isExpanded = expandedGroups.has(key)
            const method = key.split(' ')[0]
            const endpoint = key.split(' ').slice(1).join(' ')
            const allSelected = selectedCount === groupFields.length
            const noneSelected = selectedCount === 0

            return (
              <Collapsible
                key={key}
                open={isExpanded}
                onOpenChange={() => handleToggleGroup(key)}
              >
                <div className="flex items-center gap-2 rounded-md hover:bg-muted/50 px-2 py-1.5">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-2 flex-1 min-w-0 text-left">
                      <CaretRight
                        size={14}
                        weight="bold"
                        className={`shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                      <Badge className="bg-primary text-primary-foreground text-xs shrink-0">
                        {method}
                      </Badge>
                      <code className="text-xs font-mono text-muted-foreground truncate">
                        {endpoint}
                      </code>
                    </button>
                  </CollapsibleTrigger>
                  <Badge
                    variant={allSelected ? 'default' : noneSelected ? 'outline' : 'secondary'}
                    className="text-[10px] shrink-0 tabular-nums cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (allSelected) handleDeselectGroup(key)
                      else handleSelectGroup(key)
                    }}
                  >
                    {selectedCount}/{groupFields.length}
                  </Badge>
                </div>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 gap-0.5 pl-8 pr-2 pb-2">
                    {groupFields.map(field => (
                      <label
                        key={field.id}
                        className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedIds.has(field.id)}
                          onCheckedChange={() => handleToggle(field.id)}
                        />
                        <span className="font-mono text-xs truncate" title={field.field}>{field.field}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto shrink-0">
                          {field.mandatory === 'both' ? 'C+S' : field.mandatory === 'client' ? 'C' : field.mandatory === 'server' ? 'S' : '-'}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>

        <div className="flex justify-end gap-2 pt-3 shrink-0">
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
