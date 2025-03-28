import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link, useMatches } from '@tanstack/react-router'
import {
  CakeIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CalendarSyncIcon,
  CircleHelpIcon,
  FolderIcon,
  KeyboardIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  NotebookPenIcon,
  QuoteIcon,
  SproutIcon,
  UserIcon,
} from 'lucide-react'

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
  {
    title: 'Monthly Checklist',
    url: '/monthly-checklist',
    icon: CalendarCheckIcon,
  },
  {
    title: 'Events',
    url: '/events',
    icon: CalendarIcon,
  },
  {
    title: 'Birthdays',
    url: '/birthdays',
    icon: CakeIcon,
  },
  {
    title: 'Subscriptions',
    url: '/subscriptions',
    icon: CalendarSyncIcon,
  },
  {
    title: 'Quotes',
    url: '/quotes',
    icon: QuoteIcon,
  },
  {
    title: 'Journal',
    url: '/journal',
    icon: NotebookPenIcon,
  },
]

export function AppSidebar() {
  const signOut = useSignOut()
  const { data: projects, isLoading: isLoadingProjects } = useProjects()
  const matches = useMatches()

  // Function to check if a path is active
  const isPathActive = (path: string) => {
    return matches.some((match) => match.pathname === path)
  }

  return (
    <Sidebar collapsible="icon" className="py-2">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isPathActive(item.url)}>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Projects section */}
        {isLoadingProjects || (projects && projects.length > 0) ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              <Link to="/projects" className="hover:text-muted-foreground">
                Projects
              </Link>
            </SidebarGroupLabel>
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
                    <SidebarMenuButton asChild isActive={isPathActive(`/projects/${project.id}`)}>
                      <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                        <FolderIcon className="shrink-0" />
                        <span>{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="flex flex-row items-center justify-between">
          <div className="flex gap-2 group-data-[collapsible=icon]:hidden">
            <SidebarMenuItem>
              <SidebarMenuButton>
                <CircleHelpIcon />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <KeyboardIcon />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <UserIcon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
