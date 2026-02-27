import { z } from 'zod'

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
  isCustomField?: boolean
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
  displayName?: string
  useDisplayName?: boolean
  apiGroup?: string
  isBeta?: boolean
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

// Zod schemas for import validation

const apiContractImportSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  summary: z.string().optional().default(''),
  displayName: z.string().optional(),
  useDisplayName: z.boolean().optional().default(false),
  apiGroup: z.string().optional(),
  isBeta: z.boolean().optional().default(false),
  yamlContent: z.string().optional().default(''),
  parsedSpec: z.any().optional(),
  lifecyclePhases: z.array(z.object({
    phase: z.enum(['implementing', 'certifying', 'current', 'deprecated', 'retired']),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).optional().default([]),
  milestones: z.array(z.any()).optional().default([]),
  knownIssues: z.array(z.any()).optional().default([]),
  backlogItems: z.array(z.any()).optional().default([]),
  pcmFields: z.array(z.any()).optional().default([]),
  createdAt: z.string().optional().default(new Date().toISOString()),
  updatedAt: z.string().optional().default(new Date().toISOString()),
})

export const singleImportSchema = z.object({
  api: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string().optional(),
    useDisplayName: z.boolean().optional(),
    apiGroup: z.string().optional(),
    isBeta: z.boolean().optional(),
    version: z.string().optional(),
    createdAt: z.string().optional(),
  }),
  contract: z.string().optional().default(''),
  specification: z.any().optional(),
  lifecycle: z.object({
    phases: z.array(z.any()).optional().default([]),
    milestones: z.array(z.any()).optional().default([]),
  }).optional(),
  issues: z.array(z.any()).optional().default([]),
  backlog: z.array(z.any()).optional().default([]),
  pcm: z.array(z.any()).optional().default([]),
})

export const batchImportSchema = z.object({
  apis: z.array(apiContractImportSchema),
})
