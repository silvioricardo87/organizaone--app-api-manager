import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CalendarDots, FlagBanne
import { ArrowLeft, CalendarDots, FlagBanner } from '@phosphor-icons/react'
import { APIContract, LifecyclePhase } from '@/lib/types'
import { format, parseISO, addMonths, subMonths, differenceInDays, min, max } from 'date-fns'

interface RoadmapProps {
const PHASE_LABELS: R
  onBack: () => void
 

const PHASE_LABELS: Record<LifecyclePhase, string> = {
  implementing: 'Implementing',
  certifying: 'Certifying',
  current: 'Current',
  deprecated: 'Deprecated',
  retired: 'Retired',


const PHASE_COLORS: Record<LifecyclePhase, string> = {
  implementing: 'bg-[oklch(0.60_0.18_240)]',
  certifying: 'bg-[oklch(0.65_0.16_260)]',
  current: 'bg-[oklch(0.65_0.20_140)]',
  phase?: LifecyclePhase
  retired: 'bg-[oklch(0.60_0.22_25)]',
e

  const timelineData = us
  id: string
    apis.forEac
  apiName: string
          ap
          title
          type: 'miles
      })

 

    return apis.filter(api => api.id === selectedApi)


      return {
        end: addMonths(now, 3),

    const dates = timelin
    const maxDate = max(dates)
    return {
      end: addMonths(ma
  }, [timelineData])
  const totalDays = differ
  const getPositionPercent = (
    return (daysSinceStart / totalDays) * 100

    return filteredApis.ma
      const phases = api.lifecycleP
        .map
         
        

        api,
        phases,
    })

    let currentDate = new Da

      markers.push({
        label: format(currentDate, 'MMM yyyy'

    }
    retu


        <Button variant="ghost" onClick={onBack}>
          Ba


        <Button
          onClick={() => setSelectedApi(null)}
          All APIs

            key={api.id}
            onClick={() => setSelect
            {api.name}
        ))}

        <Card className="p-12 t
       
     

          <div className="relative min-h-[400px
              {monthMarkers.ma
                  key={idx}

            
                    {marker.label}
                </div>
     
            <div cla

                    <h3 className="font-display font-semibold">{api.

                  <div className="relative h-1
                      const startPercent = getPositionPercent(phas
                      const widthPercent = en
   

                          style={
                            width: `
                        >
                            {PHASE_LABEL
                        </div>
                    
                    {even
                      .map(event => {
                        return (
           
                            style={{ left: `${position}%` }}

              
            
                      })}
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

                          className={`absolute top-2 bottom-2 ${PHASE_COLORS[phaseData.phase]} rounded opacity-80`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                          }}

                          <div className="px-2 py-1 text-xs text-white font-medium truncate">

                          </div>
                        </div>
                      )


                    {events
                      .filter(e => e.type === 'milestone')

                        const position = getPositionPercent(event.date)

                          <div
                            key={event.id}
                            className="absolute top-0 bottom-0 flex flex-col items-center"
                            style={{ left: `${position}%` }}
                          >
                            <div className="w-0.5 h-full bg-accent" />
                            <div className="absolute top-1/2 -translate-y-1/2">
                              <FlagBanner size={20} weight="fill" className="text-accent" />
                            </div>













