export type Theme = 'light' | 'dark'

const storageKey = 'skillswap-theme'

export function getStoredTheme(): Theme | null {
  const value = localStorage.getItem(storageKey)
  if (value === 'light' || value === 'dark') {
    return value
  }
  return null
}

export function getPreferredTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(storageKey, theme)
}

export function initializeTheme() {
  applyTheme(getStoredTheme() ?? getPreferredTheme())
}

export function getActiveTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function toggleTheme(): Theme {
  const nextTheme: Theme = getActiveTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(nextTheme)
  return nextTheme
}
