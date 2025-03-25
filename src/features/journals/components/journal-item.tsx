import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { TextareaAutosize } from '@/components/ui/textarea'
import { type Journal } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { XIcon } from 'lucide-react'

import { useDeleteJournal, useUpdateJournal } from '@/hooks/use-journals'

type JournalItemProps = {
  journal: Journal
}

export function JournalItem({ journal }: JournalItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const updateJournal = useUpdateJournal()
  const deleteJournal = useDeleteJournal()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleDelete = () => {
    deleteJournal.mutate(journal.id)
    setIsDeleteDialogOpen(false)
  }

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
      <CardHeader className="flex-row items-center justify-between px-5 pt-3 pb-0">
        <CardDescription className="text-xs">{formattedTime}</CardDescription>
        <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
          <XIcon />
        </Button>
      </CardHeader>
      <CardContent className="p-2">
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
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (field.state.value.trim() === '') {
                    form.reset()
                  }
                  textareaRef.current?.blur()
                }
              }}
              className="border-transparent"
              maxRows={30}
            />
          )}
        </form.Field>
      </CardContent>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Are you sure?"
        description="This will permanently delete this journal."
        onConfirm={handleDelete}
        isLoading={deleteJournal.isPending}
      />
    </Card>
  )
}
