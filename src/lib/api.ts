import { type tasks } from '@/db/schema'
import { type InferSelectModel } from 'drizzle-orm'

import { supabase } from './supabase'

// Use types inferred from your Drizzle schema
export type Task = InferSelectModel<typeof tasks>
export type NewTask = {
  text: string
  completed?: string
  userId: string
}

export const api = {
  tasks: {
    getAll: async (): Promise<Task[]> => {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },

    getById: async (id: string): Promise<Task> => {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()

      if (error) throw error
      return data
    },

    create: async (task: Omit<NewTask, 'userId'>): Promise<Task> => {
      const { data: userData } = await supabase.auth.getUser()

      const supabaseTask = {
        text: task.text,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('tasks').insert(supabaseTask).select().single()

      if (error) throw error
      return data
    },

    update: async (id: string, updates: Partial<Pick<Task, 'text' | 'completed'>>): Promise<Task> => {
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
