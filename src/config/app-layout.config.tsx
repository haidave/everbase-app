import {
  CakeIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CalendarSyncIcon,
  LayoutDashboardIcon,
  ListTodoIcon,
  NotebookPenIcon,
  QuoteIcon,
  SproutIcon,
  type LucideIcon,
} from 'lucide-react'

export type NavigationRoute = {
  title: string
  url: string
  icon: LucideIcon
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
    title: 'Habits',
    url: '/habits',
    icon: SproutIcon,
  },
  {
    title: 'Monthly Checklist',
    url: '/monthly-checklist',
    icon: CalendarCheckIcon,
  },
  {
    title: 'Events',
    url: '/events',
    icon: CalendarIcon,
  },
  {
    title: 'Birthdays',
    url: '/birthdays',
    icon: CakeIcon,
  },
  {
    title: 'Subscriptions',
    url: '/subscriptions',
    icon: CalendarSyncIcon,
  },
  {
    title: 'Quotes',
    url: '/quotes',
    icon: QuoteIcon,
  },
  {
    title: 'Journal',
    url: '/journal',
    icon: NotebookPenIcon,
  },
]
