import { LoadingScreen } from '@/components/ui/loading-screen'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { getSession, useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/sign-in')({
  // Loader provides data to the component and runs before rendering
  loader: async () => {
    const session = await getSession()
    return { isAuthenticated: !!session }
  },
  // This runs before the loader and can redirect immediately
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SignIn,
})

function SignIn() {
  const { isAuthenticated } = Route.useLoaderData()
  const { loading, signIn } = useAuth()

  // Show loading screen if we're still checking auth status
  if (loading && !isAuthenticated) {
    return <LoadingScreen />
  }

  return (
    <div className="grid min-h-screen place-items-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-6xl font-bold">everbase</h1>
        <p className="text-xl text-zinc-400">to organize my messy life</p>
        <button onClick={signIn} className="rounded-lg bg-white px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-200">
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
