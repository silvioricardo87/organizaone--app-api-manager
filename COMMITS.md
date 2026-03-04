# Git Commit Instructions

Follow these guidelines when creating commit messages for thes project.

## 📋 Commit Message Format

All commit messages MUST follow this structure:

```
<Type> <Component/Area>: <concise description of what and why>
```

### Structure Breakdown

1. **Type** (required): Action verb in imperative mood, capitalized
2. **Component/Area** (required): What part of the system was modified
3. **Description** (required): Clear explanation of what was changed and why

## 🎯 Commit Types

Use these verbs based on the type of change:

- **Add**: New features, files, or functionality
- **Update**: Modifications to existing features or configurations
- **Fix**: Bug fixes or corrections
- **Refactor**: Code restructuring without changing functionality
- **Enhance**: Improvements to existing features (performance, UX, readability)
- **Remove**: Deletion of features, files, or code
- **Merge**: Merging branches (automatic, but can be customized)
- **Initial**: First commit or initial setup
- **Simplify**: Making code simpler or more straightforward

## 📝 Component/Area Guidelines

Be specific about what was modified:

- **Workflow names**: "Android Build Workflow", "GitHub Actions", "CI/CD Pipeline"
- **Features**: "Telegram Notifications", "User Authentication", "Task Management"
- **UI Components**: "Dashboard", "Task List", "Finance Module"
- **Technical areas**: "Database Schema", "RLS Policies", "API Integration"
- **Documentation**: "README", "API Docs", "Setup Guide"

## ✅ Description Best Practices

After the colon, provide a detailed description that:

1. **Explains WHAT changed**: Be specific about the modifications
2. **Explains WHY it changed**: Include the benefit or reason
3. **Uses technical language**: Be precise and professional
4. **Separates multiple changes**: Use commas or "and" to list related changes
5. **Stays concise**: One line, but informative

### Good Examples (from project history):

```
✅ Remove Telegram "Build Started" notification step from GitHub workflow
✅ Update Android Build Workflow: add `contents: write` permission to the `distribute-release` job
✅ Refactor Android Build Workflows: modularize workflows into reusable components for better maintainability, scalability, and testability
✅ Enhance Telegram Build Notifications: refactor message construction for improved readability and consistency
✅ Fix Telegram Bot workflow: validate required secrets before execution for non-empty secrets
✅ Add build artifact upload step with detailed info
✅ Simplify workflow: remove redundant secret checks
```

### Bad Examples (avoid these):

```
❌ update code
❌ fix bug
❌ changes
❌ WIP
❌ small tweaks
❌ misc updates
```

## 🔤 Writing Style

- **Language**: English only
- **Tense**: Imperative mood (commands, not past tense)
- **Capitalization**: First word capitalized, proper nouns capitalized
- **Length**: Aim for 50-100 characters in total
- **Technical terms**: Use backticks for code/config items (e.g., `contents: write`, `useEffect`)
- **No period**: Don't end with a period

## 🎨 Domain-Specific Patterns

### Frontend Changes
```
Update TaskList component: add loading skeleton and error boundary
Refactor useTheme hook: extract color utilities to separate file
Enhance Dashboard: improve responsive layout for mobile devices
Fix Finance module: correct currency formatting for negative values
```

### Backend/Database Changes
```
Add RLS policies for user_tasks table with row-level security
Update Supabase schema: add user_preferences table with JSONB column
Fix authentication flow: handle session expiration gracefully
```

### Build/CI/CD Changes
```
Update GitHub Actions: add caching for npm dependencies
Enhance Android Build: include version bump and changelog generation
Fix Capacitor config: correct webDir path for production builds
```

### Documentation Changes
```
Add E2E testing guide with Playwright examples
Update README: include Supabase setup instructions
Fix typos in database schema documentation
```

## 🚫 What NOT to Include

- Personal pronouns (I, we, our)
- Vague descriptions (stuff, things, some changes)
- Emoji in the commit message (save for PR descriptions)
- Multiple unrelated changes (split into separate commits)
- Temporary/WIP markers (squash or reword before pushing)

## 🔄 Multi-Change Commits

When a commit includes multiple related changes, use this format:

```
<Type> <Component>: <main change>, <secondary change>, and <tertiary change>
```

Example:
```
✅ Enhance Android Build Workflow: remove workspace upload/download steps, add Node.js setup, install dependencies, and build web app
```

## 📌 Special Cases

### Merge Commits
```
Merge pull request #XX from user/branch-name
Merge branch 'feature/new-dashboard' into main
```

### Initial Commits
```
Initial commit: project setup with React, Vite, and Tailwind CSS
Initial plan: database schema and authentication flow
```

### Breaking Changes
Prefix with area and add BREAKING CHANGE note:
```
Refactor API: change task endpoint structure (BREAKING CHANGE: update all API calls)
```

## 🎓 Quick Reference

**Format**: `<Verb> <Area>: <what and why>`

**Common Verbs**: Add, Update, Fix, Refactor, Enhance, Remove

**Be Specific**: Include technical details, file names, and reasons

**Stay Concise**: One line, but informative and complete

---

## ✨ Examples by Category

### Features
- Add Telegram bot integration for build notifications
- Add user preference system with theme and language settings
- Add offline mode support with local storage sync

### Bug Fixes
- Fix race condition in task update mutation
- Fix memory leak in dashboard real-time subscription
- Fix incorrect calculation in monthly budget summary

### Refactoring
- Refactor TaskDetailModal: extract form logic to useTaskForm hook
- Refactor database queries: use React Query for all data fetching
- Refactor authentication flow: separate hooks for session and profile

### Enhancements
- Enhance Dashboard: add loading states and skeleton screens
- Enhance TaskList: implement virtual scrolling for performance
- Enhance Finance charts: add interactive tooltips and zoom functionality

### Configuration
- Update ESLint config: enable strict TypeScript rules
- Update Capacitor config: configure splash screen duration
- Update Supabase migrations: add indexes for query optimization

### Documentation
- Add contribution guidelines and code of conduct
- Update API documentation with new endpoints
- Fix broken links in setup documentation

---

**Remember**: A good commit message tells a story of WHAT changed and WHY it matters. Future developers (including AI agents) should understand the change without looking at the code.

