import { AppLayout } from '@/components/layout/app-layout'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { getSession } from '@/hooks/use-auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/sign-in',
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
