import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'
import { ThemeToggle } from '../ui/theme-toggle'
import { AppBreadcrumbs } from './app-breadcrumbs'

const AppHeader = () => {
  return (
    <header className="flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <AppBreadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}

export { AppHeader }
