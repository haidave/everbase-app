import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'
import { AppBreadcrumbs } from './app-breadcrumbs'

const AppHeader = () => {
  return (
    <header className="flex min-h-9 items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <AppBreadcrumbs />
      </div>
    </header>
  )
}

export { AppHeader }
