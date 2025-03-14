/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignInImport } from './routes/sign-in'
import { Route as AuthenticatedImport } from './routes/_authenticated'
import { Route as IndexImport } from './routes/index'
import { Route as AuthCallbackImport } from './routes/auth/callback'
import { Route as AuthenticatedTasksImport } from './routes/_authenticated/tasks'
import { Route as AuthenticatedHabitsImport } from './routes/_authenticated/habits'
import { Route as AuthenticatedDashboardImport } from './routes/_authenticated/dashboard'
import { Route as AuthenticatedProjectsIndexImport } from './routes/_authenticated/projects/index'
import { Route as AuthenticatedProjectsProjectIdImport } from './routes/_authenticated/projects/$projectId'

// Create/Update Routes

const SignInRoute = SignInImport.update({
  id: '/sign-in',
  path: '/sign-in',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedRoute = AuthenticatedImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AuthCallbackRoute = AuthCallbackImport.update({
  id: '/auth/callback',
  path: '/auth/callback',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedTasksRoute = AuthenticatedTasksImport.update({
  id: '/tasks',
  path: '/tasks',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedHabitsRoute = AuthenticatedHabitsImport.update({
  id: '/habits',
  path: '/habits',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedDashboardRoute = AuthenticatedDashboardImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedProjectsIndexRoute = AuthenticatedProjectsIndexImport.update(
  {
    id: '/projects/',
    path: '/projects/',
    getParentRoute: () => AuthenticatedRoute,
  } as any,
)

const AuthenticatedProjectsProjectIdRoute =
  AuthenticatedProjectsProjectIdImport.update({
    id: '/projects/$projectId',
    path: '/projects/$projectId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthenticatedImport
      parentRoute: typeof rootRoute
    }
    '/sign-in': {
      id: '/sign-in'
      path: '/sign-in'
      fullPath: '/sign-in'
      preLoaderRoute: typeof SignInImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/dashboard': {
      id: '/_authenticated/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof AuthenticatedDashboardImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/habits': {
      id: '/_authenticated/habits'
      path: '/habits'
      fullPath: '/habits'
      preLoaderRoute: typeof AuthenticatedHabitsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/tasks': {
      id: '/_authenticated/tasks'
      path: '/tasks'
      fullPath: '/tasks'
      preLoaderRoute: typeof AuthenticatedTasksImport
      parentRoute: typeof AuthenticatedImport
    }
    '/auth/callback': {
      id: '/auth/callback'
      path: '/auth/callback'
      fullPath: '/auth/callback'
      preLoaderRoute: typeof AuthCallbackImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/projects/$projectId': {
      id: '/_authenticated/projects/$projectId'
      path: '/projects/$projectId'
      fullPath: '/projects/$projectId'
      preLoaderRoute: typeof AuthenticatedProjectsProjectIdImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/projects/': {
      id: '/_authenticated/projects/'
      path: '/projects'
      fullPath: '/projects'
      preLoaderRoute: typeof AuthenticatedProjectsIndexImport
      parentRoute: typeof AuthenticatedImport
    }
  }
}

// Create and export the route tree

interface AuthenticatedRouteChildren {
  AuthenticatedDashboardRoute: typeof AuthenticatedDashboardRoute
  AuthenticatedHabitsRoute: typeof AuthenticatedHabitsRoute
  AuthenticatedTasksRoute: typeof AuthenticatedTasksRoute
  AuthenticatedProjectsProjectIdRoute: typeof AuthenticatedProjectsProjectIdRoute
  AuthenticatedProjectsIndexRoute: typeof AuthenticatedProjectsIndexRoute
}

const AuthenticatedRouteChildren: AuthenticatedRouteChildren = {
  AuthenticatedDashboardRoute: AuthenticatedDashboardRoute,
  AuthenticatedHabitsRoute: AuthenticatedHabitsRoute,
  AuthenticatedTasksRoute: AuthenticatedTasksRoute,
  AuthenticatedProjectsProjectIdRoute: AuthenticatedProjectsProjectIdRoute,
  AuthenticatedProjectsIndexRoute: AuthenticatedProjectsIndexRoute,
}

const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof AuthenticatedRouteWithChildren
  '/sign-in': typeof SignInRoute
  '/dashboard': typeof AuthenticatedDashboardRoute
  '/habits': typeof AuthenticatedHabitsRoute
  '/tasks': typeof AuthenticatedTasksRoute
  '/auth/callback': typeof AuthCallbackRoute
  '/projects/$projectId': typeof AuthenticatedProjectsProjectIdRoute
  '/projects': typeof AuthenticatedProjectsIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof AuthenticatedRouteWithChildren
  '/sign-in': typeof SignInRoute
  '/dashboard': typeof AuthenticatedDashboardRoute
  '/habits': typeof AuthenticatedHabitsRoute
  '/tasks': typeof AuthenticatedTasksRoute
  '/auth/callback': typeof AuthCallbackRoute
  '/projects/$projectId': typeof AuthenticatedProjectsProjectIdRoute
  '/projects': typeof AuthenticatedProjectsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_authenticated': typeof AuthenticatedRouteWithChildren
  '/sign-in': typeof SignInRoute
  '/_authenticated/dashboard': typeof AuthenticatedDashboardRoute
  '/_authenticated/habits': typeof AuthenticatedHabitsRoute
  '/_authenticated/tasks': typeof AuthenticatedTasksRoute
  '/auth/callback': typeof AuthCallbackRoute
  '/_authenticated/projects/$projectId': typeof AuthenticatedProjectsProjectIdRoute
  '/_authenticated/projects/': typeof AuthenticatedProjectsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | ''
    | '/sign-in'
    | '/dashboard'
    | '/habits'
    | '/tasks'
    | '/auth/callback'
    | '/projects/$projectId'
    | '/projects'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | ''
    | '/sign-in'
    | '/dashboard'
    | '/habits'
    | '/tasks'
    | '/auth/callback'
    | '/projects/$projectId'
    | '/projects'
  id:
    | '__root__'
    | '/'
    | '/_authenticated'
    | '/sign-in'
    | '/_authenticated/dashboard'
    | '/_authenticated/habits'
    | '/_authenticated/tasks'
    | '/auth/callback'
    | '/_authenticated/projects/$projectId'
    | '/_authenticated/projects/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren
  SignInRoute: typeof SignInRoute
  AuthCallbackRoute: typeof AuthCallbackRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  SignInRoute: SignInRoute,
  AuthCallbackRoute: AuthCallbackRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_authenticated",
        "/sign-in",
        "/auth/callback"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_authenticated": {
      "filePath": "_authenticated.tsx",
      "children": [
        "/_authenticated/dashboard",
        "/_authenticated/habits",
        "/_authenticated/tasks",
        "/_authenticated/projects/$projectId",
        "/_authenticated/projects/"
      ]
    },
    "/sign-in": {
      "filePath": "sign-in.tsx"
    },
    "/_authenticated/dashboard": {
      "filePath": "_authenticated/dashboard.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/habits": {
      "filePath": "_authenticated/habits.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/tasks": {
      "filePath": "_authenticated/tasks.tsx",
      "parent": "/_authenticated"
    },
    "/auth/callback": {
      "filePath": "auth/callback.tsx"
    },
    "/_authenticated/projects/$projectId": {
      "filePath": "_authenticated/projects/$projectId.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/projects/": {
      "filePath": "_authenticated/projects/index.tsx",
      "parent": "/_authenticated"
    }
  }
}
ROUTE_MANIFEST_END */
