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
    <section>
      <ProjectList />
    </section>
  )
}
