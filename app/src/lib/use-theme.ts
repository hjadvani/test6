import { useEffect } from 'react'
import { useLocatrStore } from './store'

// Sync the persisted theme to the <html> class. useEffect is correct here:
// we are writing to an external system (the DOM), not deriving render state.
export function useThemeEffect() {
  const theme = useLocatrStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])
}
