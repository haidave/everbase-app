import { Link } from '@tanstack/react-router'

import { useAuth } from '@/hooks/use-auth'
import { useSignOut } from '@/hooks/use-sign-out'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const signOut = useSignOut()

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* App Header */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">everbase</h1>
            <nav className="hidden md:block">
              <ul className="flex gap-4">
                <li>
                  <Link
                    to="/dashboard"
                    activeProps={{ className: 'font-bold text-blue-500' }}
                    className="text-zinc-400 hover:text-white"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tasks"
                    activeProps={{ className: 'font-bold text-blue-500' }}
                    className="text-zinc-400 hover:text-white"
                  >
                    Tasks
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-400 md:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-zinc-800 bg-zinc-900 p-4 md:block">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  activeProps={{ className: 'bg-zinc-800 text-white' }}
                  className="block rounded-md px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/tasks"
                  activeProps={{ className: 'bg-zinc-800 text-white' }}
                  className="block rounded-md px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Tasks
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
