import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { APIContract } from '@/lib/types'
import { APIList } from '@/components/APIList'
import { APIDetailView } from '@/components/APIDetailView'
import { NewAPIDialog } from '@/components/NewAPIDialog'
import { FileText } from '@phosphor-icons/react'

function App() {
  const [apis, setApis] = useKV<APIContract[]>('openfinance-apis', [])
  const [selectedAPI, setSelectedAPI] = useState<APIContract | null>(null)
  const [newAPIDialogOpen, setNewAPIDialogOpen] = useState(false)

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

  const handleSelectAPI = (api: APIContract) => {
    const latestAPI = currentApis.find(a => a.id === api.id) || api
    setSelectedAPI(latestAPI)
  }

  const handleBack = () => {
    setSelectedAPI(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText size={28} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">OpenFinance API Manager</h1>
              <p className="text-sm text-muted-foreground">Manage API contracts, lifecycle, and metrics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedAPI ? (
          <APIDetailView
            api={selectedAPI}
            onBack={handleBack}
            onUpdate={handleUpdateAPI}
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