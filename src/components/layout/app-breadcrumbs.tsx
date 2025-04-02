import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumbs'
import { Link, useRouterState } from '@tanstack/react-router'

type BreadcrumbLevel = {
  title: string | ((loaderData: Record<string, unknown>, params: Record<string, string>) => string)
  to: string
  routeId?: string
}

type BreadcrumbConfig = {
  levels: BreadcrumbLevel[]
  formatTitle?: (title: string) => string
}

const ROUTE_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
  '/_authenticated/projects/$projectId': {
    levels: [
      {
        title: 'Projects',
        to: '/projects',
      },
    ],
  },
  '/_authenticated/projects_/$projectId/features/$featureId': {
    levels: [
      {
        title: 'Projects',
        to: '/projects',
      },
      {
        title: (loaderData) => {
          return (loaderData as { project?: { name?: string } })?.project?.name || 'Project'
        },
        to: '/projects/$projectId',
        routeId: '/_authenticated/projects_/$projectId/features/$featureId',
      },
      {
        title: 'Features',
        to: '/projects/$projectId/features',
      },
    ],
  },
}

const AppBreadcrumbs = () => {
  const routerState = useRouterState()
  const currentRoute = routerState.matches.at(-1)
  const routeId = currentRoute?.routeId || ''
  const currentPageTitle = currentRoute?.meta?.[0]?.title || ''
  const routeParams = currentRoute?.params || {}

  const config = ROUTE_BREADCRUMBS[routeId]

  // Helper function to replace params in the URL
  const getProcessedUrl = (url: string) => {
    let processedUrl = url
    // Replace any parameters with their actual values
    Object.entries(routeParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        processedUrl = processedUrl.replace(`$${key}`, value)
      }
    })
    return processedUrl
  }

  // Helper function to get the title
  const getTitle = (level: BreadcrumbLevel) => {
    if (typeof level.title === 'function' && level.routeId) {
      // Find the route match with the specified routeId
      const routeMatch = routerState.matches.find((match) => match.routeId === level.routeId)
      if (routeMatch?.loaderData) {
        return level.title(routeMatch.loaderData, routeParams)
      }
    }

    if (typeof level.title === 'function') {
      return level.title({}, routeParams)
    }

    return level.title
  }

  if (config?.levels && config.levels.length > 0) {
    const { levels } = config
    let displayTitle = currentPageTitle

    // Apply any custom formatting
    if (config.formatTitle) {
      displayTitle = config.formatTitle(displayTitle)
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {levels.map((level, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={getProcessedUrl(level.to)}>{getTitle(level)}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < levels.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
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
