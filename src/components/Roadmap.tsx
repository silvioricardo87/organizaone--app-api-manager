import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDots, FlagBanner } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Badge } from '@/components/ui/badge'
const PHASE_LABELS: Record<LifecyclePhase, stri
  certifying: 'Certifying',
  deprecated: 'Deprecated',

const PHASE_COLORS: Record<LifecyclePhase, string> = {
  certifying: 'bg-[oklch(0.60_0
  deprecated: 'bg-[oklch(0.
}
interface RoadmapProps {
  onBack: () => void


  apiName: string
  date: Date
  title: string
}
export function Roadmap({ apis, onBack }: RoadmapProps) {

 

        if (phaseData.st
            id: `${ap
            apiName:
 

        }
        if (
            id:
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

    const minDate = min(dates)

      start: subMonths(minDate
    }


    const daysSinceStart = differenceInDays(date, dateRange.
  }
  const a

        .filter(p => p.startDate
          phase: p.phas
          end: p.endDate ? parseISO(p.endDate) : da
        .sort((a, b) => a.
      return {
        events: apiEvents,
      }
  }, [filteredApis, timelineData, d
  const monthMarkers = useMemo(() => {
    let curr

      ma

      })
    }
    return markers

    <div className="space-y-
        <Button variant="gho
          Back
        <div className="flex item
          <h2 className="text-2xl font-displa
      </di
      <d
      

          All APIs
        {api

            variant={selectedApi === a
          >
          </Button>
      </div>

          <div className="relative 
              <div
                className="absolute top-0 bottom-0 flex flex-col items-center"
     

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
            
          </div>
        phases,
  )
    })











        label: format(currentDate, 'MMM yyyy'),
      })

    }

    return markers








        </Button>



        </div>
















          >

          </Button>



      <Card className="p-6">

































































        </div>







          </div>

      )}
    </div>

}
