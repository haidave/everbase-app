import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error during auth callback:', error)
        navigate({ to: '/sign-in' })
        return
      }

      navigate({ to: '/dashboard' })
    }

    handleAuthCallback()
  }, [navigate])

  return <div className="grid min-h-screen place-items-center">Logging you in...</div>
}
