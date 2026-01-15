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
import { APIContract, PCMField, PCMMandatoryType } from '@/lib/types'
import { generateId, extractEndpoints, getEndpointFields } from '@/lib/api-utils'
import { toast } from 'sonner'

interface PCMTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

export function PCMTab({ api, onUpdate }: PCMTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<PCMField | null>(null)
  const [endpoint, setEndpoint] = useState('')
  const [method, setMethod] = useState('')
  const [field, setField] = useState('')
  const [definition, setDefinition] = useState('')
  const [fillingRule, setFillingRule] = useState('')
  const [roles, setRoles] = useState('')
  const [httpCodes, setHttpCodes] = useState('')
  const [domain, setDomain] = useState('')
  const [versions, setVersions] = useState('')
  const [maxSize, setMaxSize] = useState('')
  const [pattern, setPattern] = useState('')
  const [example, setExample] = useState('')
  const [mandatory, setMandatory] = useState<PCMMandatoryType>('none')

  const endpoints = api.parsedSpec ? extractEndpoints(api.parsedSpec) : []
  const selectedEndpoint = endpoints.find(e => e.path === endpoint)
  const availableFields = endpoint && method && api.parsedSpec
    ? getEndpointFields(api.parsedSpec, endpoint, method)
    : []

  const openDialog = (pcmField?: PCMField) => {
    if (pcmField) {
      setEditingField(pcmField)
      setEndpoint(pcmField.endpoint)
      setMethod(pcmField.method)
      setField(pcmField.field)
      setDefinition(pcmField.definition)
      setFillingRule(pcmField.fillingRule)
      setRoles(pcmField.roles.join(', '))
      setHttpCodes(pcmField.httpCodes.join(', '))
      setDomain(pcmField.domain || '')
      setVersions(pcmField.versions.join(', '))
      setMaxSize(pcmField.maxSize || '')
      setPattern(pcmField.pattern || '')
      setExample(pcmField.example || '')
      setMandatory(pcmField.mandatory)
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingField(null)
    setEndpoint('')
    setMethod('')
    setField('')
    setDefinition('')
    setFillingRule('')
    setRoles('')
    setHttpCodes('')
    setDomain('')
    setVersions('')
    setMaxSize('')
    setPattern('')
    setExample('')
    setMandatory('none')
  }

  const handleSave = () => {
    if (!endpoint || !method || !field) {
      toast.error('Endpoint, method, and field are required')
      return
    }

    const newField: PCMField = {
      id: editingField?.id || generateId(),
      endpoint,
      method,
      field,
      definition,
      fillingRule,
      roles: roles.split(',').map(r => r.trim()).filter(Boolean),
      httpCodes: httpCodes.split(',').map(c => c.trim()).filter(Boolean),
      domain,
      versions: versions.split(',').map(v => v.trim()).filter(Boolean),
      maxSize,
      pattern,
      example,
      mandatory
    }

    let updatedFields: PCMField[]

    if (editingField) {
      updatedFields = api.pcmFields.map(f => f.id === editingField.id ? newField : f)
      toast.success('PCM field updated')
    } else {
      updatedFields = [...api.pcmFields, newField]
      toast.success('PCM field created')
    }

    onUpdate({
      ...api,
      pcmFields: updatedFields,
      updatedAt: new Date().toISOString()
    })

    setDialogOpen(false)
  }

  const handleDelete = (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this PCM field?')) return

    const updatedFields = api.pcmFields.filter(f => f.id !== fieldId)
    onUpdate({
      ...api,
      pcmFields: updatedFields,
      updatedAt: new Date().toISOString()
    })
    toast.success('PCM field deleted')
  }

  if (!api.parsedSpec) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          PCM configuration requires an OpenAPI specification. Please import a YAML file first.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openDialog()}>
          <Plus size={20} weight="bold" className="mr-2" />
          Add PCM Field
        </Button>
      </div>

      {api.pcmFields.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No PCM fields configured yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {api.pcmFields.map(pcmField => (
            <Card key={pcmField.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-primary text-primary-foreground">{pcmField.method}</Badge>
                    <code className="text-sm font-mono">{pcmField.endpoint}</code>
                    <Badge variant="outline">{pcmField.field}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Definition:</span>
                      <p>{pcmField.definition || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Filling Rule:</span>
                      <p>{pcmField.fillingRule || '-'}</p>
                    </div>
                    {pcmField.roles.length > 0 && (
                      <div>
                        <span className="font-medium text-muted-foreground">Roles:</span>
                        <p>{pcmField.roles.join(', ')}</p>
                      </div>
                    )}
                    {pcmField.httpCodes.length > 0 && (
                      <div>
                        <span className="font-medium text-muted-foreground">HTTP Codes:</span>
                        <p>{pcmField.httpCodes.join(', ')}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-muted-foreground">Mandatory:</span>
                      <Badge variant="outline" className="ml-2">{pcmField.mandatory}</Badge>
                    </div>
                    {pcmField.maxSize && (
                      <div>
                        <span className="font-medium text-muted-foreground">Max Size:</span>
                        <p>{pcmField.maxSize}</p>
                      </div>
                    )}
                  </div>

                  {pcmField.example && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-xs font-medium text-muted-foreground">Example:</span>
                      <pre className="text-xs font-mono mt-1">{pcmField.example}</pre>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(pcmField)}>
                    <Pencil size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(pcmField.id)}>
                    <Trash size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit PCM Field' : 'New PCM Field'}</DialogTitle>
            <DialogDescription>
              Configure metrics collection field for a specific endpoint and method
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pcm-endpoint">Endpoint *</Label>
              <Select value={endpoint} onValueChange={setEndpoint} disabled={!!editingField}>
                <SelectTrigger id="pcm-endpoint">
                  <SelectValue placeholder="Select endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map(ep => (
                    <SelectItem key={ep.path} value={ep.path}>
                      {ep.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {endpoint && (
              <div className="space-y-2">
                <Label htmlFor="pcm-method">Method *</Label>
                <Select value={method} onValueChange={setMethod} disabled={!!editingField}>
                  <SelectTrigger id="pcm-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEndpoint?.methods.map(m => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {endpoint && method && (
              <div className="space-y-2">
                <Label htmlFor="pcm-field">Field *</Label>
                <Select value={field} onValueChange={setField} disabled={!!editingField}>
                  <SelectTrigger id="pcm-field">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(f => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {field && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pcm-definition">Definition</Label>
                  <Textarea
                    id="pcm-definition"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="Field definition"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcm-filling-rule">Filling Rule</Label>
                  <Textarea
                    id="pcm-filling-rule"
                    value={fillingRule}
                    onChange={(e) => setFillingRule(e.target.value)}
                    placeholder="Rules for filling this field"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pcm-roles">Roles (comma-separated)</Label>
                    <Input
                      id="pcm-roles"
                      value={roles}
                      onChange={(e) => setRoles(e.target.value)}
                      placeholder="CLIENT, SERVER"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pcm-http-codes">HTTP Codes (comma-separated)</Label>
                    <Input
                      id="pcm-http-codes"
                      value={httpCodes}
                      onChange={(e) => setHttpCodes(e.target.value)}
                      placeholder="200, 201, 400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pcm-domain">Domain</Label>
                    <Input
                      id="pcm-domain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="Domain"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pcm-versions">Versions (comma-separated)</Label>
                    <Input
                      id="pcm-versions"
                      value={versions}
                      onChange={(e) => setVersions(e.target.value)}
                      placeholder="v1, v2, v3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pcm-max-size">Max Size</Label>
                    <Input
                      id="pcm-max-size"
                      value={maxSize}
                      onChange={(e) => setMaxSize(e.target.value)}
                      placeholder="100"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="pcm-pattern">Pattern</Label>
                    <Input
                      id="pcm-pattern"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="^[a-zA-Z0-9]+$"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcm-mandatory">Mandatory Reporting</Label>
                  <Select value={mandatory} onValueChange={(value) => setMandatory(value as PCMMandatoryType)}>
                    <SelectTrigger id="pcm-mandatory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="server">Server Only</SelectItem>
                      <SelectItem value="client">Client Only</SelectItem>
                      <SelectItem value="both">Both Server & Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcm-example">Example</Label>
                  <Textarea
                    id="pcm-example"
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder="Example value"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!endpoint || !method || !field}>
              {editingField ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
