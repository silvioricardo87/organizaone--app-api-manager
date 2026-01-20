import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { APIContract } from '@/lib/types'
import { APIList } from '@/components/APIList'
import { APIDetailView } from '@/components/APIDetailView'
import { NewAPIDialog } from '@/components/NewAPIDialog'
import { DataManagementDialog } from '@/components/DataManagementDialog'
import { Dashboard } from '@/components/Dashboard'
import { Roadmap } from '@/components/Roadmap'
import { SettingsMenu } from '@/components/SettingsMenu'
import { useSettings } from '@/hooks/use-settings'
import { usePersistedKV } from '@/hooks/use-persisted-kv'
import { STORAGE_KEYS, storage } from '@/lib/storage'
import { FileText, ChartBar, MapTrifold } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

type View = 'list' | 'dashboard' | 'roadmap' | 'detail'

function App() {
  const { t } = useSettings()
  const [apis, setApis] = usePersistedKV<APIContract[]>(STORAGE_KEYS.APIS, [])
  const [selectedAPI, setSelectedAPI] = useState<APIContract | null>(null)
  const [newAPIDialogOpen, setNewAPIDialogOpen] = useState(false)
  const [dataManagementDialogOpen, setDataManagementDialogOpen] = useState(false)
  const [currentView, setCurrentView] = useState<View>('list')

  const currentApis = apis || []

  const handleSaveNewAPI = (api: APIContract) => {
    setApis((currentApis) => [...(currentApis || []), api])
  }

  const handleImportAPI = (api: APIContract) => {
    setApis((currentApis) => [...(currentApis || []), api])
  }

  const handleUpdateAPI = (updatedAPI: APIContract) => {
    setApis((currentApis) =>
      (currentApis || []).map(api => api.id === updatedAPI.id ? updatedAPI : api)
    )
    setSelectedAPI(updatedAPI)
  }

  const handleDeleteAPI = (apiId: string) => {
    setApis((currentApis) => (currentApis || []).filter(api => api.id !== apiId))
    storage.removeAPIConfig(apiId)
    setSelectedAPI(null)
    setCurrentView('list')
  }

  const handleSelectAPI = (api: APIContract) => {
    const latestAPI = currentApis.find(a => a.id === api.id) || api
    setSelectedAPI(latestAPI)
    setCurrentView('detail')
  }

  const handleBack = () => {
    setSelectedAPI(null)
    setCurrentView('list')
  }

  const handleBackFromDashboard = () => {
    setCurrentView('list')
  }

  const handleBackFromRoadmap = () => {
    setCurrentView('list')
  }

  const handleBatchImport = (importedApis: APIContract[]) => {
    setApis((currentApis) => [...(currentApis || []), ...importedApis])
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText size={28} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">{t.header.title}</h1>
                <p className="text-sm text-muted-foreground">{t.header.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {currentView === 'list' && currentApis.length > 0 && (
                <>
                  <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
                    <ChartBar size={20} weight="duotone" className="mr-2" />
                    {t.header.dashboard}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView('roadmap')}>
                    <MapTrifold size={20} weight="duotone" className="mr-2" />
                    {t.header.roadmap}
                  </Button>
                </>
              )}
              <SettingsMenu 
                apis={currentApis}
                onOpenDataManagement={() => setDataManagementDialogOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard apis={currentApis} onBack={handleBackFromDashboard} />
        ) : currentView === 'roadmap' ? (
          <Roadmap apis={currentApis} onBack={handleBackFromRoadmap} />
        ) : currentView === 'detail' && selectedAPI ? (
          <APIDetailView
            api={selectedAPI}
            onBack={handleBack}
            onUpdate={handleUpdateAPI}
            onDelete={handleDeleteAPI}
          />
        ) : (
          <APIList
            apis={currentApis}
            onSelectAPI={handleSelectAPI}
            onNewAPI={() => setNewAPIDialogOpen(true)}
            onImportAPI={handleImportAPI}
          />
        )}
      </main>

      <NewAPIDialog
        open={newAPIDialogOpen}
        onOpenChange={setNewAPIDialogOpen}
        onSave={handleSaveNewAPI}
        existingAPIs={currentApis}
      />

      <DataManagementDialog
        open={dataManagementDialogOpen}
        onOpenChange={setDataManagementDialogOpen}
        apis={currentApis}
        onImport={handleBatchImport}
      />

      <Toaster />
    </div>
  )
}

export default App