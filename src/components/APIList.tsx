import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass, Plus, FileText, UploadSimple, PencilSimple } from '@phosphor-icons/react'
import { APIContract, LifecyclePhase } from '@/lib/types'
import { PhaseIndicator } from './PhaseIndicator'
import { ImportAPIDialog } from './ImportAPIDialog'
import { EditAPIDialog } from './EditAPIDialog'
import { useSettings } from '@/hooks/use-settings'
import { format } from 'date-fns'

interface APIListProps {
  apis: APIContract[]
  onSelectAPI: (api: APIContract) => void
  onUpdateAPI: (api: APIContract) => void
  onNewAPI: () => void
  onImportAPI: (api: APIContract) => void
}

export function APIList({ apis, onSelectAPI, onUpdateAPI, onNewAPI, onImportAPI }: APIListProps) {
  const { t } = useSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editingAPI, setEditingAPI] = useState<APIContract | null>(null)

  const filteredAPIs = useMemo(() => {
    if (!searchQuery.trim()) return apis

    const normalize = (str: string) => 
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

    const query = normalize(searchQuery)
    
    return apis.filter(api =>
      normalize(api.name).includes(query) ||
      (api.apiGroup && normalize(api.apiGroup).includes(query)) ||
      normalize(api.version).includes(query) ||
      normalize(api.summary).includes(query)
    )
  }, [apis, searchQuery])

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

  if (apis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileText size={48} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-display font-semibold mb-2">{t.apiList.noAPIs}</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t.apiList.noAPIsDescription}
        </p>
        <Button onClick={onNewAPI} size="lg">
          <Plus size={20} weight="bold" className="mr-2" />
          {t.apiList.newAPI}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder={t.apiList.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <UploadSimple size={20} weight="bold" className="mr-2" />
            {t.common.import}
          </Button>
          <Button onClick={onNewAPI}>
            <Plus size={20} weight="bold" className="mr-2" />
            {t.apiList.newAPI}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAPIs.map(api => {
          const currentPhase = getCurrentPhase(api)
          const displayTitle = api.useDisplayName && api.displayName ? api.displayName : api.name
          
          return (
            <Card
              key={api.id}
              className="p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => onSelectAPI(api)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-lg leading-tight truncate">{displayTitle}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingAPI(api)
                      }}
                    >
                      <PencilSimple size={16} weight="bold" />
                    </Button>
                    {currentPhase && <PhaseIndicator phase={currentPhase} />}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {api.summary}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">
                    {t.apiList.version} {api.version}
                  </Badge>
                  {api.apiGroup && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                      {api.apiGroup}
                    </Badge>
                  )}
                  {api.isBeta && (
                    <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-900/50 transition-colors">
                      Beta
                    </Badge>
                  )}
                  {api.knownIssues.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {api.knownIssues.length} {api.knownIssues.length === 1 ? t.issues.title.slice(0, -1) : t.issues.title}
                    </Badge>
                  )}
                  {api.backlogItems.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {api.backlogItems.length} {t.improvements.title}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {t.dates.lastUpdated} {format(new Date(api.updatedAt), 'MMM d, yyyy')}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredAPIs.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.apiList.noResults} "{searchQuery}"</p>
        </div>
      )}

      <ImportAPIDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={onImportAPI}
        existingAPIs={apis}
      />

      {editingAPI && (
        <EditAPIDialog
          open={!!editingAPI}
          onOpenChange={(open) => !open && setEditingAPI(null)}
          api={editingAPI}
          onSave={onUpdateAPI}
        />
      )}
    </div>
  )
}
