import { createFileRoute } from '@tanstack/react-router'

import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const { signIn } = useAuth()

  return (
    <div className="grid min-h-screen place-items-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">Welcome to Everbase</h1>
        <p className="text-xl text-zinc-400">Sign in to organize your life</p>
        <button onClick={signIn} className="rounded-lg bg-white px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-200">
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
