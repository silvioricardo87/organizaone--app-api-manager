# Agents Instructions

## 🛠 Tech Stack
- **Frontend**: React 18 (Functional Components, Hooks)
- **Styling**: Tailwind CSS + shadcn/ui
- **State/Data**: React Query (TanStack Query v5)
- **Backend/Auth**: Supabase (PostgreSQL, Auth, RLS, Storage)
- **Icons**: lucide-react
- **Internationalization**: react-i18next
- **Charts**: Recharts
- **Mobile**: Capacitor
- **Version Management**: `src/version.ts` + `scripts/update-version.js`
- **Utility Libraries**: date-fns (for dates), sonner (for toasts)

## 🎨 UI/UX and Tailwind
- Strictly use Tailwind CSS for all styles.
- Use components from the `src/components/ui/` folder whenever possible.
- Use color system variables (e.g., `bg-background`, `text-foreground`, `border-input`).
- Ensure responsiveness with `sm:`, `md:`, `lg:` prefixes.
- Respect the theme system (CSS variables in `index.css`).
- Use `sonner` for all user notifications/toasts.

## 🛠 React Development
- **Project Organization**: Use feature-based structure (`src/features/{feature_name}/`).
- **Feature Folders**: Each feature should have `components/`, `hooks/`, `services/`, `types/`, and optionally `utils/`.
- **Data Access**: Isolate Supabase queries in service files (`*.service.ts`).
- **State Management**: Wrap services with React Query hooks for fetching and mutations.
- **Hooks**: Use kebab-case for hook filenames (e.g., `use-task-mutation.ts`).
- **Imports**: Always use absolute paths with the `@/` alias (e.g., `@/components/ui/button`).
- **Dates**: Use `date-fns` and always include the `ptBR` locale.
- Prefer `React Query` for data fetching and mutations instead of `useEffect`.
- Keep components small (< 300 lines).
- Use `lucide-react` for icons.
- Use the `useTranslation` hook from `react-i18next` for all user-facing text. Do not use hardcoded strings.
- Website domain is organizaone.com.
- Mobile app package is app.organizaone.hub.
- Add translation keys to `src/i18n/locales/{pt,en,es}.json`. Use `shared.item` for common labels.
- **Shared Components**: Prioritize using shared components from `@/shared/components/` (e.g., `list-view`) to maintain UI consistency across different features (Tasks, Finance, Shopping, etc.).
- **Validation**: Use logic from `@/lib/validations.ts` for consistent input validation across features.

## 📝 Documentation Guidelines
- Do not generate markdown files with change summaries or documentation unless explicitly requested.
- READMEs are acceptable only if they make sense within the scope of the change and the project.
- Focus on code changes, not documentation artifacts.

## 🔐 Supabase and Security
- Use the client from `src/integrations/supabase/client.ts`.
- Respect RLS policies. Always filter by `user_id` if not covered by RLS.
- Check types in `src/integrations/supabase/types.ts`.
- Remember users need `is_approved` to access the dashboard.
- Do not run supabase migrations or commands, the user will be this manually

## 📁 Folder Structure
- `src/features/`: Feature-based modules (tasks, finance, shopping, notes, calendar, boards, settings, trash).
  - Each feature has: `components/`, `hooks/`, `services/`, `types/`, and optionally `utils/`.
- `src/shared/`: Shared components (`list-view`, `DynamicIcon`, `MarkdownEditor`, etc.), hooks, services, types, and utilities.
- `src/components/ui/`: shadcn/ui base components.
- `src/layouts/`: Layout components (DashboardLayout, Sidebar, MobileHeader, etc.).
- `src/hooks/`: Global reusable hooks (theme, swipe, mobile, navigation, etc.).
- `src/pages/`: Application pages.
- `src/lib/`: Utility functions and shared validation logic (`validations.ts`, `utils.ts`, etc.).
- `src/i18n/`: Internationalization configuration and locale files.
- `src/integrations/supabase/`: Supabase client and generated types.
- `supabase/migrations/`: Database schema and policies.
- `src/version.ts`: Version and build information (auto-generated, do not edit manually).
- `scripts/update-version.js`: Version update script.

## 🔄 Version & Build Management
- **Version source**: `src/version.ts` (auto-generated, imported as `APP_VERSION`, `APP_BUILD`, etc.)
- **Update commands**:
  - Manual: `npm run version:update -- --version X.Y.Z --build YYYYMMDD-HHmm`
  - Auto (Build only): `npm run version:update:auto`
  - Minor: `npm run version:update:minor`
  - Patch: `npm run version:update:patch`
- **When to update**:
  - Always update version (minor or patch) after finishing an implementation.
  - If a change is significant or adds new features, use `minor`.
  - If it's a bug fix or small adjustment, use `patch`.
  - Avoid redundant version updates if the user requests follow-up corrections within the same context.
- **Package.json** version is synced automatically by the update script.
- The version info is displayed in the Sidebar footer (`SidebarFooter.tsx`).

## ✅ Quality & Workflow
- **Flow Evaluation**: After creating a feature, re-evaluate the entire flow to ensure no pending items or side effects remain.
- **Linting**: Always run `npm run lint` after implementation. Fix all **errors**; warnings can be ignored unless they impact functionality.
- **Completion**: Only consider a task finished after linting passes (no errors) and the version has been appropriately updated.

