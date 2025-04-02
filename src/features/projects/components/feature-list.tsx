import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground-primary text-lg font-medium">Features</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-fit">
          <PlusIcon />
          Add Feature
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features && features.length > 0 ? (
          features.map((feature) => (
            <Card key={feature.id} className="min-h-32">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <DynamicIcon name={feature.icon} className="size-4" />
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                </div>
              </CardHeader>
              {feature.description && (
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              )}
              <CardFooter className="flex justify-end">
                <Button asChild>
                  <Link to="/projects/$projectId/features/$featureId" params={{ projectId, featureId: feature.id }}>
                    View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-muted-foreground col-span-2 text-sm">
            No features yet. Add your first feature to organize your project.
          </div>
        )}
      </div>

      <AddFeatureForm projectId={projectId} open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}
