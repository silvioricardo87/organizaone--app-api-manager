import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APIContract } from '@/lib/types'
import { PhaseIndicator } from '../PhaseIndicator'
import { format } from 'date-fns'

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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-display font-semibold mb-4">API Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
            <dd className="mt-1 text-sm">{api.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Version</dt>
            <dd className="mt-1">
              <Badge variant="outline">{api.version}</Badge>
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">Summary</dt>
            <dd className="mt-1 text-sm">{api.summary}</dd>
          </div>
          {currentPhase && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Current Phase</dt>
              <dd className="mt-1">
                <PhaseIndicator phase={currentPhase.phase} />
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Created</dt>
            <dd className="mt-1 text-sm">{format(new Date(api.createdAt), 'PPP')}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
            <dd className="mt-1 text-sm">{format(new Date(api.updatedAt), 'PPP')}</dd>
          </div>
          {api.parsedSpec && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Endpoints</dt>
              <dd className="mt-1 text-sm">{Object.keys(api.parsedSpec.paths || {}).length}</dd>
            </div>
          )}
        </dl>
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
