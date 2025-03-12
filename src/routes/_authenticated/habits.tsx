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
    <div className="flex flex-col gap-6 px-2 py-4">
      <section className="bg-card relative flex-1 gap-6 rounded-lg border p-4">
        <HabitList />
      </section>
    </div>
  )
}
