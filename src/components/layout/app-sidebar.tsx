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
import { ChevronDown, FileStackIcon } from 'lucide-react'

import { NAVIGATION_ITEMS } from '@/config/app-layout.config'
import { useProjects, useStarredProjects } from '@/hooks/use-projects'

import { DynamicIcon } from '../ui/dynamic-icon'
import { UserMenu } from '../ui/user-menu'
import { AppCommand } from './app-command'

export function AppSidebar() {
  const { data: projects } = useProjects()
  const { data: starredProjects, isLoading: isLoadingStarredProjects } = useStarredProjects()
  const matches = useMatches()
  const [isOtherOpen, setIsOtherOpen] = useState(false)

  const isPathActive = useCallback(
    (path: string) => {
      if (path === '/projects') {
        const isExactProjectsPage = matches.some(
          (match) => match.pathname === '/projects' || match.pathname === '/projects/'
        )

        return isExactProjectsPage
      }

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
            <Collapsible
              open={isOtherOpen}
              onOpenChange={setIsOtherOpen}
              className="group/collapsible group-data-[collapsible=icon]:hidden"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild>
                    <button>
                      <FileStackIcon className="size-4" />
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

        {isLoadingStarredProjects || (starredProjects && starredProjects.length > 0) ? (
          <SidebarGroup>
            <SidebarGroupLabel>Starred Projects</SidebarGroupLabel>
            <SidebarMenu>
              {isLoadingStarredProjects ? (
                <>
                  <SidebarMenuSkeleton showIcon />
                  <SidebarMenuSkeleton showIcon />
                </>
              ) : (
                starredProjects?.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={matches.some((match) => match.pathname.includes(`/projects/${project.id}`))}
                      className="group-data-[collapsible=icon]:outline-hover group-data-[collapsible=icon]:outline group-data-[collapsible=icon]:outline-dashed"
                    >
                      <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                        <DynamicIcon name={project.icon} />
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

      <SidebarFooter className="pr-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <UserMenu />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
