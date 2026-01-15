import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from '@phosphor-icons/react'
import { APIContract, LifecyclePhase, IssueStatus } from '@/lib/types'
import { useSettings } from '@/hooks/use-settings'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface DashboardProps {
  apis: APIContract[]
  onBack: () => void
}

const LIFECYCLE_COLORS: Record<LifecyclePhase, string> = {
  implementing: 'oklch(0.60 0.18 240)',
  certifying: 'oklch(0.65 0.16 260)',
  current: 'oklch(0.65 0.20 140)',
  deprecated: 'oklch(0.75 0.15 70)',
  retired: 'oklch(0.60 0.22 25)',
}

const STATUS_COLORS: Record<IssueStatus, string> = {
  open: 'oklch(0.60 0.22 25)',
  investigating: 'oklch(0.75 0.15 70)',
  resolved: 'oklch(0.65 0.20 140)',
  closed: 'oklch(0.55 0.02 250)',
}

export function Dashboard({ apis, onBack }: DashboardProps) {
  const { t } = useSettings()
  
  const getCurrentPhase = (api: APIContract): LifecyclePhase | null => {
    const now = new Date()
    
    for (const phaseData of api.lifecyclePhases) {
      const start = phaseData.startDate ? new Date(phaseData.startDate) : null
      const end = phaseData.endDate ? new Date(phaseData.endDate) : null
      
      if (start && start <= now && (!end || end >= now)) {
        return phaseData.phase
      }
    }
    
    const latestPhase = api.lifecyclePhases
      .filter(p => p.startDate)
      .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime())[0]
    
    return latestPhase?.phase || null
  }

  const lifecycleData = useMemo(() => {
    const phaseCounts: Record<LifecyclePhase, number> = {
      implementing: 0,
      certifying: 0,
      current: 0,
      deprecated: 0,
      retired: 0,
    }

    apis.forEach(api => {
      const phase = getCurrentPhase(api)
      if (phase) {
        phaseCounts[phase]++
      }
    })

    return Object.entries(phaseCounts)
      .filter(([_, count]) => count > 0)
      .map(([phase, count]) => ({
        name: t.badges[phase as LifecyclePhase],
        value: count,
        color: LIFECYCLE_COLORS[phase as LifecyclePhase],
      }))
  }, [apis])

  const issueStatusData = useMemo(() => {
    const statusCounts: Record<IssueStatus, number> = {
      open: 0,
      investigating: 0,
      resolved: 0,
      closed: 0,
    }

    apis.forEach(api => {
      api.knownIssues.forEach(issue => {
        statusCounts[issue.status]++
      })
    })

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: t.badges[status as IssueStatus],
        value: count,
        color: STATUS_COLORS[status as IssueStatus],
      }))
  }, [apis])

  const issuesByAPIData = useMemo(() => {
    return apis
      .map(api => ({
        name: api.name.length > 20 ? api.name.substring(0, 20) + '...' : api.name,
        issues: api.knownIssues.length,
        open: api.knownIssues.filter(i => i.status === 'open').length,
        investigating: api.knownIssues.filter(i => i.status === 'investigating').length,
      }))
      .filter(api => api.issues > 0)
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 10)
  }, [apis])

  const backlogStatusData = useMemo(() => {
    const statusCounts = {
      backlog: 0,
      in_progress: 0,
      completed: 0,
    }

    apis.forEach(api => {
      api.backlogItems.forEach(item => {
        statusCounts[item.status]++
      })
    })

    return [
      { name: 'Backlog', value: statusCounts.backlog, color: 'oklch(0.60 0.22 25)' },
      { name: 'In Progress', value: statusCounts.in_progress, color: 'oklch(0.75 0.15 70)' },
      { name: 'Completed', value: statusCounts.completed, color: 'oklch(0.65 0.20 140)' },
    ].filter(item => item.value > 0)
  }, [apis])

  const totalIssues = apis.reduce((sum, api) => sum + api.knownIssues.length, 0)
  const totalBacklog = apis.reduce((sum, api) => sum + api.backlogItems.length, 0)
  const totalAPIs = apis.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-display font-bold">{t.dashboard.title}</h2>
          <p className="text-sm text-muted-foreground">{t.dashboard.overview}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.dashboard.totalAPIs}</div>
          <div className="text-3xl font-display font-bold">{totalAPIs}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.issues.title}</div>
          <div className="text-3xl font-display font-bold">{totalIssues}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">{t.improvements.title}</div>
          <div className="text-3xl font-display font-bold">{totalBacklog}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">{t.dashboard.byPhase}</h3>
          {lifecycleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={lifecycleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {lifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {t.dashboard.noLifecycleData}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">{t.dashboard.issueStatusDistribution}</h3>
          {issueStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issueStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issueStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {t.dashboard.noIssuesData}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">{t.dashboard.backlogStatus}</h3>
          {backlogStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={backlogStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {backlogStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {t.dashboard.noBacklogData}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">{t.dashboard.issuesByAPI}</h3>
          {issuesByAPIData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issuesByAPIData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.005 250)" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="open" stackId="a" fill="oklch(0.60 0.22 25)" name="Open" />
                <Bar dataKey="investigating" stackId="a" fill="oklch(0.75 0.15 70)" name="Investigating" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {t.dashboard.noIssuesToDisplay}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
