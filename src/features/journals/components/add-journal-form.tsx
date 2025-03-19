import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, SaveIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useCreateJournal } from '@/hooks/use-journals'

export function AddJournalForm() {
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
            <Textarea
              ref={textareaRef}
              placeholder="What's on your mind today?"
              className="min-h-32 resize-none"
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
          Save
        </Button>
      </div>
    </form>
  )
}
