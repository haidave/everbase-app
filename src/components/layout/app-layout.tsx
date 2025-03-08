import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { AppSidebar } from './app-sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="p-4">
          <SidebarTrigger />
        </header>

        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
