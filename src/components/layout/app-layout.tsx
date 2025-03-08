import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { ThemeToggle } from '../ui/theme-toggle'
import { AppSidebar } from './app-sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex items-center justify-between p-4">
          <SidebarTrigger />
          <ThemeToggle />
        </header>

        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
