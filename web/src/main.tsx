import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { defineCustomElements } from 'ionicons/loader'
import { ConfigError } from './ConfigError.tsx'
import { isSupabaseConfigured } from './lib/supabaseClient'
import './registerIonIcons'
import './index.css'
import './App.css'
import App from './App.tsx'

defineCustomElements(window)

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <StrictMode>
    {isSupabaseConfigured ? <App /> : <ConfigError />}
  </StrictMode>,
)
