import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type Project, type ProjectStatus } from '@/db/schema'
import { Pencil } from 'lucide-react'

import { useProjects } from '@/hooks/use-projects'

import { ProjectEditForm } from './project-edit-form'

const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects()
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  if (isLoading) return <div className="p-4">Loading projects...</div>
  if (error) return <div className="p-4 text-red-500">Error loading projects: {error.message}</div>
  if (!projects?.length) return <p>No projects yet.</p>

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'backlog':
        return 'bg-muted text-muted-foreground'
      case 'active':
        return 'bg-primary text-primary-foreground'
      case 'passive':
        return 'bg-secondary text-secondary-foreground'
      case 'completed':
        return 'bg-green-500'
      default:
        return 'bg-slate-500'
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setEditingProject(project)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editingProject && (
        <ProjectEditForm
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => {
            if (!open) setEditingProject(null)
          }}
        />
      )}
    </>
  )
}

export { ProjectList }
