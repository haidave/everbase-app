import { createFileRoute, Link } from '@tanstack/react-router'

import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
  head: () => ({
    meta: [
      {
        title: 'Dashboard',
      },
    ],
  }),
})

function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="mb-4 text-2xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-zinc-400">
          Hello, <span className="font-medium text-white">{user?.email}</span>! This is your personal dashboard where
          you can manage your tasks and organize your work.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Tasks" description="Manage your tasks and track your progress" link="/tasks" icon="📋" />
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  description,
  link,
  icon,
}: {
  title: string
  description: string
  link: string
  icon: string
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-700">
      <div className="mb-2 text-3xl">{icon}</div>
      <h2 className="mb-2 text-lg font-medium">{title}</h2>
      <p className="mb-4 text-sm text-zinc-400">{description}</p>
      <Link to={link} className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-400">
        View {title} <span className="ml-1">→</span>
      </Link>
    </div>
  )
}
