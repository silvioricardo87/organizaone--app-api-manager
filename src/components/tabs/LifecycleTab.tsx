import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from '@phosphor-icons/react'
import { APIContract, LifecyclePhase } from '@/lib/types'
import { PhaseIndicator } from '../PhaseIndicator'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface LifecycleTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

const phaseOrder: LifecyclePhase[] = ['implementing', 'certifying', 'current', 'deprecated', 'retired']

export function LifecycleTab({ api, onUpdate }: LifecycleTabProps) {
  const [editingPhase, setEditingPhase] = useState<LifecyclePhase | null>(null)

  const handleDateChange = (phase: LifecyclePhase, type: 'start' | 'end', date: Date | undefined) => {
    const updatedPhases = api.lifecyclePhases.map(p => {
      if (p.phase === phase) {
        return {
          ...p,
          [type === 'start' ? 'startDate' : 'endDate']: date ? date.toISOString() : undefined
        }
      }
      return p
    })

    onUpdate({
      ...api,
      lifecyclePhases: updatedPhases,
      updatedAt: new Date().toISOString()
    })
    
    toast.success('Lifecycle phase updated')
  }

  return (
    <div className="space-y-4">
      {phaseOrder.map(phase => {
        const phaseData = api.lifecyclePhases.find(p => p.phase === phase)
        if (!phaseData) return null

        return (
          <Card key={phase} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <PhaseIndicator phase={phase} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon size={16} className="mr-2" />
                      {phaseData.startDate
                        ? format(new Date(phaseData.startDate), 'PPP')
                        : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={phaseData.startDate ? new Date(phaseData.startDate) : undefined}
                      onSelect={(date) => handleDateChange(phase, 'start', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon size={16} className="mr-2" />
                      {phaseData.endDate
                        ? format(new Date(phaseData.endDate), 'PPP')
                        : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={phaseData.endDate ? new Date(phaseData.endDate) : undefined}
                      onSelect={(date) => handleDateChange(phase, 'end', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
