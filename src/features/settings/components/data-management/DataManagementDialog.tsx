import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Download, Database } from '@phosphor-icons/react'
import { APIContract } from '@/shared/lib/types'
import { useSettings } from '@/shared/hooks/use-settings'
import { ExportView } from './ExportView'
import { ImportView } from './ImportView'

interface DataManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apis: APIContract[]
  onImport: (apis: APIContract[]) => void
}

type ViewState = 'menu' | 'export' | 'import' | 'sample'

export function DataManagementDialog({ open, onOpenChange, apis, onImport }: DataManagementDialogProps) {
  const { t } = useSettings()
  const [viewState, setViewState] = useState<ViewState>('menu')

  const handleClose = () => {
    setViewState('menu')
    onOpenChange(false)
  }

  const getDescription = () => {
    switch (viewState) {
      case 'menu': return t('settings.dataManagementDescription')
      case 'export': return t('settings.exportDescription')
      case 'import': return t('settings.importDescription')
      case 'sample': return t('settings.loadSampleDataDescription')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('settings.dataManagement')}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {viewState === 'menu' && (
          <div className="grid grid-cols-3 gap-4 py-4">
            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setViewState('export')}>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Download size={32} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1">{t('settings.exportData')}</h3>
                  <p className="text-sm text-muted-foreground">{t('settings.exportDataDescription')}</p>
                </div>
                <Button variant="outline" className="w-full">
                  {t('settings.exportData')}
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setViewState('import')}>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-accent/10 rounded-full">
                  <Upload size={32} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1">{t('settings.importData')}</h3>
                  <p className="text-sm text-muted-foreground">{t('settings.importDataDescription')}</p>
                </div>
                <Button variant="outline" className="w-full">
                  {t('settings.importData')}
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => setViewState('sample')}>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-green-500/10 rounded-full">
                  <Database size={32} weight="duotone" className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1">{t('settings.loadSampleData')}</h3>
                  <p className="text-sm text-muted-foreground">{t('settings.loadSampleDataDescription')}</p>
                </div>
                <Button variant="outline" className="w-full">
                  {t('settings.loadSampleData')}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {viewState === 'export' && (
          <ExportView apis={apis} onClose={handleClose} />
        )}

        {viewState === 'import' && (
          <ImportView
            apis={apis}
            onImport={onImport}
            onClose={handleClose}
            autoMapPCM={true}
            mode="import"
          />
        )}

        {viewState === 'sample' && (
          <ImportView
            apis={apis}
            onImport={onImport}
            onClose={handleClose}
            autoMapPCM={true}
            mode="sample"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
