import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigError } from './ConfigError.tsx'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { initializeTheme } from './shared/theme'

initializeTheme()
import './index.css'
import './App.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <StrictMode>
    {isSupabaseConfigured ? <App /> : <ConfigError />}
  </StrictMode>,
)
