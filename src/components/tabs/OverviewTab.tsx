import { Card } from '@/components/ui/card'
import { APIContract } from '@/lib/types'
import { PhaseIndicator } from '../PhaseIndicator'
import { format } from 'date-fns'
import { useMemo } from 'react'

interface OverviewTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

export function OverviewTab({ api }: OverviewTabProps) {
  const currentPhase = api.lifecyclePhases.find(p => {
    if (!p.startDate) return false
    const now = new Date()
    const start = new Date(p.startDate)
    const end = p.endDate ? new Date(p.endDate) : null
    return start <= now && (!end || end >= now)
  })

  const markdownContent = useMemo(() => {
    const lines: string[] = []
    
    lines.push(`# ${api.name}`)
    lines.push('')
    lines.push(`**Version:** \`${api.version}\``)
    lines.push('')
    lines.push(`## Summary`)
    lines.push('')
    lines.push(api.summary)
    lines.push('')
    
    if (currentPhase) {
      lines.push(`## Current Phase`)
      lines.push('')
      lines.push(`**${currentPhase.phase.toUpperCase()}**`)
      lines.push('')
    }
    
    lines.push(`## Details`)
    lines.push('')
    lines.push(`- **Created:** ${format(new Date(api.createdAt), 'PPP')}`)
    lines.push(`- **Last Updated:** ${format(new Date(api.updatedAt), 'PPP')}`)
    
    if (api.parsedSpec) {
      const endpointCount = Object.keys(api.parsedSpec.paths || {}).length
      lines.push(`- **Total Endpoints:** ${endpointCount}`)
    }
    
    lines.push('')
    lines.push(`## Statistics`)
    lines.push('')
    lines.push(`| Metric | Count | Details |`)
    lines.push(`|--------|-------|---------|`)
    lines.push(`| Known Issues | ${api.knownIssues.length} | ${api.knownIssues.filter(i => i.status === 'open').length} open |`)
    lines.push(`| Backlog Items | ${api.backlogItems.length} | ${api.backlogItems.filter(i => i.status === 'in_progress').length} in progress |`)
    lines.push(`| PCM Fields | ${api.pcmFields.length} | configured |`)
    
    return lines.join('\n')
  }, [api, currentPhase])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-display font-semibold mb-4">API Information</h2>
        <div className="prose prose-sm max-w-none">
          <div className="font-mono text-sm bg-muted/30 p-6 rounded-lg border border-border whitespace-pre-wrap">
            {markdownContent}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-2">Known Issues</h3>
          <p className="text-3xl font-bold text-destructive">{api.knownIssues.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {api.knownIssues.filter(i => i.status === 'open').length} open
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-2">Backlog Items</h3>
          <p className="text-3xl font-bold text-accent">{api.backlogItems.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {api.backlogItems.filter(i => i.status === 'in_progress').length} in progress
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-2">PCM Fields</h3>
          <p className="text-3xl font-bold text-primary">{api.pcmFields.length}</p>
          <p className="text-sm text-muted-foreground mt-1">configured</p>
        </Card>
      </div>
    </div>
  )
}
