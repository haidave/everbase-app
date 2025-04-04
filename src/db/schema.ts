import { relations, type InferSelectModel } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Users table - will be managed by Supabase Auth
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Tasks table with simplified schema
export const TASK_STATUSES = ['todo', 'in_progress', 'on_hold', 'done'] as const
export const taskStatusEnum = pgEnum('task_status', TASK_STATUSES)

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  text: text('text').notNull(),
  status: taskStatusEnum('status').default('todo').notNull(),
  order: integer('order').default(0),
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
  icon: text('icon').default('folder').notNull(), // Store icon name from Lucide
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

// Subscription billing frequency
export const SUBSCRIPTION_FREQUENCIES = ['monthly', 'yearly'] as const
export const subscriptionFrequencyEnum = pgEnum('subscription_frequency', SUBSCRIPTION_FREQUENCIES)

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  price: text('price').notNull(), // Store as text to handle different currencies
  currency: text('currency').default('CZK').notNull(),
  frequency: subscriptionFrequencyEnum('frequency').default('monthly').notNull(),
  renewalDay: integer('renewal_day').notNull(), // Day of month (1-31) when subscription renews
  renewalMonth: integer('renewal_month'), // Month (1-12) for yearly subscriptions
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Quotes table
export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  quote: text('quote').notNull(),
  author: text('author').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Features table
export const features = pgTable('features', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon').default('folders').notNull(), // Default icon for features
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Create a relation between tasks and features
export const taskFeatures = pgTable('task_features', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  featureId: uuid('feature_id')
    .notNull()
    .references(() => features.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Define relationships
export const featuresRelations = relations(features, ({ one, many }) => ({
  project: one(projects, {
    fields: [features.projectId],
    references: [projects.id],
  }),
  tasks: many(taskFeatures),
}))

// Update task relations to include features
export const tasksRelations = relations(tasks, ({ many }) => ({
  projects: many(taskProjects),
  features: many(taskFeatures),
}))

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
export type SubscriptionFrequency = (typeof SUBSCRIPTION_FREQUENCIES)[number]
export type Subscription = InferSelectModel<typeof subscriptions>
export type Quote = InferSelectModel<typeof quotes>
export type TaskStatus = (typeof TASK_STATUSES)[number]
