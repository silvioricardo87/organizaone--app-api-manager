import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CalendarDots, FlagBanner } from '@phosphor-icons/react'
import { APIContract, LifecyclePhase } from '@/lib/types'
import { format, parseISO, min, max, differenceInDays, addMonths, subMonths } from 'date-fns'

interface RoadmapProps {
  apis: APIContract[]
  onBack: () => void
}

const PHASE_COLORS: Record<LifecyclePhase, string> = {
  implementing: 'bg-info text-info-foreground',
  certifying: 'bg-[oklch(0.65_0.16_260)] text-white',
  current: 'bg-success text-success-foreground',
  deprecated: 'bg-warning text-warning-foreground',
  retired: 'bg-destructive text-destructive-foreground',
}

const PHASE_LABELS: Record<LifecyclePhase, string> = {
  implementing: 'Implementing',
  certifying: 'Certifying',
  current: 'Current',
  deprecated: 'Deprecated',
  retired: 'Retired',
}

interface TimelineEvent {
  id: string
  apiId: string
  apiName: string
  type: 'phase' | 'milestone'
  date: Date
  phase?: LifecyclePhase
  title?: string
  description?: string
}

export function Roadmap({ apis, onBack }: RoadmapProps) {
  const [selectedApi, setSelectedApi] = useState<string | null>(null)

  const timelineData = useMemo(() => {
    const events: TimelineEvent[] = []

    apis.forEach(api => {
      api.lifecyclePhases.forEach(phaseData => {
        if (phaseData.startDate) {
          events.push({
            id: `${api.id}-${phaseData.phase}-start`,
            apiId: api.id,
            apiName: api.name,
            type: 'phase',
            date: parseISO(phaseData.startDate),
            phase: phaseData.phase,
            title: `${PHASE_LABELS[phaseData.phase]} Start`,
          })
        }
        if (phaseData.endDate) {
          events.push({
            id: `${api.id}-${phaseData.phase}-end`,
            apiId: api.id,
            apiName: api.name,
            type: 'phase',
            date: parseISO(phaseData.endDate),
            phase: phaseData.phase,
            title: `${PHASE_LABELS[phaseData.phase]} End`,
          })
        }
      })

      api.milestones.forEach(milestone => {
        events.push({
          id: milestone.id,
          apiId: api.id,
          apiName: api.name,
          type: 'milestone',
          date: parseISO(milestone.date),
          title: milestone.title,
          description: milestone.description,
        })
      })
    })

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [apis])

  const filteredApis = useMemo(() => {
    if (!selectedApi) return apis
    return apis.filter(api => api.id === selectedApi)
  }, [apis, selectedApi])

  const dateRange = useMemo(() => {
    if (timelineData.length === 0) {
      return { start: subMonths(new Date(), 6), end: addMonths(new Date(), 6) }
    }

    const dates = timelineData.map(e => e.date)
    const minDate = min(dates)
    const maxDate = max(dates)

    return {
      start: subMonths(minDate, 1),
      end: addMonths(maxDate, 1),
    }
  }, [timelineData])

  const totalDays = differenceInDays(dateRange.end, dateRange.start)

  const getPositionPercent = (date: Date) => {
    const daysSinceStart = differenceInDays(date, dateRange.start)
    return (daysSinceStart / totalDays) * 100
  }

  const apiRows = useMemo(() => {
    return filteredApis.map(api => {
      const apiEvents = timelineData.filter(e => e.apiId === api.id)
      const phases = api.lifecyclePhases
        .filter(p => p.startDate)
        .map(p => ({
          phase: p.phase,
          start: parseISO(p.startDate!),
          end: p.endDate ? parseISO(p.endDate) : dateRange.end,
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime())

      return {
        api,
        events: apiEvents,
        phases,
      }
    })
  }, [filteredApis, timelineData, dateRange.end])

  const monthMarkers = useMemo(() => {
    const markers: Array<{ date: Date; position: number }> = []
    let currentDate = new Date(dateRange.start)
    currentDate.setDate(1)

    while (currentDate <= dateRange.end) {
      markers.push({
        date: new Date(currentDate),
        position: getPositionPercent(currentDate),
      })
      currentDate = addMonths(currentDate, 1)
    }

    return markers
  }, [dateRange])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold">Roadmap</h2>
          <p className="text-sm text-muted-foreground">API lifecycle timeline and milestones</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <CalendarDots size={24} weight="duotone" className="text-primary" />
          <div>
            <h3 className="text-lg font-display font-semibold">Filter by API</h3>
            <p className="text-sm text-muted-foreground">Select an API to focus on its timeline</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedApi === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedApi(null)}
          >
            All APIs
          </Button>
          {apis.map(api => (
            <Button
              key={api.id}
              variant={selectedApi === api.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedApi(api.id)}
            >
              {api.name}
            </Button>
          ))}
        </div>
      </Card>

      {apiRows.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDots size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No timeline data available</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="space-y-8">
            <div className="relative">
              <div className="flex border-b border-border pb-2 mb-4">
                {monthMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="absolute text-xs text-muted-foreground font-medium"
                    style={{ left: `${marker.position}%`, transform: 'translateX(-50%)' }}
                  >
                    {format(marker.date, 'MMM yyyy')}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 mt-8">
              {apiRows.map(({ api, events, phases }) => (
                <div key={api.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-display font-semibold text-base">{api.name}</h4>
                    <span className="text-xs text-muted-foreground font-mono">{api.version}</span>
                  </div>

                  <div className="relative h-16 bg-muted/30 rounded-lg border border-border">
                    {phases.map((phaseBlock, idx) => {
                      const startPos = getPositionPercent(phaseBlock.start)
                      const endPos = getPositionPercent(phaseBlock.end)
                      const width = endPos - startPos

                      return (
                        <div
                          key={idx}
                          className={`absolute top-2 bottom-2 rounded ${PHASE_COLORS[phaseBlock.phase]} flex items-center justify-center text-xs font-medium`}
                          style={{
                            left: `${startPos}%`,
                            width: `${width}%`,
                          }}
                        >
                          {width > 8 && PHASE_LABELS[phaseBlock.phase]}
                        </div>
                      )
                    })}

                    {events.map(event => {
                      const position = getPositionPercent(event.date)
                      return (
                        <div
                          key={event.id}
                          className="absolute top-0 bottom-0 flex flex-col items-center justify-center group"
                          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        >
                          {event.type === 'milestone' ? (
                            <>
                              <FlagBanner size={20} weight="fill" className="text-accent drop-shadow-sm" />
                              <div className="absolute top-full mt-2 hidden group-hover:block z-10 bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-3 min-w-[200px]">
                                <div className="font-medium text-sm mb-1">{event.title}</div>
                                {event.description && (
                                  <div className="text-xs text-muted-foreground mb-2">{event.description}</div>
                                )}
                                <div className="text-xs text-muted-foreground font-mono">
                                  {format(event.date, 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-2 h-full bg-border" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {phases.map((phaseBlock, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {PHASE_LABELS[phaseBlock.phase]}: {format(phaseBlock.start, 'MMM dd, yyyy')}
                        {phaseBlock.end && ` → ${format(phaseBlock.end, 'MMM dd, yyyy')}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <FlagBanner size={24} weight="duotone" className="text-primary" />
          Legend
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(PHASE_LABELS).map(([phase, label]) => (
            <div key={phase} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded ${PHASE_COLORS[phase as LifecyclePhase]}`} />
              <span className="text-sm">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <FlagBanner size={24} weight="fill" className="text-accent" />
            <span className="text-sm">Milestone</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
