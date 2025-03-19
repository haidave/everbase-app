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
import { Textarea } from '@/components/ui/textarea'
import { type Journal } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { LoaderCircleIcon, Pencil, Save, Trash2, X } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { moveCaretToEnd } from '@/lib/utils'
import { useDeleteJournal, useUpdateJournal } from '@/hooks/use-journals'

type JournalItemProps = {
  journal: Journal
}

export function JournalItem({ journal }: JournalItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const updateJournal = useUpdateJournal()
  const deleteJournal = useDeleteJournal()
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm({
    defaultValues: {
      content: journal.content,
    },
    onSubmit: async ({ value }) => {
      // Skip if content is unchanged
      if (value.content.trim() === journal.content) {
        setIsEditing(false)
        return
      }

      // Handle empty input
      if (!value.content.trim()) {
        form.reset()
        setIsEditing(false)
        return
      }

      updateJournal.mutate(
        {
          id: journal.id,
          content: value.content,
        },
        {
          onSuccess: () => {
            setIsEditing(false)
          },
        }
      )
    },
  })

  // Use hotkeys for Command+Enter to save when editing
  useHotkeys(
    'mod+enter',
    () => {
      if (isEditing && !updateJournal.isPending && formRef.current?.contains(document.activeElement)) {
        formRef.current?.requestSubmit()
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: ['TEXTAREA'],
      enabled: isEditing,
    }
  )

  const handleDelete = () => {
    deleteJournal.mutate(journal.id)
    setIsDeleteDialogOpen(false)
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  const formattedTime = format(new Date(journal.createdAt), 'HH:mm')

  return (
    <Card>
      {isEditing ? (
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <CardContent className="p-4">
            <form.Field name="content">
              {(field) => (
                <Textarea
                  ref={textareaRef}
                  className="min-h-24 resize-none"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={updateJournal.isPending}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  onFocus={moveCaretToEnd}
                  onBlur={() => {
                    // If content is unchanged, exit edit mode
                    if (field.state.value.trim() === journal.content) {
                      setIsEditing(false)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      handleCancel()
                    }
                  }}
                />
              )}
            </form.Field>
          </CardContent>
          <CardFooter className="flex justify-between p-4 pt-0">
            <div className="text-muted-foreground text-sm">{formattedTime}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCancel} disabled={updateJournal.isPending}>
                <X />
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  value: state.values.content,
                  isPending: updateJournal.isPending,
                })}
              >
                {({ value, isPending }) => {
                  const hasChanges = value.trim() !== journal.content
                  return (
                    <Button type="submit" disabled={!hasChanges || isPending}>
                      {isPending ? <LoaderCircleIcon className="animate-spin" /> : <Save />}
                      Save
                    </Button>
                  )
                }}
              </form.Subscribe>
            </div>
          </CardFooter>
        </form>
      ) : (
        <>
          <CardContent className="p-4 whitespace-pre-wrap">{journal.content}</CardContent>
          <CardFooter className="flex justify-between p-4 pt-0">
            <div className="text-muted-foreground text-sm">{formattedTime}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(true)}>
                <Pencil />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 />
                Delete
              </Button>
            </div>
          </CardFooter>
        </>
      )}

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
            <AlertDialogAction onClick={handleDelete}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
