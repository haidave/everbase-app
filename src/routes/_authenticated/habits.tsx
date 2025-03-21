import { HabitList } from '@/features/habits/components/habit-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/habits')({
  component: HabitsPage,
  head: () => ({
    meta: [
      {
        title: 'Habits',
      },
    ],
  }),
})

function HabitsPage() {
  return (
    <section className="relative">
      <HabitList />
    </section>
  )
}
