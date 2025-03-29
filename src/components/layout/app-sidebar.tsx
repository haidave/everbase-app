import { useCallback, useEffect, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link, useMatches } from '@tanstack/react-router'
import { ChevronDown, CircleEllipsisIcon, CircleHelpIcon, FolderIcon, KeyboardIcon, UserIcon } from 'lucide-react'

import { NAVIGATION_ITEMS } from '@/config/app-layout.config'
import { useProjects } from '@/hooks/use-projects'
import { useSignOut } from '@/hooks/use-sign-out'

import { AppCommand } from './app-command'

export function AppSidebar() {
  const signOut = useSignOut()
  const { data: projects, isLoading: isLoadingProjects } = useProjects()
  const matches = useMatches()
  const [isOtherOpen, setIsOtherOpen] = useState(false)

  const isPathActive = useCallback(
    (path: string) => {
      return matches.some((match) => match.pathname === path)
    },
    [matches]
  )

  useEffect(() => {
    const isAnyOtherActive = NAVIGATION_ITEMS.filter((item) => item.group === 'other').some((item) =>
      isPathActive(item.url)
    )

    setIsOtherOpen(isAnyOtherActive)
  }, [isPathActive])

  return (
    <Sidebar collapsible="icon" className="py-2">
      <SidebarHeader className="pr-4">
        <AppCommand projects={projects} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAVIGATION_ITEMS.filter((item) => !item.group).map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isPathActive(item.url)}>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <Collapsible open={isOtherOpen} onOpenChange={setIsOtherOpen} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild>
                    <button>
                      <CircleEllipsisIcon className="size-4" />
                      <span>Other pages</span>
                      <ChevronDown className="ml-auto size-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                    </button>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {NAVIGATION_ITEMS.filter((item) => item.group === 'other').map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isPathActive(item.url)}>
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

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
