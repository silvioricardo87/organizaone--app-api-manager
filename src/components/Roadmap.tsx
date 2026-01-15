import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDots, FlagBanne
import { APIContract, LifecyclePhase } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { APIContract, LifecyclePhase } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'


  implementing: 'Impl
  current: 'Current'
 

  implementing: 'bg-[oklch(0.75_0.15_70)] text-warning
  current: 'bg-[oklch(0.65_0.20
  retired: 'bg-muted text-m

  id: string
  apiName: string
 

}
export function Roadmap({ apis, onBack }: RoadmapProps) {

    const events: TimelineEvent[] = []
    apis.forEach(api => {
        if (phaseData.startDate) {
 

            date: parseIS
            
        }
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
          <A
        <div className="fl
        phases,
      <
    })
          <CalendarDots size={24} weight="duotone

          </div>
        <div className
            variant={selectedApi === null ? 'de
            onClick={() =>

          {apis.map(api => (
              key={a
              size="sm"
            >
        label: format(currentDate, 'MMM yyyy'),
      })

    }

    return markers
          <div cl

          
                    className="
                  >
                  </div>
              </div>
        </Button>
              {apiRows.map(({ ap
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">{api.version}</spa
        </div>
            


                        <div
                          className={`absolute top-2 bottom-2 rounded ${PHASE_
               
                          }}
                          {width > 8 && PHASE_LABELS[phaseBlock.phase]}
                
        </div>
                      const position = getPosi
                 
                          key={event.id}
                     
                          {event.type === 'miles
          >
                    
          </Button>
                            
            <Button
                          
                            <div className="w-2 h-full bg-border" />
                       
                    })}

              {api.name}
                     
          ))}
              
      </Card>

      )}
      <Card className="p-6">
          <FlagBanner size={24} weight="duotone" className="text-primary" />
        </h3>
        </Card>
           
        <Card className="p-6">
          <div className="flex items-
            <span className="text-sm">
        </div>
    </div>
}




                    {marker.label}



            </div>



                <div key={api.id} className="space-y-3">



                  </div>











                          style={{

                            width: `${width}%`,

                        >

                        </div>






                      return (

                          key={event.id}



                          {event.type === 'milestone' ? (















                        </div>













              ))}

          </div>

      )}

      <Card className="p-6">



        </h3>





            </div>







    </div>

}
