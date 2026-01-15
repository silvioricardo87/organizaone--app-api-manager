import { Card } from '@/components/ui/card'
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

  const endpointCount = api.parsedSpec ? Object.keys(api.parsedSpec.paths || {}).length : 0

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-display font-semibold mb-4">API Information</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Name</dt>
            <dd className="text-base">{api.name}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Version</dt>
            <dd className="text-base font-mono">{api.version}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Summary</dt>
            <dd className="text-base">{api.summary}</dd>
          </div>
          
          {currentPhase && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Current Phase</dt>
              <dd className="text-base">
                <PhaseIndicator phase={currentPhase.phase} />
              </dd>
            </div>
          )}
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Created</dt>
            <dd className="text-base">{format(new Date(api.createdAt), 'PPP')}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">Last Updated</dt>
            <dd className="text-base">{format(new Date(api.updatedAt), 'PPP')}</dd>
          </div>
          
          {endpointCount > 0 && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Total Endpoints</dt>
              <dd className="text-base">{endpointCount}</dd>
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
