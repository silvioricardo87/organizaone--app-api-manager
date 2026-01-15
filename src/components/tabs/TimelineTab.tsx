import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, Trash, Calendar as CalendarIcon, Flag } from '@phosphor-icons/react'
import { APIContract, Milestone, LifecyclePhase } from '@/lib/types'
import { PhaseIndicator } from '../PhaseIndicator'
import { generateId } from '@/lib/api-utils'
import { parseISO, differenceInDays } from 'date-fns'
import { formatDate, monthNames } from '@/lib/i18n'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

interface TimelineTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

const phaseOrder: LifecyclePhase[] = ['implementing', 'certifying', 'current', 'deprecated', 'retired']

export function TimelineTab({ api, onUpdate }: TimelineTabProps) {
  const { t, language } = useSettings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date>()

  const allDates: Date[] = []
  
  api.lifecyclePhases.forEach(phase => {
    if (phase.startDate) allDates.push(parseISO(phase.startDate))
    if (phase.endDate) allDates.push(parseISO(phase.endDate))
  })
  
  api.milestones.forEach(milestone => {
    allDates.push(parseISO(milestone.date))
  })

  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date()
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date()
  const timelineSpan = differenceInDays(maxDate, minDate) || 365

  const openDialog = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone)
      setTitle(milestone.title)
      setDescription(milestone.description || '')
      setDate(parseISO(milestone.date))
    } else {
      setEditingMilestone(null)
      setTitle('')
      setDescription('')
      setDate(undefined)
    }
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!title.trim() || !date) {
      toast.error(t.toasts.fieldRequired)
      return
    }

    let updatedMilestones: Milestone[]

    if (editingMilestone) {
      updatedMilestones = api.milestones.map(m =>
        m.id === editingMilestone.id
          ? { ...m, title, description, date: date.toISOString() }
          : m
      )
      toast.success(t.toasts.milestoneUpdated)
    } else {
      const newMilestone: Milestone = {
        id: generateId(),
        title,
        description,
        date: date.toISOString()
      }
      updatedMilestones = [...api.milestones, newMilestone].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      toast.success(t.toasts.milestoneCreated)
    }

    onUpdate({
      ...api,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString()
    })

    setDialogOpen(false)
  }

  const handleDelete = (milestoneId: string) => {
    if (!confirm(t.apiDetail.confirmDeleteMessage)) return

    const updatedMilestones = api.milestones.filter(m => m.id !== milestoneId)
    onUpdate({
      ...api,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString()
    })
    toast.success(t.toasts.milestoneDeleted)
  }

  const getPositionPercentage = (date: Date): number => {
    const diff = differenceInDays(date, minDate)
    return (diff / timelineSpan) * 100
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => openDialog()}>
          <Plus size={20} weight="bold" className="mr-2" />
          Add Milestone
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-display font-semibold mb-6">Visual Timeline</h2>
        
        <div className="relative pt-16 pb-8">
          <div className="absolute top-16 left-0 right-0 h-2 bg-muted rounded-full"></div>
          
          {api.lifecyclePhases.map((phase, index) => {
            if (!phase.startDate) return null

            const start = parseISO(phase.startDate)
            const end = phase.endDate ? parseISO(phase.endDate) : maxDate
            const startPos = getPositionPercentage(start)
            const width = getPositionPercentage(end) - startPos

            return (
              <div
                key={phase.phase}
                className="absolute top-16 h-2 rounded-full transition-all"
                style={{
                  left: `${startPos}%`,
                  width: `${width}%`,
                  backgroundColor: index % 2 === 0 ? 'oklch(0.45 0.15 250)' : 'oklch(0.70 0.18 200)'
                }}
              />
            )
          })}

          {api.milestones.map((milestone, idx) => {
            const milestoneDate = parseISO(milestone.date)
            const position = getPositionPercentage(milestoneDate)
            const isEven = idx % 2 === 0

            return (
              <div
                key={milestone.id}
                className="absolute transform -translate-x-1/2"
                style={{ 
                  left: `${position}%`,
                  top: isEven ? '0px' : 'auto',
                  bottom: isEven ? 'auto' : '0px'
                }}
              >
                <div className="flex flex-col items-center w-32">
                  {isEven ? (
                    <>
                      <div className="text-center mb-2 px-1">
                        <p className="text-xs font-medium truncate w-full" title={milestone.title}>
                          {milestone.title}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(milestoneDate, 'medium', language)}
                        </p>
                      </div>
                      <div className="h-6 w-0.5 bg-accent"></div>
                      <Flag size={20} weight="fill" className="text-accent" />
                    </>
                  ) : (
                    <>
                      <Flag size={20} weight="fill" className="text-accent" />
                      <div className="h-6 w-0.5 bg-accent"></div>
                      <div className="text-center mt-2 px-1">
                        <p className="text-xs font-medium truncate w-full" title={milestone.title}>
                          {milestone.title}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(milestoneDate, 'medium', language)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          <div className="absolute top-[4.5rem] left-0 right-0 flex justify-between text-xs text-muted-foreground">
            <span>{formatDate(minDate, 'monthYear', language)}</span>
            <span>{formatDate(maxDate, 'monthYear', language)}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">Lifecycle Phases</h3>
          <div className="space-y-3">
            {phaseOrder.map(phase => {
              const phaseData = api.lifecyclePhases.find(p => p.phase === phase)
              if (!phaseData?.startDate) return null

              return (
                <div key={phase} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <PhaseIndicator phase={phase} />
                  </div>
                  <div className="text-right text-xs">
                    <p>{formatDate(parseISO(phaseData.startDate), 'medium', language)}</p>
                    {phaseData.endDate && (
                      <p className="text-muted-foreground">
                        {t.dates.to} {formatDate(parseISO(phaseData.endDate), 'medium', language)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">Milestones</h3>
          {api.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones added yet.</p>
          ) : (
            <div className="space-y-3">
              {api.milestones.map(milestone => (
                <div key={milestone.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Flag size={16} weight="fill" className="text-accent" />
                      <p className="font-medium text-sm">{milestone.title}</p>
                    </div>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground mb-1">{milestone.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(parseISO(milestone.date), 'medium', language)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(milestone)}>
                      <Plus size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(milestone.id)}>
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMilestone ? 'Edit Milestone' : 'New Milestone'}</DialogTitle>
            <DialogDescription>
              {editingMilestone ? 'Update milestone details' : 'Add a new milestone to the timeline'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">Title *</Label>
              <Input
                id="milestone-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Milestone name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea
                id="milestone-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.lifecycle.date} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon size={16} className="mr-2" />
                    {date ? formatDate(date, 'long', language) : t.dates.selectDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || !date}>
              {editingMilestone ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
