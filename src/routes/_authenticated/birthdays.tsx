import { AddBirthdayForm } from '@/features/birthdays/components/add-birthday-form'
import { BirthdayList } from '@/features/birthdays/components/birthday-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/birthdays')({
  component: BirthdaysPage,
  head: () => ({
    meta: [
      {
        title: 'Birthdays',
      },
    ],
  }),
})

function BirthdaysPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Birthdays</h2>
      <AddBirthdayForm open={false} onOpenChange={() => {}} />
      <BirthdayList />
    </section>
  )
}
