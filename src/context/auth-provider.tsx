import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const ensureUserInDatabase = async (user: User) => {
    // Check if user exists in public.users table
    const { data: existingUser } = await supabase.from('users').select('*').eq('id', user.id).single()

    // If user doesn't exist in public.users, create them
    if (!existingUser) {
      console.log('Creating user record in database:', user.id)
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
      })

      if (insertError) {
        console.error('Error creating user record:', insertError)
      } else {
        console.log('User record created successfully')
      }
    }
  }

  useEffect(() => {
    if (session?.user) {
      ensureUserInDatabase(session.user)
    }
  }, [session])

  const value = {
    session,
    user,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
