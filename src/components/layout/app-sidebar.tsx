import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'
import { Home, LogOutIcon } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useSignOut } from '@/hooks/use-sign-out'

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
]

export function AppSidebar() {
  const { user } = useAuth()
  const signOut = useSignOut()

  return (
    <Sidebar>
      <SidebarHeader>
        <span className="p-2 text-lg font-bold">everbase</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between gap-2 px-2">
            <span className="truncate text-sm">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOutIcon />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
