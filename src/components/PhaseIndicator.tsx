import { Badge } from '@/components/ui/badge'
import { LifecyclePhase } from '@/lib/types'

interface PhaseIndicatorProps {
  phase: LifecyclePhase
  className?: string
}

const phaseConfig: Record<LifecyclePhase, { label: string; color: string }> = {
  implementing: { label: 'Implementing', color: 'bg-info text-info-foreground' },
  certifying: { label: 'Certifying', color: 'bg-info text-info-foreground' },
  current: { label: 'Current', color: 'bg-success text-success-foreground' },
  deprecated: { label: 'Deprecated', color: 'bg-warning text-warning-foreground' },
  retired: { label: 'Retired', color: 'bg-destructive text-destructive-foreground' }
}

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const config = phaseConfig[phase]
  
  return (
    <Badge className={`${config.color} ${className || ''}`}>
      {config.label}
    </Badge>
  )
}
