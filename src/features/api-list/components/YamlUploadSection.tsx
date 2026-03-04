import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Warning } from '@phosphor-icons/react'
import { type YAMLValidationError } from '@/shared/lib/api-utils'
import { useSettings } from '@/shared/hooks/use-settings'

interface YamlUploadSectionProps {
  validationErrors: YAMLValidationError[]
  isProcessing: boolean
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function formatValidationError(err: YAMLValidationError, t: (key: string) => string): string {
  const msg = err.message
  if (msg.startsWith('yaml_syntax_error:')) {
    const line = msg.split(':')[1]
    return t('newAPIDialog.yamlSyntaxError').replace('{line}', line)
  }
  if (msg.startsWith('missing_field:')) {
    const field = msg.split(':')[1]
    if (err.path && err.path.includes('responses')) {
      return t('newAPIDialog.missingResponses').replace('{path}', err.path)
    }
    return t('newAPIDialog.missingField').replace('{field}', field)
  }
  if (msg.startsWith('invalid_field:')) {
    return t('newAPIDialog.invalidField').replace('{path}', err.path || msg.split(':')[1])
  }
  if (msg.startsWith('invalid_method:')) {
    const method = msg.split(':')[1]
    return t('newAPIDialog.invalidMethod')
      .replace('{method}', method)
      .replace('{path}', err.path || '')
  }
  return msg
}

export function YamlUploadSection({ validationErrors, isProcessing, onFileUpload }: YamlUploadSectionProps) {
  const { t } = useSettings()

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="yaml-upload">{t('apiDetail.importYAML')}</Label>
        <div className="flex items-center gap-2">
          <Input
            id="yaml-upload"
            type="file"
            accept=".yaml,.yml"
            onChange={onFileUpload}
            disabled={isProcessing}
            className="cursor-pointer"
          />
          <Button
            variant="outline"
            size="icon"
            disabled={isProcessing}
            onClick={() => document.getElementById('yaml-upload')?.click()}
          >
            <Upload size={20} />
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Warning size={18} className="text-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">
              {t('newAPIDialog.validationErrors')}
            </p>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {validationErrors.map((err, i) => (
              <li key={i} className="text-sm text-destructive/90">
                {formatValidationError(err, t)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
