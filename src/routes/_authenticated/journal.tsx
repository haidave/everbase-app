// src/routes/_authenticated/journal.tsx
import { AddJournalForm } from '@/features/journals/components/add-journal-form'
import { JournalList } from '@/features/journals/components/journal-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/journal')({
  component: JournalPage,
  head: () => ({
    meta: [
      {
        title: 'Journal',
      },
    ],
  }),
})

function JournalPage() {
  return (
    <section className="relative grid gap-6">
      <AddJournalForm />

      <JournalList />
    </section>
  )
}
