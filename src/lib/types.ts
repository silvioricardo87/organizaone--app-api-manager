export type LifecyclePhase = 'implementing' | 'certifying' | 'current' | 'deprecated' | 'retired'

export type IssueStatus = 'open' | 'investigating' | 'resolved' | 'closed'

export type BacklogOrigin = 'ticket' | 'GT' | 'Banco Central'

export type BacklogStatus = 'backlog' | 'in_progress' | 'completed'

export type PCMMandatoryType = 'server' | 'client' | 'both' | 'none'

export interface LifecyclePhaseData {
  phase: LifecyclePhase
  startDate?: string
  endDate?: string
}

export interface Milestone {
  id: string
  title: string
  date: string
  description?: string
}

export interface KnownIssue {
  id: string
  title: string
  description: string
  status: IssueStatus
  createdAt: string
  updatedAt: string
}

export interface BacklogItem {
  id: string
  title: string
  description: string
  proposal: string
  origin: BacklogOrigin
  status: BacklogStatus
  createdAt: string
  updatedAt: string
}

export interface PCMField {
  id: string
  endpoint: string
  method: string
  field: string
  definition: string
  fillingRule: string
  roles: string[]
  httpCodes: string[]
  domain?: string
  versions: string[]
  maxSize?: string
  pattern?: string
  example?: string
  mandatory: PCMMandatoryType
}

export interface APIContract {
  id: string
  name: string
  version: string
  summary: string
  yamlContent: string
  parsedSpec?: any
  lifecyclePhases: LifecyclePhaseData[]
  milestones: Milestone[]
  knownIssues: KnownIssue[]
  backlogItems: BacklogItem[]
  pcmFields: PCMField[]
  createdAt: string
  updatedAt: string
}
