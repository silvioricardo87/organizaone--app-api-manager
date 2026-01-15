import { Card } from '@/components/ui/card'
import { APIContract } from '@/lib/types'
import { PhaseIndicator } from '../PhaseIndicator'
import { formatDate } from '@/lib/i18n'
import { useSettings } from '@/hooks/use-settings'

interface OverviewTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

export function OverviewTab({ api }: OverviewTabProps) {
  const { t, language } = useSettings()
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
        <h2 className="text-xl font-display font-semibold mb-4">{t.apiDetail.apiInformation}</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">{t.apiDetail.name}</dt>
            <dd className="text-base">{api.name}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">{t.apiDetail.version}</dt>
            <dd className="text-base font-mono">{api.version}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">{t.apiDetail.description}</dt>
            <dd className="text-base">{api.summary}</dd>
          </div>
          
          {currentPhase && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">{t.apiDetail.currentPhase}</dt>
              <dd className="text-base">
                <PhaseIndicator phase={currentPhase.phase} />
              </dd>
            </div>
          )}
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">{t.dates.created}</dt>
            <dd className="text-base">{formatDate(new Date(api.createdAt), 'long', language)}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">{t.dates.lastUpdated}</dt>
            <dd className="text-base">{formatDate(new Date(api.updatedAt), 'long', language)}</dd>
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
