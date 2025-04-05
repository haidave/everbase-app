import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

import { useFeatures } from '@/hooks/use-features'

import { AddFeatureForm } from './add-feature-form'

type FeatureListProps = {
  projectId: string
}

export function FeatureList({ projectId }: FeatureListProps) {
  const { data: features, isLoading, error } = useFeatures(projectId)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  if (isLoading) return <div className="p-4">Loading features...</div>
  if (error) return <div className="p-4 text-red-500">Error loading features: {error.message}</div>

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground-primary text-lg font-medium">Project Features</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
          <PlusIcon />
          Add Feature
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-6">
        {features && features.length > 0 ? (
          features.map((feature) => (
            <Button key={feature.id} asChild variant="secondary" className="h-14">
              <Link to="/projects/$projectId/features/$featureId" params={{ projectId, featureId: feature.id }}>
                <div className="flex items-center gap-2">
                  <DynamicIcon name={feature.icon} className="size-4" />
                  <span className="text-sm">{feature.name}</span>
                </div>
              </Link>
            </Button>
          ))
        ) : (
          <div className="text-muted-foreground col-span-2 text-sm">
            No features yet. Add your first feature to organize your project.
          </div>
        )}
      </div>

      <AddFeatureForm projectId={projectId} open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </section>
  )
}
