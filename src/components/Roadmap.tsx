import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ArrowLeft, CalendarDots, FlagBanner } 
import { APIContract, LifecyclePhase } from '
import { ArrowLeft, CalendarDots, FlagBanner } from '@phosphor-icons/react'
import { format, parseISO, min, max, differenceInDays, subMonths, addMonths } from 'date-fns'
import { APIContract, LifecyclePhase } from '@/lib/types'


  apis: APIContract[]
  certifying: 'bg-[o
}

  retired: 'Retired',

  id: string
  apiName: string
  date: Date
  description?: string
}


    const events: TimelineEvent
    apis.forEach(api => {
        if (phaseData
            id: `${api.id}-
            apiName: 
 

interface TimelineEvent {
        if (
  apiId: string
            apiNa
            date: parseISO(ph
            
        }

        events.push({
 

          title: milestone.title,
        })

    return events.sort((a, b) => a.dat


  }, [apis, selectedApi])
  const dateRange = useMemo(() => {
      return { start: subMonths(ne

    const minDate = min(dates)

      start: subMonths(minDate
    }


    const daysSinceStart = differenceInDays(date, dateRange.
          })
  const a

        .filter(p => p.startDate
          phase: p.phas
          end: p.endDate ? parseISO(p.endDate) : da
        .sort((a, b) => a.
      return {
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
               
      }
      
  }, [filteredApis, timelineData, dateRange.end])

  const monthMarkers = useMemo(() => {
    const markers = []
    let currentDate = new Date(dateRange.start)
    currentDate.setDate(1)

    while (currentDate <= dateRange.end) {
      markers.push({
        date: new Date(currentDate),
        position: getPositionPercent(currentDate),
        <h3 className="text-lg font-display fon
        
      currentDate = addMonths(currentDate, 1)
     

          ))}
  }, [dateRange])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />

        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold">Roadmap</h2>
          <p className="text-sm text-muted-foreground">API lifecycle timeline and milestones</p>

      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <CalendarDots size={24} weight="duotone" className="text-primary" />
          <div>
            <h3 className="text-lg font-display font-semibold">Filter by API</h3>
            <p className="text-sm text-muted-foreground">Select an API to focus on its timeline</p>
          </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedApi === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedApi(null)}

            All APIs

          {apis.map(api => (

              key={api.id}
              variant={selectedApi === api.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedApi(api.id)}
            >

            </Button>

        </div>


      {apiRows.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDots size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No timeline data available</p>

      ) : (

          <div className="space-y-8">
            <div className="relative">
              <div className="flex border-b border-border pb-2 mb-4">
                {monthMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="absolute text-xs text-muted-foreground font-medium"
                    style={{ left: `${marker.position}%`, transform: 'translateX(-50%)' }}
                  >

                  </div>
                ))}
              </div>


            <div className="space-y-6 mt-8">
              {apiRows.map(({ api, events, phases }) => (

                  <div className="flex items-center gap-3">
                    <h4 className="font-display font-semibold text-base">{api.name}</h4>
                    <span className="text-xs text-muted-foreground font-mono">{api.version}</span>


                  <div className="relative h-16 bg-muted/30 rounded-lg border border-border">
                    {phases.map((phaseBlock, idx) => {
                      const startPos = getPositionPercent(phaseBlock.start)
                      const endPos = getPositionPercent(phaseBlock.end)
                      const width = endPos - startPos

                      return (
                        <div
                          key={idx}
                          className={`absolute top-2 bottom-2 rounded ${PHASE_COLORS[phaseBlock.phase]} flex items-center justify-center text-xs font-medium`}

                            left: `${startPos}%`,

                          }}

                          {width > 8 && PHASE_LABELS[phaseBlock.phase]}

                      )
                    })}

                    {events.map(event => {
                      const position = getPositionPercent(event.date)


                        <div

                          className="absolute top-0 bottom-0 flex flex-col items-center justify-center group"
                          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        >

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

            </div>

        </Card>



        <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <FlagBanner size={24} weight="duotone" className="text-primary" />
          Legend

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(PHASE_LABELS).map(([phase, label]) => (
            <div key={phase} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded ${PHASE_COLORS[phase as LifecyclePhase]}`} />
              <span className="text-sm">{label}</span>

          ))}
          <div className="flex items-center gap-2">
            <FlagBanner size={24} weight="fill" className="text-accent" />
            <span className="text-sm">Milestone</span>
          </div>
        </div>
      </Card>

  )

