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
import { APIContract, KnownIssue, IssueStatus } from '@/lib/types'
import { generateId } from '@/lib/api-utils'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface IssuesTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

const statusConfig: Record<IssueStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-destructive text-destructive-foreground' },
  investigating: { label: 'Investigating', color: 'bg-warning text-warning-foreground' },
  resolved: { label: 'Resolved', color: 'bg-success text-success-foreground' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground' }
}

export function IssuesTab({ api, onUpdate }: IssuesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState<KnownIssue | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<IssueStatus>('open')

  const openDialog = (issue?: KnownIssue) => {
    if (issue) {
      setEditingIssue(issue)
      setTitle(issue.title)
      setDescription(issue.description)
      setStatus(issue.status)
    } else {
      setEditingIssue(null)
      setTitle('')
      setDescription('')
      setStatus('open')
    }
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    const now = new Date().toISOString()
    let updatedIssues: KnownIssue[]

    if (editingIssue) {
      updatedIssues = api.knownIssues.map(issue =>
        issue.id === editingIssue.id
          ? { ...issue, title, description, status, updatedAt: now }
          : issue
      )
      toast.success('Issue updated')
    } else {
      const newIssue: KnownIssue = {
        id: generateId(),
        title,
        description,
        status,
        createdAt: now,
        updatedAt: now
      }
      updatedIssues = [...api.knownIssues, newIssue]
      toast.success('Issue created')
    }

    onUpdate({
      ...api,
      knownIssues: updatedIssues,
      updatedAt: now
    })

    setDialogOpen(false)
  }

  const handleDelete = (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) return

    const updatedIssues = api.knownIssues.filter(issue => issue.id !== issueId)
    onUpdate({
      ...api,
      knownIssues: updatedIssues,
      updatedAt: new Date().toISOString()
    })
    toast.success('Issue deleted')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openDialog()}>
          <Plus size={20} weight="bold" className="mr-2" />
          Add Issue
        </Button>
      </div>

      {api.knownIssues.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No known issues reported yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {api.knownIssues.map(issue => (
            <Card key={issue.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display font-semibold">{issue.title}</h3>
                    <Badge className={statusConfig[issue.status].color}>
                      {statusConfig[issue.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {format(new Date(issue.updatedAt), 'PPP')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(issue)}>
                    <Pencil size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(issue.id)}>
                    <Trash size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIssue ? 'Edit Issue' : 'New Issue'}</DialogTitle>
            <DialogDescription>
              {editingIssue ? 'Update the issue details' : 'Report a new known issue'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issue-title">Title *</Label>
              <Input
                id="issue-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-description">Description</Label>
              <Textarea
                id="issue-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the issue"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as IssueStatus)}>
                <SelectTrigger id="issue-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingIssue ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
