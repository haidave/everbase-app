import { createFileRoute, redirect } from '@tanstack/react-router'

import { getSession } from '@/hooks/use-auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Check if user is authenticated
    const session = await getSession()

    // Redirect to dashboard if authenticated, otherwise to sign-in
    if (session) {
      throw redirect({
        to: '/dashboard',
      })
    } else {
      throw redirect({
        to: '/sign-in',
      })
    }
  },
})
