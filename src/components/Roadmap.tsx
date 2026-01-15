import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
interface RoadmapProps {
  onBack: () => void


interface RoadmapProps {
  apis: APIContract[]
  onBack: () => void
}

  certifying: 'Certifying
  deprecated
}
const PHASE_COLOR
  certifying: 'bg-[oklch(0.65
  deprecated
}
export function

 

        if (phaseData.startDate) {
            id: `${api.id}-${ph
            apiName: api.na
            date: par
            title: `${PHASE
        }
 

            type: 'phase',
            phase: phaseData.phase,
          })
      })
      api.milestones.forEach(milestone =>
          id: milestone.id,
}         apiId: api.id,
     apiName: api.name,
          date: parseISO(milestone.date),
          title: milestone.title,
          description: milestone.description,
        })
      })


    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [apis])

            id: `${api.id}-${phaseData.phase}-start`,
    if (!selectedApi) return apis
    return apis.filter(api => api.id === selectedApi)
  }, [apis, selectedApi])

            phase: phaseData.phase,
    if (timelineData.length === 0) {
      const now = new Date()
        }
        start: subMonths(now, 3),
        end: addMonths(now, 3),
      }
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
    let currentDate = new Date(dateRange.start)
    const markers: { position: number; label: string }[] = []

    while (currentDate <= dateRange.end) {
      markers.push({
        position: getPositionPercent(currentDate),
        label: format(currentDate, 'MMM yyyy'),
      })

      currentDate = addMonths(currentDate, 1)
    }

    return markers
  }, [dateRange, totalDays])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-display font-bold">API Roadmap</h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedApi === null ? 'default' : 'outline'}
          onClick={() => setSelectedApi(null)}
        >
          All APIs
        </Button>
        {apis.map(api => (
          <Button
            key={api.id}
            variant={selectedApi === api.id ? 'default' : 'outline'}
            onClick={() => setSelectedApi(api.id)}
          >
    let currentDate = new Date(dateRange.start)
    const markers: { position: number; label: string }[] = []

    while (currentDate <= dateRange.end) {
      markers.push({
        position: getPositionPercent(currentDate),
        label: format(currentDate, 'MMM yyyy'),
      })

      currentDate = addMonths(currentDate, 1)
    }

    return markers
  }, [dateRange, totalDays])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-display font-bold">API Roadmap</h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedApi === null ? 'default' : 'outline'}
          onClick={() => setSelectedApi(null)}
        >
          All APIs
        </Button>
        {apis.map(api => (
          <Button
            key={api.id}
            variant={selectedApi === api.id ? 'default' : 'outline'}
            onClick={() => setSelectedApi(api.id)}
          >
            {api.name}
          </Button>
        ))}
      </div>

      {timelineData.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDots size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No timeline data available. Add lifecycle phases or milestones to APIs.
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="relative min-h-[400px]">
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center border-b border-border">
              {monthMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 h-full flex flex-col items-center"
                  style={{ left: `${marker.position}%` }}
                >
                  <div className="w-px h-full bg-border" />
                  <span className="absolute top-2 text-xs text-muted-foreground whitespace-nowrap">
                    {marker.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-16 space-y-8">
              {apiRows.map(({ api, events, phases }) => (
                <div key={api.id} className="relative">
                  <div className="mb-2">
                    <h3 className="font-display font-semibold">{api.name}</h3>
                    <p className="text-sm text-muted-foreground">{api.version}</p>
                  </div>

                  <div className="relative h-16 bg-muted/30 rounded-lg">
                    {phases.map((phaseData, idx) => {
                      const startPercent = getPositionPercent(phaseData.start)
                      const endPercent = getPositionPercent(phaseData.end)
                      const widthPercent = endPercent - startPercent

                      return (
                        <div
                          key={idx}
                          className={`absolute top-2 bottom-2 ${PHASE_COLORS[phaseData.phase]} rounded opacity-80`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                        >
                          <div className="px-2 py-1 text-xs text-white font-medium truncate">
                            {PHASE_LABELS[phaseData.phase]}
        </Card>
                        </div>
                      )
                    })}

                    {events
                      .filter(e => e.type === 'milestone')
                      .map(event => {
                        const position = getPositionPercent(event.date)
                        return (
                          <div
                            key={event.id}
                            className="absolute top-0 bottom-0 flex flex-col items-center"
                            style={{ left: `${position}%` }}
                          >
                            <div className="w-0.5 h-full bg-accent" />
                            <div className="absolute top-1/2 -translate-y-1/2">
                              <FlagBanner size={20} weight="fill" className="text-accent" />
                            </div>
                          </div>
