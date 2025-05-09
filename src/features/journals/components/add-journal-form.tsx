import { useRef, useState } from 'react'
import { TextareaAutosize } from '@/components/ui/textarea'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import { useCreateJournal } from '@/hooks/use-journals'

type AddJournalFormProps = {
  isDashboard?: boolean
}

export function AddJournalForm({ isDashboard = false }: AddJournalFormProps) {
  const createJournal = useCreateJournal()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm({
    defaultValues: {
      content: '',
    },
    onSubmit: async ({ value }) => {
      if (!value.content.trim()) return

      setIsSubmitting(true)
      try {
        await createJournal.mutateAsync({
          content: value.content,
        })
        form.reset()
        if (isDashboard) {
          toast.success(
            <p>
              Journal was added. Visit{' '}
              <Link to="/journal" className="underline">
                Journal
              </Link>{' '}
              to view it.
            </p>
          )
        }
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  useHotkeys(
    'mod+enter',
    () => {
      if (!isSubmitting && formRef.current?.contains(document.activeElement)) {
        formRef.current?.requestSubmit()
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: ['TEXTAREA'],
    }
  )

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field
        name="content"
        validators={{
          onSubmit: ({ value }) => (!value ? 'Journal cannot be empty' : null),
        }}
      >
        {(field) => (
          <>
            <TextareaAutosize
              ref={textareaRef}
              placeholder="What's on your mind today?"
              minRows={isDashboard ? 6 : 5}
              maxRows={isDashboard ? 6 : 30}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
            />
            {field.state.meta.errors.length > 0 ? (
              <em role="alert" className="text-destructive text-sm">
                {field.state.meta.errors.join(', ')}
              </em>
            ) : null}
          </>
        )}
      </form.Field>
    </form>
  )
}
