import {
  type Habit,
  type HabitCompletion,
  type Journal,
  type MonthlyChecklist,
  type MonthlyChecklistCompletion,
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

export type NewJournal = {
  content: string
  userId: string
}

// Re-export schema types for convenience
export type {
  Project,
  ProjectStatus,
  Task,
  TaskProject,
  Habit,
  HabitCompletion,
  Journal,
  MonthlyChecklist,
  MonthlyChecklistCompletion,
}

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
      // Convert to UTC dates
      const utcStartDate = new Date(
        Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0)
      )
      const utcEndDate = new Date(
        Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)
      )

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .gte('completed_at', utcStartDate.toISOString())
        .lte('completed_at', utcEndDate.toISOString())

      if (error) throw error
      return transformArraySnakeToCamel<HabitCompletion>(data)
    },

    // Get today's completions for all habits
    getTodayCompletions: async (): Promise<HabitCompletion[]> => {
      const today = new Date()
      const utcStartDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0))
      const utcEndDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999))

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .gte('completed_at', utcStartDate.toISOString())
        .lte('completed_at', utcEndDate.toISOString())

      if (error) throw error
      return transformArraySnakeToCamel<HabitCompletion>(data)
    },

    // Mark a habit as completed for today
    completeHabit: async (habitId: string): Promise<HabitCompletion> => {
      // Use noon of today to avoid timezone issues
      const today = new Date()
      // Create a date with just the year, month, and day components
      const normalizedDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0))

      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          completed_at: normalizedDate.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return snakeToCamelCase<HabitCompletion>(data)
    },

    // Remove a completion (unmark a habit for today)
    removeCompletion: async (habitId: string): Promise<void> => {
      // Get today's date range using UTC
      const today = new Date()
      const startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0))
      const endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999))

      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())

      if (error) throw error
    },

    // Mark a habit as completed for a specific date
    completeHabitForDate: async (habitId: string, date: Date): Promise<HabitCompletion> => {
      // Create a date with just the year, month, and day components using UTC
      const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))

      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          completed_at: normalizedDate.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return snakeToCamelCase<HabitCompletion>(data)
    },

    // Remove a completion for a specific date
    removeCompletionForDate: async (habitId: string, date: Date): Promise<void> => {
      // Create UTC dates for the start and end of the day
      const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
      const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999))

      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())

      if (error) throw error
    },

    getAllCompletions: async (habitId: string): Promise<HabitCompletion[]> => {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .order('completed_at', { ascending: false })

      if (error) throw error
      return transformArraySnakeToCamel<HabitCompletion>(data)
    },

    uncompleteHabitForDate: async (habitId: string, date: Date): Promise<void> => {
      // Create a date range for the specific day (using UTC noon to avoid timezone issues)
      const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
      const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999))

      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())

      if (error) throw error
    },
  },
  journals: {
    getAll: async (): Promise<Journal[]> => {
      const { data, error } = await supabase.from('journals').select('*').order('created_at', { ascending: false })

      if (error) throw error
      return transformArraySnakeToCamel<Journal>(data)
    },

    getById: async (id: string): Promise<Journal> => {
      const { data, error } = await supabase.from('journals').select('*').eq('id', id).single()

      if (error) throw error
      return snakeToCamelCase<Journal>(data)
    },

    create: async (journal: Omit<NewJournal, 'userId'>): Promise<Journal> => {
      const { data: userData } = await supabase.auth.getUser()

      const supabaseJournal = {
        content: journal.content,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('journals').insert(supabaseJournal).select().single()

      if (error) throw error
      return snakeToCamelCase<Journal>(data)
    },

    update: async (id: string, updates: { content: string }): Promise<Journal> => {
      const { data, error } = await supabase.from('journals').update(updates).eq('id', id).select().single()

      if (error) throw error
      return snakeToCamelCase<Journal>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('journals').delete().eq('id', id)
      if (error) throw error
    },
  },

  monthlyChecklist: {
    getAll: async (): Promise<MonthlyChecklist[]> => {
      const { data, error } = await supabase
        .from('monthly_checklists')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw new Error(error.message)
      return transformArraySnakeToCamel<MonthlyChecklist>(data)
    },

    create: async (monthlyChecklist: {
      name: string
      description?: string
      active: boolean
    }): Promise<MonthlyChecklist> => {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      // Add user_id to the checklist item
      const checklistWithUserId = {
        ...monthlyChecklist,
        user_id: user.id,
      }

      const { data, error } = await supabase.from('monthly_checklists').insert(checklistWithUserId).select().single()

      if (error) throw new Error(error.message)
      return snakeToCamelCase<MonthlyChecklist>(data)
    },

    update: async (monthlyChecklist: {
      id: string
      name: string
      description?: string
      active?: boolean
    }): Promise<MonthlyChecklist> => {
      const { data, error } = await supabase
        .from('monthly_checklists')
        .update(monthlyChecklist)
        .eq('id', monthlyChecklist.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return snakeToCamelCase<MonthlyChecklist>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('monthly_checklists').delete().eq('id', id)

      if (error) throw new Error(error.message)
    },

    // Get completions for the current month
    getCompletions: async (month: string): Promise<MonthlyChecklistCompletion[]> => {
      const { data, error } = await supabase.from('monthly_checklist_completions').select('*').eq('month', month)

      if (error) throw new Error(error.message)
      return transformArraySnakeToCamel<MonthlyChecklistCompletion>(data)
    },

    complete: async (monthlyChecklistId: string, month: string): Promise<MonthlyChecklistCompletion> => {
      const { data, error } = await supabase
        .from('monthly_checklist_completions')
        .insert({
          monthly_checklist_id: monthlyChecklistId,
          month,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return snakeToCamelCase<MonthlyChecklistCompletion>(data)
    },

    uncomplete: async (monthlyChecklistId: string, month: string): Promise<void> => {
      const { error } = await supabase
        .from('monthly_checklist_completions')
        .delete()
        .eq('monthly_checklist_id', monthlyChecklistId)
        .eq('month', month)

      if (error) throw new Error(error.message)
    },
  },
}
