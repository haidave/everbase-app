import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
})

function SignIn() {
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: '/dashboard' })
    }
  }, [user, loading, navigate])

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
