import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDots, FlagBanner } from '@phosphor-icons/react'
import { APIContract, LifecyclePhase } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { parseISO, format, differenceInDays, addMonths, subMonths, min, max } from 'date-fns'

const PHASE_LABELS: Record<LifecyclePhase, string> = {
  implementing: 'Implementing',
  certifying: 'Certifying',
  current: 'Current',
  deprecated: 'Deprecated',
  retired: 'Retired'
}

const PHASE_COLORS: Record<LifecyclePhase, string> = {
  implementing: 'bg-[oklch(0.75_0.15_70)] text-warning-foreground',
  certifying: 'bg-[oklch(0.60_0.18_240)] text-info-foreground',
  current: 'bg-[oklch(0.65_0.20_140)] text-success-foreground',
  deprecated: 'bg-[oklch(0.60_0.22_25)] text-destructive-foreground',
  retired: 'bg-muted text-muted-foreground'
}

interface RoadmapProps {
  apis: APIContract[]
  onBack: () => void
}

interface TimelineEvent {
  id: string
  apiId: string
  apiName: string
  type: 'phase' | 'milestone'
  date: Date
  phase?: LifecyclePhase
  title: string
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
  }, [filteredApis, timelineData, dateRange])

  const monthMarkers = useMemo(() => {
    const markers: { date: Date; position: number; label: string }[] = []
    let currentDate = new Date(dateRange.start)
    currentDate.setDate(1)

    while (currentDate <= dateRange.end) {
      markers.push({
        date: new Date(currentDate),
        position: getPositionPercent(currentDate),
        label: format(currentDate, 'MMM yyyy'),
      })
      currentDate = addMonths(currentDate, 1)
    }

    return markers
  }, [dateRange])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <CalendarDots size={24} weight="duotone" className="text-primary" />
          <h2 className="text-2xl font-display font-bold">API Roadmap</h2>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedApi === null ? 'default' : 'outline'}
          onClick={() => setSelectedApi(null)}
        >
          All APIs
        </Button>
        {apis.map(api => (
          <Button
            key={api.id}
            size="sm"
            variant={selectedApi === api.id ? 'default' : 'outline'}
            onClick={() => setSelectedApi(api.id)}
          >
            {api.name}
          </Button>
        ))}
      </div>

      <Card className="p-6">
        <div className="relative">
          <div className="relative h-12 bg-muted/30 rounded mb-4">
            {monthMarkers.map(marker => (
              <div
                key={marker.label}
                className="absolute top-0 bottom-0 flex flex-col items-center"
                style={{ left: `${marker.position}%` }}
              >
                <div className="w-px h-full bg-border" />
                <span className="absolute -bottom-6 text-xs text-muted-foreground whitespace-nowrap">
                  {marker.label}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-6 mt-8">
            {apiRows.map(({ api, events, phases }) => (
              <div key={api.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{api.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{api.version}</span>
                </div>

                <div className="relative h-12 bg-muted/20 rounded">
                  {phases.map(phaseBlock => {
                    const startPos = getPositionPercent(phaseBlock.start)
                    const endPos = getPositionPercent(phaseBlock.end)
                    const width = endPos - startPos

                    return (
                      <div
                        key={`${api.id}-${phaseBlock.phase}`}
                        className={`absolute top-2 bottom-2 rounded ${PHASE_COLORS[phaseBlock.phase]} flex items-center justify-center text-xs font-medium px-2`}
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
                        className="absolute top-0 bottom-0 flex flex-col items-center"
                        style={{ left: `${position}%` }}
                      >
                        {event.type === 'milestone' ? (
                          <FlagBanner size={20} weight="fill" className="text-primary" />
                        ) : (
                          <div className="w-2 h-full bg-border" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {timelineData.length === 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <CalendarDots size={24} weight="duotone" />
            <span className="text-sm">No timeline data available. Add milestones and lifecycle phases to your APIs.</span>
          </div>
        </Card>
      )}
    </div>
  )
}
