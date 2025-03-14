import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumbs'
import { Link, useRouterState } from '@tanstack/react-router'

type BreadcrumbConfig = {
  parent?: {
    title: string
    to: string
  }
  formatTitle?: (title: string) => string
}

const ROUTE_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
  '/_authenticated/projects/$projectId': {
    parent: {
      title: 'Projects',
      to: '/projects',
    },
  },
}

const AppBreadcrumbs = () => {
  const routerState = useRouterState()
  const currentRoute = routerState.matches.at(-1)
  const routeId = currentRoute?.routeId || ''
  const currentPageTitle = currentRoute?.meta?.[0]?.title || ''

  const config = ROUTE_BREADCRUMBS[routeId]

  if (config?.parent) {
    const { parent } = config
    const displayTitle = config.formatTitle ? config.formatTitle(currentPageTitle) : currentPageTitle

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={parent.to}>{parent.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{displayTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { AppBreadcrumbs }
