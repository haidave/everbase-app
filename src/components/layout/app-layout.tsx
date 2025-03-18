import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <div className="custom-scrollbar overflow-auto p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
