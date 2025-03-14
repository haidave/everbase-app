import { ProjectList } from '@/features/projects/components/project-list'
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
    <section className="bg-card break-inside-avoid rounded-lg border p-4">
      <h2 className="mb-4">Projects</h2>
      <ProjectList />
    </section>
  )
}
