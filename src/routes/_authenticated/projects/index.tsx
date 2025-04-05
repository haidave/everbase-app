import { ProjectKanbanBoard } from '@/features/projects/components/project-kanban-board/project-kanban-board'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/projects/')({
  component: ProjectsPage,
  head: () => ({
    meta: [
      {
        title: 'Projects',
      },
    ],
  }),
})

function ProjectsPage() {
  return (
    <section>
      <ProjectKanbanBoard />
    </section>
  )
}
