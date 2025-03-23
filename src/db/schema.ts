import { type InferSelectModel } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Users table - will be managed by Supabase Auth
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Tasks table with simplified schema
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  text: text('text').notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const PROJECT_STATUSES = ['backlog', 'active', 'passive', 'completed'] as const
export const projectStatusEnum = pgEnum('project_status', PROJECT_STATUSES)

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  status: projectStatusEnum('status').default('backlog').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Junction table for many-to-many relationship between tasks and projects
export const taskProjects = pgTable('task_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Habits table
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Habit completions table to track daily completions
export const habitCompletions = pgTable('habit_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
})

// Journal table
export const journals = pgTable('journals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Monthly Checklist table
export const monthlyChecklist = pgTable('monthly_checklists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Monthly Checklist completions table to track monthly completions
export const monthlyChecklistCompletions = pgTable('monthly_checklist_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  monthlyChecklistId: uuid('monthly_checklist_id')
    .notNull()
    .references(() => monthlyChecklist.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
  month: text('month').notNull(), // Format: YYYY-MM
})

// Events table
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  title: text('title').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Birthdays table
export const birthdays = pgTable('birthdays', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  birthDate: timestamp('birth_date', { withTimezone: true }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Task = InferSelectModel<typeof tasks>
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]
export type Project = InferSelectModel<typeof projects>
export type TaskProject = InferSelectModel<typeof taskProjects>
export type Habit = InferSelectModel<typeof habits>
export type HabitCompletion = InferSelectModel<typeof habitCompletions>
export type Journal = InferSelectModel<typeof journals>
export type MonthlyChecklist = InferSelectModel<typeof monthlyChecklist>
export type MonthlyChecklistCompletion = InferSelectModel<typeof monthlyChecklistCompletions>
export type Event = InferSelectModel<typeof events>
export type Birthday = InferSelectModel<typeof birthdays>
