import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { APIContract } from '@/lib/types'
import { APIList } from '@/components/APIList'
import { APIDetailView } from '@/components/APIDetailView'
import { NewAPIDialog } from '@/components/NewAPIDialog'
import { Dashboard } from '@/components/Dashboard'
import { Roadmap } from '@/components/Roadmap'
import { FileText, ChartBar, MapTrifold } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

type View = 'list' | 'dashboard' | 'roadmap' | 'detail'

function App() {
  const [apis, setApis] = useKV<APIContract[]>('openfinance-apis', [])
  const [selectedAPI, setSelectedAPI] = useState<APIContract | null>(null)
  const [newAPIDialogOpen, setNewAPIDialogOpen] = useState(false)
  const [currentView, setCurrentView] = useState<View>('list')

  const currentApis = apis || []

  const handleSaveNewAPI = (api: APIContract) => {
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
                <h1 className="text-2xl font-display font-bold">OpenFinance API Manager</h1>
                <p className="text-sm text-muted-foreground">Manage API contracts, lifecycle, and metrics</p>
              </div>
            </div>
            {currentView === 'list' && currentApis.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
                  <ChartBar size={20} weight="duotone" className="mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('roadmap')}>
                  <MapTrifold size={20} weight="duotone" className="mr-2" />
                  Roadmap
                </Button>
              </div>
            )}
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
          />
        )}
      </main>

      <NewAPIDialog
        open={newAPIDialogOpen}
        onOpenChange={setNewAPIDialogOpen}
        onSave={handleSaveNewAPI}
      />

      <Toaster />
    </div>
  )
}

export default App