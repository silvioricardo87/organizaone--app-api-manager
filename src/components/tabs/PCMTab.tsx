import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash, Pencil } from '@phosphor-icons/react'
import { APIContract, PCMField, PCMMandatoryType } from '@/lib/types'
import { generateId, extractEndpoints, getEndpointFields } from '@/lib/api-utils'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

interface PCMTabProps {
  api: APIContract
  onUpdate: (api: APIContract) => void
}

export function PCMTab({ api, onUpdate }: PCMTabProps) {
  const { t } = useSettings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<PCMField | null>(null)
  const [endpoint, setEndpoint] = useState('')
  const [method, setMethod] = useState('')
  const [field, setField] = useState('')
  const [isCustomField, setIsCustomField] = useState(false)
  const [customFieldInput, setCustomFieldInput] = useState('')
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
      setIsCustomField(pcmField.isCustomField || false)
      setCustomFieldInput(pcmField.isCustomField ? pcmField.field : '')
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
    setIsCustomField(false)
    setCustomFieldInput('')
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
    const finalField = isCustomField ? customFieldInput : field
    
    if (!endpoint || !method || !finalField) {
      toast.error(t.toasts.fieldRequired)
      return
    }

    const newField: PCMField = {
      id: editingField?.id || generateId(),
      endpoint,
      method,
      field: finalField,
      isCustomField,
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
      toast.success(t.toasts.metricUpdated)
    } else {
      updatedFields = [...api.pcmFields, newField]
      toast.success(t.toasts.metricCreated)
    }

    onUpdate({
      ...api,
      pcmFields: updatedFields,
      updatedAt: new Date().toISOString()
    })

    setDialogOpen(false)
  }

  const handleDelete = (fieldId: string) => {
    if (!confirm(t.apiDetail.confirmDeleteMessage)) return

    const updatedFields = api.pcmFields.filter(f => f.id !== fieldId)
    onUpdate({
      ...api,
      pcmFields: updatedFields,
      updatedAt: new Date().toISOString()
    })
    toast.success(t.toasts.metricDeleted)
  }

  if (!api.parsedSpec) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          {t.pcm.requiresSpec}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openDialog()}>
          <Plus size={20} weight="bold" className="mr-2" />
          {t.pcm.addField}
        </Button>
      </div>

      {api.pcmFields.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{t.pcm.noFields}</p>
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
                    {pcmField.isCustomField && (
                      <Badge variant="secondary" className="text-xs">
                        {t.pcm.customField}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">{t.pcm.definition}:</span>
                      <p>{pcmField.definition || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">{t.pcm.fillingRule}:</span>
                      <p>{pcmField.fillingRule || '-'}</p>
                    </div>
                    {pcmField.roles.length > 0 && (
                      <div>
                        <span className="font-medium text-muted-foreground">{t.pcm.roles}:</span>
                        <p>{pcmField.roles.join(', ')}</p>
                      </div>
                    )}
                    {pcmField.httpCodes.length > 0 && (
                      <div>
                        <span className="font-medium text-muted-foreground">{t.pcm.httpCodes}:</span>
                        <p>{pcmField.httpCodes.join(', ')}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-muted-foreground">{t.pcm.mandatory}:</span>
                      <Badge variant="outline" className="ml-2">
                        {pcmField.mandatory === 'none' ? '-' : t.badges[pcmField.mandatory]}
                      </Badge>
                    </div>
                    {pcmField.maxSize && (
                      <div>
                        <span className="font-medium text-muted-foreground">{t.pcm.maxSize}:</span>
                        <p>{pcmField.maxSize}</p>
                      </div>
                    )}
                  </div>

                  {pcmField.example && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-xs font-medium text-muted-foreground">{t.pcm.example}:</span>
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
            <DialogTitle>{editingField ? t.pcm.editField : t.pcm.newField}</DialogTitle>
            <DialogDescription>
              {t.pcm.configureField}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pcm-endpoint">{t.pcm.endpoint} *</Label>
              <Select value={endpoint} onValueChange={setEndpoint} disabled={!!editingField}>
                <SelectTrigger id="pcm-endpoint">
                  <SelectValue placeholder={t.pcm.selectEndpoint} />
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
                <Label htmlFor="pcm-method">{t.pcm.method} *</Label>
                <Select value={method} onValueChange={setMethod} disabled={!!editingField}>
                  <SelectTrigger id="pcm-method">
                    <SelectValue placeholder={t.pcm.selectMethod} />
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
                <Label htmlFor="pcm-field">{t.pcm.field} *</Label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select 
                      value={field} 
                      onValueChange={setField} 
                      disabled={!!editingField || isCustomField}
                    >
                      <SelectTrigger id="pcm-field">
                        <SelectValue placeholder={t.pcm.selectField} />
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
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox 
                      id="custom-field-checkbox"
                      checked={isCustomField}
                      onCheckedChange={(checked) => {
                        setIsCustomField(checked as boolean)
                        if (!checked) {
                          setCustomFieldInput('')
                        } else {
                          setField('')
                        }
                      }}
                      disabled={!!editingField}
                    />
                    <Label 
                      htmlFor="custom-field-checkbox"
                      className="text-sm cursor-pointer"
                    >
                      {t.pcm.customField}
                    </Label>
                  </div>
                </div>
                {isCustomField && (
                  <div className="mt-2">
                    <Input
                      id="custom-field-input"
                      value={customFieldInput}
                      onChange={(e) => setCustomFieldInput(e.target.value)}
                      placeholder={t.pcm.customFieldPlaceholder}
                      disabled={!!editingField}
                    />
                  </div>
                )}
              </div>
            )}

            {field && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pcm-definition">{t.pcm.definition}</Label>
                  <Textarea
                    id="pcm-definition"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder={t.metrics.definitionPlaceholder}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcm-filling-rule">{t.pcm.fillingRule}</Label>
                  <Textarea
                    id="pcm-filling-rule"
                    value={fillingRule}
                    onChange={(e) => setFillingRule(e.target.value)}
                    placeholder={t.pcm.fillingRulePlaceholder}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pcm-roles">{t.pcm.rolesCommaSeparated}</Label>
                    <Input
                      id="pcm-roles"
                      value={roles}
                      onChange={(e) => setRoles(e.target.value)}
                      placeholder={t.pcm.rolesPlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pcm-http-codes">{t.pcm.httpCodesCommaSeparated}</Label>
                    <Input
                      id="pcm-http-codes"
                      value={httpCodes}
                      onChange={(e) => setHttpCodes(e.target.value)}
                      placeholder={t.pcm.httpCodesPlaceholder}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pcm-domain">{t.pcm.domain}</Label>
                    <Input
                      id="pcm-domain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder={t.pcm.domainPlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pcm-versions">{t.pcm.versionsCommaSeparated}</Label>
                    <Input
                      id="pcm-versions"
                      value={versions}
                      onChange={(e) => setVersions(e.target.value)}
                      placeholder={t.pcm.versionsPlaceholder}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pcm-max-size">{t.pcm.maxSize}</Label>
                    <Input
                      id="pcm-max-size"
                      value={maxSize}
                      onChange={(e) => setMaxSize(e.target.value)}
                      placeholder={t.pcm.maxSizePlaceholder}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="pcm-pattern">{t.pcm.pattern}</Label>
                    <Input
                      id="pcm-pattern"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder={t.pcm.patternPlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcm-mandatory">{t.pcm.mandatoryReporting}</Label>
                  <Select value={mandatory} onValueChange={(value) => setMandatory(value as PCMMandatoryType)}>
                    <SelectTrigger id="pcm-mandatory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t.pcm.none}</SelectItem>
                      <SelectItem value="server">{t.pcm.serverOnly}</SelectItem>
                      <SelectItem value="client">{t.pcm.clientOnly}</SelectItem>
                      <SelectItem value="both">{t.pcm.bothServerClient}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcm-example">{t.pcm.example}</Label>
                  <Textarea
                    id="pcm-example"
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder={t.pcm.examplePlaceholder}
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!endpoint || !method || (!field && !isCustomField) || (isCustomField && !customFieldInput)}
            >
              {editingField ? t.improvements.update : t.improvements.create}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
