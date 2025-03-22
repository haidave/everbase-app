import { useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { TextareaAutosize } from '@/components/ui/textarea'
import { type Journal } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'

import { useDeleteJournal, useUpdateJournal } from '@/hooks/use-journals'

type JournalItemProps = {
  journal: Journal
}

export function JournalItem({ journal }: JournalItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const updateJournal = useUpdateJournal()
  const deleteJournal = useDeleteJournal()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm({
    defaultValues: {
      content: journal.content,
    },
    onSubmit: async ({ value }) => {
      // Skip if content is unchanged
      if (value.content.trim() === journal.content) return

      // Handle empty input
      if (!value.content.trim()) {
        form.reset()
        return
      }

      updateJournal.mutate({
        id: journal.id,
        content: value.content,
      })
    },
  })

  const formattedTime = format(new Date(journal.createdAt), 'HH:mm')

  return (
    <Card>
      <form>
        <CardContent className="p-4">
          <form.Field name="content">
            {(field) => (
              <TextareaAutosize
                ref={textareaRef}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={() => {
                  field.handleBlur()
                  form.handleSubmit()
                }}
                className="border-transparent"
                maxRows={30}
              />
            )}
          </form.Field>
        </CardContent>

        <CardFooter className="flex justify-between p-4 pt-0">
          <div className="text-muted-foreground text-sm">{formattedTime}</div>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 />
            Delete
          </Button>
        </CardFooter>
      </form>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteJournal.mutate(journal.id)}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
