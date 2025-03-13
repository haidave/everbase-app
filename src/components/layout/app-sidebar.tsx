import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'
import { FolderIcon, LayoutDashboardIcon, ListTodoIcon, LogOutIcon, SproutIcon } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useProjects } from '@/hooks/use-projects'
import { useSignOut } from '@/hooks/use-sign-out'

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Tasks',
    url: '/tasks',
    icon: ListTodoIcon,
  },
  {
    title: 'Habits',
    url: '/habits',
    icon: SproutIcon,
  },
]

export function AppSidebar() {
  const { user } = useAuth()
  const signOut = useSignOut()
  const { data: projects, isLoading: isLoadingProjects } = useProjects()

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

        {isLoadingProjects || (projects && projects.length > 0) ? (
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              {isLoadingProjects ? (
                <>
                  <SidebarMenuSkeleton showIcon />
                  <SidebarMenuSkeleton showIcon />
                  <SidebarMenuSkeleton showIcon />
                </>
              ) : (
                projects?.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton>
                      <FolderIcon className="shrink-0" />
                      <span>{project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
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
