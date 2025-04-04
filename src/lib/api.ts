import {
  type Birthday,
  type Event,
  type Habit,
  type HabitCompletion,
  type Journal,
  type MonthlyChecklist,
  type MonthlyChecklistCompletion,
  type Project,
  type ProjectStatus,
  type Quote,
  type Subscription,
  type SubscriptionFrequency,
  type Task,
  type TaskProject,
  type TaskStatus,
} from '@/db/schema'

import { snakeToCamelCase, transformArraySnakeToCamel } from './formatters'
import { normalizeToUTCDay } from './normalizers'
import { supabase } from './supabase'
import { getUTCDayRange } from './utils'

// Define API-specific types
export type NewTask = {
  text: string
  status?: TaskStatus
  userId: string
  order?: number
}

export type NewProject = {
  name: string
  status?: ProjectStatus
  userId: string
  icon?: string
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

export type NewBirthday = {
  name: string
  birthDate: Date
  description?: string
  userId: string
}

export type NewEvent = {
  title: string
  date: Date
  description?: string
  userId: string
}

export type NewSubscription = {
  name: string
  price: string
  currency: string
  frequency: SubscriptionFrequency
  renewalDay: number
  renewalMonth?: number
  startDate: Date
  description?: string
  userId: string
  active: boolean
}

// Add Feature type
export type Feature = {
  id: string
  projectId: string
  name: string
  description?: string
  icon: string
  createdAt: string
  updatedAt: string
}

export type NewFeature = {
  projectId: string
  name: string
  description?: string
  icon?: string
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
  Birthday,
  Event,
  Subscription,
  SubscriptionFrequency,
  Quote,
}

export const api = {
  tasks: {
    getAll: async (): Promise<Task[]> => {
      const { data: userData } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userData.user?.id)
        .order('status')
        .order('order', { ascending: true }) // Lower order values first

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
        status: task.status || 'todo',
        order: task.order !== undefined ? task.order : 1000,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('tasks').insert(supabaseTask).select().single()

      if (error) throw error
      return snakeToCamelCase<Task>(data)
    },

    update: async (id: string, updates: Partial<Pick<Task, 'text' | 'status' | 'order'>>): Promise<Task> => {
      const dbUpdates: Record<string, unknown> = {}

      if (updates.text !== undefined) dbUpdates.text = updates.text
      if (updates.status !== undefined) dbUpdates.status = updates.status
      if (updates.order !== undefined) dbUpdates.order = updates.order

      const { data, error } = await supabase.from('tasks').update(dbUpdates).eq('id', id).select().single()

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

    addToFeature: async (taskId: string, featureId: string): Promise<void> => {
      const { error } = await supabase.from('task_features').insert({ task_id: taskId, feature_id: featureId })

      if (error) throw error
    },

    removeFromFeature: async (taskId: string, featureId: string): Promise<void> => {
      const { error } = await supabase.from('task_features').delete().eq('task_id', taskId).eq('feature_id', featureId)

      if (error) throw error
    },

    getFeatures: async (taskId: string): Promise<Feature[]> => {
      const { data, error } = await supabase.from('task_features').select('feature_id').eq('task_id', taskId)

      if (error) throw error

      if (data.length === 0) return []

      const featureIds = data.map((item) => item.feature_id)
      const { data: features, error: featuresError } = await supabase.from('features').select('*').in('id', featureIds)

      if (featuresError) throw featuresError
      return transformArraySnakeToCamel<Feature>(features)
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
        icon: project.icon || 'Folder',
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('projects').insert(supabaseProject).select().single()

      if (error) throw error
      return snakeToCamelCase<Project>(data)
    },

    update: async (project: Pick<Project, 'id' | 'name' | 'status' | 'icon'>): Promise<Project> => {
      const { id, ...updates } = project
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

  birthdays: {
    getAll: async (): Promise<Birthday[]> => {
      const { data, error } = await supabase.from('birthdays').select('*').order('birth_date', { ascending: true })

      if (error) throw error
      return transformArraySnakeToCamel<Birthday>(data)
    },

    getById: async (id: string): Promise<Birthday> => {
      const { data, error } = await supabase.from('birthdays').select('*').eq('id', id).single()

      if (error) throw error
      return snakeToCamelCase<Birthday>(data)
    },

    create: async (birthday: Omit<NewBirthday, 'userId'>): Promise<Birthday> => {
      const { data: userData } = await supabase.auth.getUser()

      const supabaseBirthday = {
        name: birthday.name,
        birth_date: birthday.birthDate.toISOString(),
        description: birthday.description,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('birthdays').insert(supabaseBirthday).select().single()

      if (error) throw error
      return snakeToCamelCase<Birthday>(data)
    },

    update: async (
      id: string,
      updates: Partial<Pick<Birthday, 'name' | 'birthDate' | 'description'>>
    ): Promise<Birthday> => {
      // Create a new object with snake_case keys for Supabase
      const supabaseUpdates: Record<string, string | null> = {}

      if (updates.name !== undefined) {
        supabaseUpdates.name = updates.name
      }

      if (updates.description !== undefined) {
        supabaseUpdates.description = updates.description
      }

      if (updates.birthDate !== undefined) {
        supabaseUpdates.birth_date = updates.birthDate.toISOString()
      }

      const { data, error } = await supabase.from('birthdays').update(supabaseUpdates).eq('id', id).select().single()

      if (error) throw error
      return snakeToCamelCase<Birthday>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('birthdays').delete().eq('id', id)
      if (error) throw error
    },
  },

  events: {
    getAll: async (): Promise<Event[]> => {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true })

      if (error) throw error
      return transformArraySnakeToCamel<Event>(data)
    },

    getById: async (id: string): Promise<Event> => {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single()

      if (error) throw error
      return snakeToCamelCase<Event>(data)
    },

    create: async (event: Omit<NewEvent, 'userId'>): Promise<Event> => {
      const { data: userData } = await supabase.auth.getUser()

      const normalizedDate = normalizeToUTCDay(event.date)

      const supabaseEvent = {
        title: event.title,
        date: normalizedDate.toISOString(),
        description: event.description,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('events').insert(supabaseEvent).select().single()

      if (error) throw error
      return snakeToCamelCase<Event>(data)
    },

    update: async (id: string, updates: Partial<Pick<Event, 'title' | 'date' | 'description'>>): Promise<Event> => {
      const updatesToApply = { ...updates }

      if (updatesToApply.date) {
        updatesToApply.date = normalizeToUTCDay(updatesToApply.date)
      }

      const supabaseUpdates = {
        ...updatesToApply,
        date: updatesToApply.date?.toISOString(),
      }

      const { data, error } = await supabase.from('events').update(supabaseUpdates).eq('id', id).select().single()

      if (error) throw error
      return snakeToCamelCase<Event>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
    },

    // Get upcoming events within a date range
    getUpcoming: async (startDate: Date, endDate: Date): Promise<Event[]> => {
      const normalizedStartDate = normalizeToUTCDay(startDate)
      const { end: normalizedEndDate } = getUTCDayRange(endDate)

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', normalizedStartDate.toISOString())
        .lte('date', normalizedEndDate.toISOString())
        .order('date', { ascending: true })

      if (error) throw error
      return transformArraySnakeToCamel<Event>(data)
    },
  },

  subscriptions: {
    getAll: async (): Promise<Subscription[]> => {
      const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })

      if (error) throw error
      return transformArraySnakeToCamel<Subscription>(data)
    },

    getById: async (id: string): Promise<Subscription> => {
      const { data, error } = await supabase.from('subscriptions').select('*').eq('id', id).single()

      if (error) throw error
      return snakeToCamelCase<Subscription>(data)
    },

    create: async (subscription: Omit<NewSubscription, 'userId'>): Promise<Subscription> => {
      const { data: userData } = await supabase.auth.getUser()

      const supabaseSubscription = {
        name: subscription.name,
        price: subscription.price,
        currency: subscription.currency,
        frequency: subscription.frequency,
        renewal_day: subscription.renewalDay,
        renewal_month: subscription.renewalMonth,
        start_date: subscription.startDate.toISOString(),
        description: subscription.description,
        active: subscription.active,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('subscriptions').insert(supabaseSubscription).select().single()

      if (error) throw error
      return snakeToCamelCase<Subscription>(data)
    },

    update: async (
      id: string,
      updates: Partial<
        Pick<
          Subscription,
          | 'name'
          | 'price'
          | 'currency'
          | 'frequency'
          | 'renewalDay'
          | 'renewalMonth'
          | 'startDate'
          | 'description'
          | 'active'
        >
      >
    ): Promise<Subscription> => {
      // Create a clean object with snake_case keys for Supabase
      const supabaseUpdates = {
        name: updates.name,
        price: updates.price,
        currency: updates.currency,
        frequency: updates.frequency,
        renewal_day: updates.renewalDay,
        renewal_month: updates.renewalMonth,
        start_date: updates.startDate?.toISOString(),
        description: updates.description,
        active: updates.active,
      }

      // Filter out undefined values
      Object.keys(supabaseUpdates).forEach((key) => {
        if (supabaseUpdates[key as keyof typeof supabaseUpdates] === undefined) {
          delete supabaseUpdates[key as keyof typeof supabaseUpdates]
        }
      })

      const { data, error } = await supabase
        .from('subscriptions')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return snakeToCamelCase<Subscription>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id)
      if (error) throw error
    },
  },

  quotes: {
    getAll: async (): Promise<Quote[]> => {
      const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false })

      if (error) throw error
      return transformArraySnakeToCamel<Quote>(data)
    },

    getQuoteOfTheDay: async (): Promise<Quote | null> => {
      // Get all quotes
      const { data, error } = await supabase.from('quotes').select('*')

      if (error) throw error
      if (!data.length) return null

      // Use the current date as a seed for consistent daily selection
      const today = new Date()
      const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
      const seed = Array.from(dateString).reduce((acc, char) => acc + char.charCodeAt(0), 0)

      // Select a quote using the seed
      const selectedIndex = seed % data.length
      return snakeToCamelCase<Quote>(data[selectedIndex])
    },

    create: async (quote: Omit<Quote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Quote> => {
      const { data: userData } = await supabase.auth.getUser()

      const supabaseQuote = {
        quote: quote.quote,
        author: quote.author,
        user_id: userData.user?.id,
      }

      const { data, error } = await supabase.from('quotes').insert(supabaseQuote).select().single()

      if (error) throw error
      return snakeToCamelCase<Quote>(data)
    },

    update: async (quote: Pick<Quote, 'id' | 'quote' | 'author'>): Promise<Quote> => {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          quote: quote.quote,
          author: quote.author,
        })
        .eq('id', quote.id)
        .select()
        .single()

      if (error) throw error
      return snakeToCamelCase<Quote>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('quotes').delete().eq('id', id)
      if (error) throw error
    },
  },

  features: {
    getAll: async (projectId: string): Promise<Feature[]> => {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return transformArraySnakeToCamel<Feature>(data)
    },

    getById: async (id: string): Promise<Feature> => {
      const { data, error } = await supabase.from('features').select('*').eq('id', id).single()

      if (error) throw error
      return snakeToCamelCase<Feature>(data)
    },

    create: async (feature: NewFeature): Promise<Feature> => {
      const supabaseFeature = {
        project_id: feature.projectId,
        name: feature.name,
        description: feature.description || null,
        icon: feature.icon || 'folders',
      }

      const { data, error } = await supabase.from('features').insert(supabaseFeature).select().single()

      if (error) throw error
      return snakeToCamelCase<Feature>(data)
    },

    update: async (feature: Partial<Feature> & { id: string }): Promise<Feature> => {
      const { id, ...updates } = feature
      const supabaseUpdates = {
        name: updates.name,
        description: updates.description,
        icon: updates.icon,
        project_id: updates.projectId,
      }

      // Only include properties that are defined
      const filteredUpdates = Object.fromEntries(Object.entries(supabaseUpdates).filter(([, v]) => v !== undefined))

      const { data, error } = await supabase.from('features').update(filteredUpdates).eq('id', id).select().single()

      if (error) throw error
      return snakeToCamelCase<Feature>(data)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('features').delete().eq('id', id)
      if (error) throw error
    },

    getTasks: async (featureId: string): Promise<Task[]> => {
      const { data, error } = await supabase.from('task_features').select('task_id').eq('feature_id', featureId)

      if (error) throw error

      if (data.length === 0) return []

      const taskIds = data.map((item) => item.task_id)
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds)
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError
      return transformArraySnakeToCamel<Task>(tasks)
    },
  },
}
