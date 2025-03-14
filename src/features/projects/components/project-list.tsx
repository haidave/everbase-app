import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

import { useProjects } from '@/hooks/use-projects'

import { ProjectForm } from './project-form'

const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  if (isLoading) return <div className="p-4">Loading projects...</div>
  if (error) return <div className="p-4 text-red-500">Error loading projects: {error.message}</div>
  if (!projects?.length)
    return (
      <div className="flex flex-col items-center gap-4">
        <p>No projects yet.</p>
        <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create your first project
        </Button>
        <ProjectForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      </div>
    )

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="min-h-40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <Badge>{project.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="secondary" size="sm" asChild>
                <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                  View
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        <Card className="grid min-h-40 place-items-center py-6">
          <Button variant="ghost" onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2" />
            Add Project
          </Button>
        </Card>
      </div>

      <ProjectForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}

export { ProjectList }
