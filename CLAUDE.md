# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OrganizaOne API Manager — a React SPA for managing API contracts and lifecycle in the Open Finance Brasil ecosystem. Users register APIs via OpenAPI YAML specs and track lifecycle phases, known issues, backlog items, and PCM (metrics collection platform) field configurations.

Deployed to **Azure Static Web Apps**.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript compile (tsc -b --noCheck) + Vite build → dist/
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

CI uses **Bun** for install/build (`bun install && bun run build`). Local development uses npm.

## Tech Stack

- **React 19** + **TypeScript 5.7** (strict null checks)
- **Vite 7** with SWC plugin for fast compilation
- **Tailwind CSS v4** (utility-first, oklch color system via CSS variables in `src/main.css`)
- **shadcn/ui** (New York style) — pre-built components in `src/components/ui/`
- **Radix UI** primitives underneath shadcn
- **React Hook Form** + **Zod** for form validation
- **recharts** for dashboard charts
- **js-yaml** for OpenAPI spec parsing
- **Sonner** for toast notifications

## Architecture

### Routing & Views

No router library — `App.tsx` manages a `currentView` state (`'list' | 'dashboard' | 'roadmap' | 'detail'`) and conditionally renders the corresponding top-level component. Navigation is done by calling `setCurrentView()`.

### State & Persistence

All API data lives in a single `APIContract[]` array managed by the **`usePersistedKV`** hook (`src/hooks/use-persisted-kv.ts`). This hook persists data to `localStorage` with a React `useState`-based API.

Storage keys are defined in `src/lib/storage.ts` (`STORAGE_KEYS`). The `storage` utility provides get/set/remove helpers for localStorage.

### Internationalization

Bilingual (Portuguese/English). All user-facing strings go through `useSettings().t` which returns the translation object from `src/lib/i18n.ts`. When adding UI text, add keys to **both** `pt` and `en` sections in that file.

### Component Organization

- `src/components/` — page-level components (APIList, APIDetailView, Dashboard, Roadmap, dialogs)
- `src/components/tabs/` — tab panels for the API detail view (Overview, Specification, Lifecycle, Issues, Backlog, PCM, Timeline)
- `src/components/ui/` — shadcn/ui primitives (do not manually edit; managed by shadcn CLI)
- `src/hooks/` — custom hooks (usePersistedKV, useSettings, useMobile)
- `src/lib/` — types, utilities, i18n translations, storage abstraction

### OpenAPI Spec Handling

`src/lib/api-utils.ts` contains all YAML parsing and OpenAPI extraction logic:
- `parseOpenAPIYAML()` — validates and parses YAML
- `extractEndpoints()` — lists paths + methods from the spec
- `getEndpointFields()` — recursively resolves `$ref` references and extracts field paths from request/response schemas

### Key Data Types

Defined in `src/lib/types.ts`. The central type is `APIContract` which holds: metadata (name, version, group), the raw YAML, parsed spec, lifecycle phases, milestones, known issues, backlog items, and PCM field configurations.

Lifecycle phases: `implementing → certifying → current → deprecated → retired`

## Conventions

- **Path alias**: `@/` maps to `src/` (configured in both `tsconfig.json` and `vite.config.ts`)
- **Styling**: Use Tailwind utility classes; use `cn()` from `src/lib/utils.ts` for conditional class merging
- **Icons**: Phosphor Icons (`@phosphor-icons/react`) as the primary icon library, with Lucide available for shadcn components
- **IDs**: Generated with `uuid` package
- **Immutable state updates**: Always use the callback form of `setApis(prev => ...)` for array mutations

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `pipeline.yml` orchestrates: prepare → deploy
- `prepare.yml` installs with Bun, determines build type (release on main/tags, debug otherwise)
- `deploy-web.yml` builds and deploys to Azure Static Web Apps (release builds only)
