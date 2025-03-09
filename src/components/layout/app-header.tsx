import { useRouterState } from '@tanstack/react-router'

import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'
import { ThemeToggle } from '../ui/theme-toggle'

const AppHeader = () => {
  const routerState = useRouterState()
  const currentRoute = routerState.matches.at(-1)
  const currentPageTitle = currentRoute?.meta?.[0]?.title

  return (
    <header className="flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <span className="text-sm font-medium">{currentPageTitle}</span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}

export { AppHeader }
