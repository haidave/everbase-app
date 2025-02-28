import { type tasks } from '@/db/schema'
import { type InferSelectModel } from 'drizzle-orm'

import { supabase } from './supabase'

// Use types inferred from your Drizzle schema
export type Task = InferSelectModel<typeof tasks>
export type NewTask = {
  title: string
  description?: string | null
  completed?: string
  userId: string // This will be mapped to user_id
}

export const api = {
  tasks: {
    getAll: async (userId: string): Promise<Task[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },

    getById: async (id: string): Promise<Task> => {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()

      if (error) throw error
      return data
    },

    create: async (task: NewTask): Promise<Task> => {
      // Map camelCase to snake_case for Supabase
      const { userId, ...rest } = task
      const supabaseTask = {
        ...rest,
        user_id: userId,
      }

      const { data, error } = await supabase.from('tasks').insert(supabaseTask).select().single()

      if (error) throw error
      return data
    },

    update: async (
      id: string,
      updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ): Promise<Task> => {
      const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()

      if (error) throw error
      return data
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)

      if (error) throw error
    },
  },
}
