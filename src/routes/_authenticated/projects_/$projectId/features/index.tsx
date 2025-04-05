import { FeatureList } from '@/features/projects/components/feature-list'
import { createFileRoute } from '@tanstack/react-router'

import { api } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/projects_/$projectId/features/')({
  component: FeaturesPage,
  loader: async ({ params }) => {
    const project = await api.projects.getById(params.projectId)
    return { project }
  },
  head: () => ({
    meta: [
      {
        title: 'Features',
      },
    ],
  }),
})

function FeaturesPage() {
  const { projectId } = Route.useParams()

  return (
    <section>
      <FeatureList projectId={projectId} />
    </section>
  )
}
