import { SidebarTrigger } from '../ui/sidebar'
import { ThemeToggle } from '../ui/theme-toggle'

const AppHeader = () => {
  return (
    <header className="flex items-center justify-between border-b px-4 py-2">
      <SidebarTrigger />
      <ThemeToggle />
    </header>
  )
}

export { AppHeader }
