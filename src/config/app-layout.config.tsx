import {
  CakeIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CalendarSyncIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PiggyBankIcon,
  QuoteIcon,
  SproutIcon,
  type LucideIcon,
} from 'lucide-react'

export type NavigationRoute = {
  title: string
  url: string
  icon: LucideIcon
  group?: 'other'
}

export const NAVIGATION_ITEMS: NavigationRoute[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Tasks',
    url: '/tasks',
    icon: ListTodoIcon,
  },
  {
    title: 'Events',
    url: '/events',
    icon: CalendarIcon,
  },
  {
    title: 'Habits',
    url: '/habits',
    icon: SproutIcon,
  },
  {
    title: 'Projects',
    url: '/projects',
    icon: FolderKanbanIcon,
  },
  {
    title: 'Journal',
    url: '/journal',
    icon: NotebookPenIcon,
  },
  {
    title: 'Budget Tracker',
    url: '/budget-tracker',
    icon: PiggyBankIcon,
  },
  {
    title: 'Monthly Checklist',
    url: '/monthly-checklist',
    icon: CalendarCheckIcon,
    group: 'other',
  },
  {
    title: 'Birthdays',
    url: '/birthdays',
    icon: CakeIcon,
    group: 'other',
  },
  {
    title: 'Subscriptions',
    url: '/subscriptions',
    icon: CalendarSyncIcon,
    group: 'other',
  },
  {
    title: 'Quotes',
    url: '/quotes',
    icon: QuoteIcon,
    group: 'other',
  },
]
