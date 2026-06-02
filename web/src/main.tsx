import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { defineCustomElements } from 'ionicons/loader'
import './index.css'
import App from './App.tsx'

defineCustomElements(window)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
