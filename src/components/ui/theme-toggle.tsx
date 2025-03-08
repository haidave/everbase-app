import { MoonIcon, SunIcon } from 'lucide-react'

import { useTheme } from '@/hooks/use-theme'

import { Button } from './button'

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export { ThemeToggle }
