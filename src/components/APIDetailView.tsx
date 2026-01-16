import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Trash, DownloadSimple } from '@phosphor-icons/react'
import { APIContract } from '@/lib/types'
import { OverviewTab } from './tabs/OverviewTab'
import { LifecycleTab } from './tabs/LifecycleTab'
import { SpecificationTab } from './tabs/SpecificationTab'
import { IssuesTab } from './tabs/IssuesTab'
import { BacklogTab } from './tabs/BacklogTab'
import { PCMTab } from './tabs/PCMTab'
import { TimelineTab } from './tabs/TimelineTab'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'
import { storage } from '@/lib/storage'

interface APIDetailViewProps {
  api: APIContract
  onBack: () => void
  onUpdate: (api: APIContract) => void
  onDelete: (apiId: string) => void
}

export function APIDetailView({ api, onBack, onUpdate, onDelete }: APIDetailViewProps) {
  const { t } = useSettings()
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    storage.setAPIConfig(api.id, api)
  }, [api])

  const handleDeleteConfirm = () => {
    storage.removeAPIConfig(api.id)
    onDelete(api.id)
    toast.success(t.toasts.apiDeleted)
    setDeleteDialogOpen(false)
  }

  const handleExport = () => {
    const exportData = {
      api: {
        id: api.id,
        name: api.name,
        version: api.version,
        summary: api.summary,
        createdAt: api.createdAt,
        updatedAt: api.updatedAt,
      },
      contract: api.yamlContent,
      specification: api.parsedSpec,
      lifecycle: {
        phases: api.lifecyclePhases,
        milestones: api.milestones,
      },
      issues: api.knownIssues,
      backlog: api.backlogItems,
      pcm: api.pcmFields,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${api.name}-v${api.version}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success(t.toasts.apiExported)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold">{api.name}</h1>
          <p className="text-muted-foreground">{t.apiDetail.version} {api.version}</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <DownloadSimple size={20} weight="bold" className="mr-2" />
          {t.apiDetail.export}
        </Button>
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          <Trash size={20} weight="bold" className="mr-2" />
          {t.apiDetail.delete}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">{t.tabs.overview}</TabsTrigger>
          <TabsTrigger value="specification">{t.tabs.specification}</TabsTrigger>
          <TabsTrigger value="lifecycle">{t.tabs.lifecycle}</TabsTrigger>
          <TabsTrigger value="issues">{t.tabs.issues}</TabsTrigger>
          <TabsTrigger value="backlog">{t.tabs.backlog}</TabsTrigger>
          <TabsTrigger value="pcm">{t.tabs.pcm}</TabsTrigger>
          <TabsTrigger value="timeline">{t.tabs.timeline}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab api={api} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="specification">
          <SpecificationTab api={api} />
        </TabsContent>

        <TabsContent value="lifecycle">
          <LifecycleTab api={api} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="issues">
          <IssuesTab api={api} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="backlog">
          <BacklogTab api={api} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="pcm">
          <PCMTab api={api} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab api={api} onUpdate={onUpdate} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteDialog.description} <strong>{api.name}</strong> (v{api.version})? {t.deleteDialog.warning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
