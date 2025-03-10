import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type Project, type ProjectStatus } from '@/db/schema'
import { Pencil, PlusIcon } from 'lucide-react'

import { useProjects } from '@/hooks/use-projects'

import { ProjectEditForm } from './project-edit-form'
import { ProjectForm } from './project-form'

const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects()
  const [editingProject, setEditingProject] = useState<Project | null>(null)
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
          <Card key={project.id} className="min-h-40">
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
        <Card className="grid min-h-40 place-items-center py-6">
          <Button variant="ghost" onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2" />
            Add Project
          </Button>
        </Card>
      </div>

      {/* Project Edit Sheet */}
      {editingProject && (
        <ProjectEditForm
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => {
            if (!open) setEditingProject(null)
          }}
        />
      )}

      {/* Project Add Dialog */}
      <ProjectForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}

export { ProjectList }
