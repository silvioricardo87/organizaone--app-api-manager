import { Badge } from '@/components/ui/badge'
import { LifecyclePhase } from '@/lib/types'
import { useSettings } from '@/hooks/use-settings'

interface PhaseIndicatorProps {
  phase: LifecyclePhase
  className?: string
}

const phaseColorConfig: Record<LifecyclePhase, string> = {
  implementing: 'bg-info text-info-foreground',
  certifying: 'bg-info text-info-foreground',
  current: 'bg-success text-success-foreground',
  deprecated: 'bg-warning text-warning-foreground',
  retired: 'bg-destructive text-destructive-foreground'
}

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const { t } = useSettings()
  const color = phaseColorConfig[phase]
  
  return (
    <Badge className={`${color} ${className || ''}`}>
      {t.apiList[phase]}
    </Badge>
  )
}
