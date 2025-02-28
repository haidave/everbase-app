import { useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' })
    }
  }, [user, loading, navigate])

  if (loading) {
    return <div className="grid min-h-screen place-items-center">Loading...</div>
  }

  if (!user) return null

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-6xl font-bold">everbase</h1>
        <p className={cn('text-xl', 'text-balance text-zinc-400')}>to organize my messy life</p>
        <div className="flex flex-col items-center gap-4">
          <p>Welcome, {user.email}</p>
          <Link to="/tasks" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
            View Tasks
          </Link>
          <button
            onClick={signOut}
            className="rounded-lg bg-zinc-800 px-4 py-2 font-medium text-white hover:bg-zinc-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  )
}
