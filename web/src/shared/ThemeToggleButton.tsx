import { useState } from 'react'
import { IonIcon } from './IonIcon'
import { getActiveTheme, toggleTheme, type Theme } from './theme'

export function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme>(getActiveTheme)

  function handleToggle() {
    setTheme(toggleTheme())
  }

  const isDarkTheme = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle-button"
      onClick={handleToggle}
      aria-label={isDarkTheme ? 'Activer le thème clair' : 'Activer le thème sombre'}
      title={isDarkTheme ? 'Thème clair' : 'Thème sombre'}
    >
      <IonIcon iconName={isDarkTheme ? 'sunny-outline' : 'moon-outline'} />
    </button>
  )
}
