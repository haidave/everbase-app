import { useEffect, useState } from 'react'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate a minimum loading time to prevent flickering
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // 500ms minimum loading time

    return () => clearTimeout(timer)
  }, [])

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
