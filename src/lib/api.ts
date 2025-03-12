import {
  type Habit,
  type HabitCompletion,
  type Project,
  type ProjectStatus,
  type Task,
  type TaskProject,
} from '@/db/schema'

import { snakeToCamelCase, transformArraySnakeToCamel } from './formatters'
import { supabase } from './supabase'

// Define API-specific types
export type NewTask = {
  text: string
  completed?: boolean
  userId: string
}

export type NewProject = {
  name: string
  status?: ProjectStatus
  userId: string
}

export type NewHabit = {
  name: string
  description?: string
  userId: string
}

// Re-export schema types for convenience
export type { Project, ProjectStatus, Task, TaskProject, Habit, HabitCompletion }

export const api = {
  tasks: {
    getAll: async (): Promise<Task[]> => {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })

      if (error) throw error
      return transformArraySnakeToCamel<Task>(data)
    },

    getById: async (id: string): Promise<Task> => {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()

      if (error) throw error
      return snakeToCamelCase<Task>(data)
    },

    create: async (task: Omit<NewTask, 'userId'>): Promise<Task> => {
      const { data: userData } = await supabase.auth.getUser()

      const supabaseTask = {
        text: task.text,
        completed: task.completed,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('tasks').insert(supabaseTask).select().single()

      if (error) throw error
      return snakeToCamelCase<Task>(data)
    },

    update: async (id: string, updates: Partial<Pick<Task, 'text' | 'completed'>>): Promise<Task> => {
      const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()

      if (error) throw error
      return snakeToCamelCase<Task>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },

    addToProject: async (taskId: string, projectId: string): Promise<void> => {
      const { error } = await supabase.from('task_projects').insert({ task_id: taskId, project_id: projectId })

      if (error) throw error
    },
  },

  projects: {
    getAll: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })

      if (error) throw error
      return transformArraySnakeToCamel<Project>(data)
    },

    getById: async (id: string): Promise<Project> => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

      if (error) throw error
      return snakeToCamelCase<Project>(data)
    },

    create: async (project: Omit<NewProject, 'userId'>): Promise<Project> => {
      const { data: userData } = await supabase.auth.getUser()

      const supabaseProject = {
        name: project.name,
        status: project.status || 'backlog',
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('projects').insert(supabaseProject).select().single()

      if (error) throw error
      return snakeToCamelCase<Project>(data)
    },

    update: async (id: string, updates: Partial<Pick<Project, 'name' | 'status'>>): Promise<Project> => {
      const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()

      if (error) throw error
      return snakeToCamelCase<Project>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },

    // Get tasks for a specific project
    getTasks: async (projectId: string): Promise<Task[]> => {
      const { data, error } = await supabase.from('task_projects').select('task_id').eq('project_id', projectId)

      if (error) throw error

      if (!data.length) return []

      const taskIds = data.map((tp) => tp.task_id)
      const { data: tasks, error: tasksError } = await supabase.from('tasks').select('*').in('id', taskIds)

      if (tasksError) throw tasksError
      return transformArraySnakeToCamel<Task>(tasks)
    },
  },

  taskProjects: {
    // Add a task to a project
    addTaskToProject: async (taskId: string, projectId: string): Promise<void> => {
      const { error } = await supabase.from('task_projects').insert({
        task_id: taskId,
        project_id: projectId,
      })

      if (error) throw error
    },

    // Remove a task from a project
    removeTaskFromProject: async (taskId: string, projectId: string): Promise<void> => {
      const { error } = await supabase.from('task_projects').delete().match({ task_id: taskId, project_id: projectId })

      if (error) throw error
    },

    // Get all projects for a task
    getProjectsForTask: async (taskId: string): Promise<Project[]> => {
      const { data, error } = await supabase.from('task_projects').select('project_id').eq('task_id', taskId)

      if (error) throw error

      if (!data.length) return []

      const projectIds = data.map((tp) => tp.project_id)
      const { data: projects, error: projectsError } = await supabase.from('projects').select('*').in('id', projectIds)

      if (projectsError) throw projectsError
      return transformArraySnakeToCamel<Project>(projects)
    },
  },

  habits: {
    getAll: async (): Promise<Habit[]> => {
      const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: false })

      if (error) throw error
      return transformArraySnakeToCamel<Habit>(data)
    },

    getById: async (id: string): Promise<Habit> => {
      const { data, error } = await supabase.from('habits').select('*').eq('id', id).single()

      if (error) throw error
      return snakeToCamelCase<Habit>(data)
    },

    create: async (habit: Omit<NewHabit, 'userId'>): Promise<Habit> => {
      const { data: userData } = await supabase.auth.getUser()

      const supabaseHabit = {
        name: habit.name,
        description: habit.description,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('habits').insert(supabaseHabit).select().single()

      if (error) throw error
      return snakeToCamelCase<Habit>(data)
    },

    update: async (id: string, updates: Partial<Pick<Habit, 'name' | 'description' | 'active'>>): Promise<Habit> => {
      const { data, error } = await supabase.from('habits').update(updates).eq('id', id).select().single()

      if (error) throw error
      return snakeToCamelCase<Habit>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
    },
  },

  habitCompletions: {
    // Get completions for a specific date range
    getCompletions: async (habitId: string, startDate: Date, endDate: Date): Promise<HabitCompletion[]> => {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())

      if (error) throw error
      return transformArraySnakeToCamel<HabitCompletion>(data)
    },

    // Get today's completions for all habits
    getTodayCompletions: async (): Promise<HabitCompletion[]> => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .gte('completed_at', today.toISOString())
        .lt('completed_at', tomorrow.toISOString())

      if (error) throw error
      return transformArraySnakeToCamel<HabitCompletion>(data)
    },

    // Mark a habit as completed for today
    completeHabit: async (habitId: string): Promise<HabitCompletion> => {
      const { data, error } = await supabase.from('habit_completions').insert({ habit_id: habitId }).select().single()

      if (error) throw error
      return snakeToCamelCase<HabitCompletion>(data)
    },

    // Remove a completion (unmark a habit)
    removeCompletion: async (habitId: string): Promise<void> => {
      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .gte('completed_at', today.toISOString())
        .lt('completed_at', tomorrow.toISOString())

      if (error) throw error
    },
  },
}
