import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import './i18n/config'
import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { SettingsProvider } from '@/shared/hooks/use-settings'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <SettingsProvider>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </SettingsProvider>
)
