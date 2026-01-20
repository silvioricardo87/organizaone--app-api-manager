import { useState, useRef } from 'react'
  Dialog
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
import { Uploa
} from '@/components/ui/dialog'
  onOpenChange: (open: boolean) => void
  existingAPIs: APIContract[]

  const { t } = useSettings()
  const [selectedFile, setSele

    if (file.type === 'application
    } else {
    }

    e.preventDefault()
 

    }

    if (!selectedFile) return
    try {
      const data = JSON.parse(text)

        return

      const skippedAPIs: st
      for (c
          (existing) => existing.name === api
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    try {
      const text = await selectedFile.text()
      const data = JSON.parse(text)

      if (!Array.isArray(data.apis)) {
        toast.error(t.toasts.invalidFileFormat)
        return
      }

      const apisToImport: APIContract[] = []
      const skippedAPIs: string[] = []

      for (const api of data.apis) {
        const duplicate = existingAPIs.find(
          (existing) => existing.name === api.name && existing.version === api.version
        )


              <div className="flex items-center justify-be
                
                </div>
         
       

                >
                </Button>
            ) : (
        
                  <Button
                    vari
                  >
           
         
        
          </div>

          <But
          </Button>
       
        </div>
    </Dialog>
}









































            {selectedFile ? (
              <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Upload size={20} weight="duotone" className="text-primary" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <>
                <Upload size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t.importAPIDialog.selectFile}
                  </Button>
                  <p className="text-sm text-muted-foreground">{t.importAPIDialog.dropFile}</p>
                  <p className="text-xs text-muted-foreground">{t.importAPIDialog.supportedFormats}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile}>
            {t.common.import}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
