import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash, Pencil } from '@phosphor-icons/react'
import { APIContract, BacklogItem, BacklogOrigin, BacklogStatus } from '@/lib/types'
import { generateId } from '@/lib/api-utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useSettings } from '@/hooks/use-settings'

interface BacklogTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

const statusColorConfig: Record<BacklogStatus, string> = {
  backlog: 'bg-secondary text-secondary-foreground',
  in_progress: 'bg-info text-info-foreground',
  completed: 'bg-success text-success-foreground'
}

export function BacklogTab({ api, onUpdate }: BacklogTabProps) {
  const { t } = useSettings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BacklogItem | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [proposal, setProposal] = useState('')
  const [origin, setOrigin] = useState<BacklogOrigin>('ticket')
  const [status, setStatus] = useState<BacklogStatus>('backlog')

  const openDialog = (item?: BacklogItem) => {
    if (item) {
      setEditingItem(item)
      setTitle(item.title)
      setDescription(item.description)
      setProposal(item.proposal)
      setOrigin(item.origin)
      setStatus(item.status)
    } else {
      setEditingItem(null)
      setTitle('')
      setDescription('')
      setProposal('')
      setOrigin('ticket')
      setStatus('backlog')
    }
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    const now = new Date().toISOString()
    let updatedItems: BacklogItem[]

    if (editingItem) {
      updatedItems = api.backlogItems.map(item =>
        item.id === editingItem.id
          ? { ...item, title, description, proposal, origin, status, updatedAt: now }
          : item
      )
      toast.success('Backlog item updated')
    } else {
      const newItem: BacklogItem = {
        id: generateId(),
        title,
        description,
        proposal,
        origin,
        status,
        createdAt: now,
        updatedAt: now
      }
      updatedItems = [...api.backlogItems, newItem]
      toast.success('Backlog item created')
    }

    onUpdate({
      ...api,
      backlogItems: updatedItems,
      updatedAt: now
    })

    setDialogOpen(false)
  }

  const handleDelete = (itemId: string) => {
    if (!confirm('Are you sure you want to delete this backlog item?')) return

    const updatedItems = api.backlogItems.filter(item => item.id !== itemId)
    onUpdate({
      ...api,
      backlogItems: updatedItems,
      updatedAt: new Date().toISOString()
    })
    toast.success('Backlog item deleted')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openDialog()}>
          <Plus size={20} weight="bold" className="mr-2" />
          Add Backlog Item
        </Button>
      </div>

      {api.backlogItems.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No backlog items yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {api.backlogItems.map(item => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-display font-semibold">{item.title}</h3>
                    <Badge className={statusColorConfig[item.status]}>
                      {t.badges[item.status === 'in_progress' ? 'inProgress' : item.status]}
                    </Badge>
                    <Badge variant="outline">
                      {item.origin === 'GT' ? t.badges.workingGroup : item.origin === 'Banco Central' ? t.badges.centralBank : t.badges.ticket}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  {item.proposal && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-xs font-medium mb-1">Proposal:</p>
                      <p className="text-sm">{item.proposal}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Updated {format(new Date(item.updatedAt), 'PPP')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                    <Pencil size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Backlog Item' : 'New Backlog Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the backlog item details' : 'Add a new improvement or enhancement'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backlog-title">Title *</Label>
              <Input
                id="backlog-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title of the improvement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backlog-description">Description</Label>
              <Textarea
                id="backlog-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the enhancement"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backlog-proposal">Proposal</Label>
              <Textarea
                id="backlog-proposal"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Proposed solution or implementation approach"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backlog-origin">Origin</Label>
                <Select value={origin} onValueChange={(value) => setOrigin(value as BacklogOrigin)}>
                  <SelectTrigger id="backlog-origin">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="GT">GT</SelectItem>
                    <SelectItem value="Banco Central">Banco Central</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backlog-status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as BacklogStatus)}>
                  <SelectTrigger id="backlog-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
