# OpenFinance API Manager - Product Requirements Document

A comprehensive API lifecycle management platform for Open Finance Brasil, enabling teams to register, track, and manage API contracts with their full specifications, lifecycle phases, known issues, backlog items, and metrics collection platform (PCM) configurations.

**Experience Qualities**:
1. **Professional** - The interface should convey authority and reliability, suitable for financial technology management with clear information architecture.
2. **Efficient** - Users should be able to quickly navigate complex API documentation and lifecycle data without friction, with smart forms and contextual workflows.
3. **Comprehensive** - Every piece of relevant information should be accessible and well-organized, from high-level timeline views to detailed schema exploration.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)

This application manages sophisticated data structures including OpenAPI 3.0 specifications, lifecycle phase tracking, problem management, backlog items, and metrics collection configurations. It requires multiple interconnected views with deep navigation capabilities and data relationships.

## Essential Features

### API Contract Registration
- **Functionality**: Create and register new API contracts with metadata and OpenAPI 3.0 YAML import
- **Purpose**: Establish the foundation for tracking an API's complete lifecycle and specifications
- **Trigger**: User clicks "New API" or "Register API" button
- **Progression**: Click new API → Import YAML file OR manually enter details → System parses OpenAPI spec → Extract version and summary → Add lifecycle phase dates → Save contract
- **Success criteria**: API appears in the main list with extracted metadata, valid YAML parsed successfully, lifecycle phases initialized

### Lifecycle Phase Management
- **Functionality**: Track and visualize API lifecycle phases (implementing, certifying, current, deprecated, retired) with start and end dates
- **Purpose**: Maintain clear visibility into API maturity and planning timelines
- **Trigger**: During API registration or when editing an existing API
- **Progression**: Access lifecycle section → Add/edit phase dates → View timeline visualization → Save changes → Timeline updates across views
- **Success criteria**: All phases tracked with dates, timeline view shows accurate progression, current phase highlighted

### Known Issues Tracking
- **Functionality**: Register and manage known problems with APIs
- **Purpose**: Document and communicate API limitations and bugs to stakeholders
- **Trigger**: User navigates to API detail view and selects "Known Issues" tab
- **Progression**: Select API → Navigate to issues tab → Click add issue → Enter title, description, status → Save → Issue appears in list
- **Success criteria**: Issues linked to specific APIs, filterable and sortable, status tracking enabled

### Backlog & Improvements Management
- **Functionality**: Track proposed improvements and enhancements with title, description, proposal, and origin (ticket, GT, Banco Central)
- **Purpose**: Maintain a prioritized list of API enhancements and their business context
- **Trigger**: User accesses backlog section within an API detail view
- **Progression**: Navigate to backlog tab → Add new item → Fill title, description, proposal text, select origin → Set status (backlog/in progress) → Save
- **Success criteria**: Backlog items associated with APIs, origin tracked, status workflow functional

### PCM (Plataforma de Coleta de Métricas) Configuration
- **Functionality**: Configure metrics collection fields per endpoint/method combination with detailed rules and requirements
- **Purpose**: Define reporting requirements for metrics collection across API endpoints
- **Trigger**: User navigates to existing API's PCM section (not available during creation)
- **Progression**: Select API (view mode) → Navigate to PCM tab → Select endpoint from API spec → Choose method → Select field → Configure definition, rules, roles, http codes, max size, patterns, examples → Set mandatory requirements (server/client/both) → Save configuration
- **Success criteria**: PCM configs linked to specific endpoint/method/field combinations, mandatory requirements properly set, all metadata fields populated

### OpenAPI Specification Viewer
- **Functionality**: Interactive tree-based viewer for exploring imported OpenAPI schemas, endpoints, responses, and data structures
- **Purpose**: Enable developers to navigate and understand API specifications without external tools
- **Trigger**: User clicks on an API in the list and selects "Specification" or "Documentation" view
- **Progression**: Select API → View spec viewer → Expand/collapse tree nodes → Navigate paths → Inspect schemas → View request/response examples → Drill into nested objects
- **Success criteria**: Full OpenAPI 3.0 spec rendered navigably, schemas explorable, nested objects expandable, all endpoints and methods visible

### Timeline & Milestones Visualization
- **Functionality**: Visual timeline showing lifecycle phases and custom milestones with dates
- **Purpose**: Provide at-a-glance understanding of API project timelines and key dates
- **Trigger**: User accesses timeline view from API detail or main dashboard
- **Progression**: Navigate to timeline → View lifecycle phases as timeline segments → Add custom milestones → Edit dates → View overall project trajectory
- **Success criteria**: Timeline accurately reflects phase dates, milestones displayed chronologically, visual clarity maintained

### API List & Search
- **Functionality**: Browse all registered APIs with search, filter, and sort capabilities
- **Purpose**: Quick access to any API in the system
- **Trigger**: Default landing page or navigation to API list
- **Progression**: Load application → View API list → Search by name/version → Filter by lifecycle phase → Sort by date → Click API to view details
- **Success criteria**: Fast search response, accurate filtering, clear list presentation

## Edge Case Handling

- **Invalid YAML Import** - Display clear error messages highlighting the specific parsing issue and line number if possible
- **Missing Required Fields** - Prevent save with inline validation, highlight missing fields in red with helper text
- **Duplicate API Names/Versions** - Warn user of potential duplicate, allow continuation with confirmation
- **Orphaned PCM Configurations** - If endpoint removed from spec, flag PCM configs as orphaned but preserve data
- **Date Overlaps in Lifecycle** - Validate that phase dates don't create impossible timelines, warn on overlaps
- **Empty States** - Show helpful empty states with clear CTAs when no APIs, issues, or backlog items exist
- **Large YAML Files** - Handle large OpenAPI specs gracefully with progressive loading or pagination in tree view
- **Concurrent Edits** - Last write wins with timestamp tracking (acceptable for internal team tool)

## Design Direction

The design should evoke professionalism, clarity, and technical sophistication appropriate for a financial technology platform. It should feel like a modern developer tool with excellent information density while maintaining breathing room. The interface should communicate "enterprise-grade" reliability while remaining approachable and efficient to use.

## Color Selection

A professional, technical palette that balances financial industry gravitas with developer tool usability.

- **Primary Color**: Deep Blue `oklch(0.45 0.15 250)` - Conveys trust, stability, and professionalism appropriate for financial technology
- **Secondary Colors**: 
  - Slate Gray `oklch(0.55 0.02 250)` - Supporting neutral for secondary actions and backgrounds
  - Steel Blue `oklch(0.65 0.08 250)` - For hover states and subtle highlights
- **Accent Color**: Vibrant Cyan `oklch(0.70 0.18 200)` - Draws attention to primary CTAs and active states, provides energy
- **Status Colors**:
  - Success Green `oklch(0.65 0.20 140)` - For "current" phase, successful operations
  - Warning Amber `oklch(0.75 0.15 70)` - For "deprecated" phase, warnings
  - Error Red `oklch(0.60 0.22 25)` - For "retired" phase, errors
  - Info Blue `oklch(0.60 0.18 240)` - For "implementing" and "certifying" phases

**Foreground/Background Pairings**:
- Background (Light Gray `oklch(0.98 0.005 250)`): Foreground Text (`oklch(0.25 0.02 250)`) - Ratio 12.8:1 ✓
- Primary (Deep Blue `oklch(0.45 0.15 250)`): White Text (`oklch(1 0 0)`) - Ratio 7.2:1 ✓
- Accent (Vibrant Cyan `oklch(0.70 0.18 200)`): White Text (`oklch(1 0 0)`) - Ratio 4.6:1 ✓
- Card Background (White `oklch(1 0 0)`): Foreground Text (`oklch(0.25 0.02 250)`) - Ratio 14.1:1 ✓

## Font Selection

Typography should communicate technical precision while remaining highly readable for extended documentation review sessions.

- **Primary Font**: JetBrains Mono - For code snippets, YAML display, and technical identifiers
- **UI Font**: Inter - Clean, modern sans-serif for UI elements and body text
- **Display Font**: Space Grotesk - For headings and emphasis, adds geometric character

**Typographic Hierarchy**:
- H1 (Page Title): Space Grotesk Bold/32px/tight letter spacing/-0.02em
- H2 (Section Headers): Space Grotesk SemiBold/24px/tight letter spacing/-0.01em  
- H3 (Subsection Headers): Inter SemiBold/18px/normal spacing
- Body (Content): Inter Regular/15px/line-height 1.6
- Small (Metadata): Inter Regular/13px/line-height 1.5/text-muted-foreground
- Code (YAML, IDs): JetBrains Mono Regular/14px/line-height 1.5

## Animations

Animations should be purposeful and subtle, reinforcing interactions without drawing unnecessary attention. Focus on micro-interactions that provide feedback and guide users through complex workflows.

- **Page Transitions**: Smooth 300ms ease-in-out fade with subtle slide (20px) for view changes
- **Expandable Sections**: 200ms ease-out height animation for collapsible panels (accordion-style)
- **Tree View**: 150ms ease-in-out rotation for chevrons, 200ms height expansion for branches
- **Form Validation**: 200ms shake animation for error states, 150ms scale pulse for success
- **Button Interactions**: 100ms scale (0.98) on press, subtle shadow expansion on hover
- **Timeline Scrubbing**: Smooth scroll-linked parallax for timeline exploration
- **Loading States**: Subtle skeleton screens with shimmer effect (1500ms loop) for content loading

## Component Selection

**Components**:
- **Card** - Primary container for API list items, issue cards, backlog items
- **Accordion** - For collapsible sections in API spec viewer and form sections
- **Tabs** - Navigate between Overview, Specification, Lifecycle, Issues, Backlog, PCM, Timeline
- **Button** - All CTAs with variants (primary for save/import, secondary for cancel, destructive for delete)
- **Input** - Text fields for titles, descriptions, IDs
- **Textarea** - Long-form content like descriptions, proposals
- **Select** - Dropdowns for lifecycle phases, origins, endpoints, methods, roles
- **Calendar/DatePicker** - Lifecycle phase date selection
- **Dialog** - Modal overlays for confirmations, YAML import, forms
- **Separator** - Visual separation between sections
- **Badge** - Display lifecycle phases, status indicators, versions
- **Scroll Area** - Long lists and tree views
- **Tooltip** - Contextual help for complex fields
- **Breadcrumb** - Navigation hierarchy for deep views

**Customizations**:
- **Timeline Component** - Custom horizontal timeline with phase segments, milestones as markers, interactive date editing
- **Tree Viewer Component** - Custom recursive tree for OpenAPI spec exploration with syntax highlighting
- **Phase Status Indicator** - Custom badge with color coding for lifecycle phases
- **YAML Viewer** - Custom code display with line numbers and syntax highlighting using JetBrains Mono

**States**:
- Buttons: default/hover (shadow expansion + brightness increase)/active (scale 0.98)/disabled (opacity 0.5)
- Inputs: default (border-input)/focus (ring-2 ring-primary + border-primary)/error (border-destructive ring-destructive)/success (border-success)
- Cards: default (border subtle)/hover (shadow-md + border-primary subtle)/active (shadow-lg)
- Tree nodes: collapsed (chevron-right)/expanded (chevron-down rotate-90)/selected (bg-accent text-accent-foreground)

**Icon Selection**:
- Plus (Add new items)
- FileText (API documentation/specs)
- Calendar (Lifecycle dates)
- AlertCircle (Known issues)
- ListChecks (Backlog items)
- BarChart (PCM metrics)
- Clock (Timeline view)
- Upload (YAML import)
- Search (API search)
- ChevronDown/ChevronRight (Expandable sections)
- X (Close/remove)
- Check (Success states)
- Edit (Edit mode)
- Trash (Delete)

**Spacing**:
- Card padding: p-6
- Section gaps: gap-8
- Form field gaps: gap-4
- List item gaps: gap-2
- Button padding: px-4 py-2
- Page margins: max-w-7xl mx-auto px-6

**Mobile**:
- Stack tabs vertically on mobile, convert to full-width accordion sections
- Card grid becomes single column below 768px
- Timeline switches to vertical orientation on mobile
- Form fields full width on mobile, 2-column grid on desktop where appropriate
- Tree viewer with touch-friendly tap targets (min 44px)
- Sticky header with condensed navigation on mobile
- Bottom sheet for quick actions on mobile instead of dialogs
