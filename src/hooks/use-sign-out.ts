import { useNavigate } from '@tanstack/react-router'

import { supabase } from '@/lib/supabase'

import { useAuth } from './use-auth'

export const useSignOut = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const signOut = async () => {
    if (!user) return

    try {
      // Sign out from Supabase
      await supabase.auth.signOut()

      // Navigate to sign-in page using the router
      // This prevents a full page reload
      navigate({ to: '/sign-in', replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
      // If there's an error, force a redirect as fallback
      window.location.href = '/sign-in'
    }
  }

  return signOut
}
