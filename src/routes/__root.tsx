import { useEffect, useState } from 'react'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { useAuth } from '@/hooks/use-auth'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const [isLoading, setIsLoading] = useState(true)
  const { loading: authLoading } = useAuth()

  useEffect(() => {
    // Only show loading for a minimum time if auth is also loading
    const timer = setTimeout(
      () => {
        setIsLoading(false)
      },
      authLoading ? 500 : 250
    ) // Shorter delay if auth is ready

    return () => clearTimeout(timer)
  }, [authLoading])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <Outlet />
      {process.env.SHOW_DEVTOOLS === 'true' && <TanStackRouterDevtools />}
    </>
  )
}
