import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TextareaAutosize } from '@/components/ui/textarea'
import { type Quote } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon, SaveIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import { useCreateQuote, useUpdateQuote } from '@/hooks/use-quotes'

type AddQuoteFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: Quote | null | undefined
}

export function AddQuoteForm({ open, onOpenChange, quote }: AddQuoteFormProps) {
  const createQuote = useCreateQuote()
  const updateQuote = useUpdateQuote()
  const isEditing = !!quote
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm({
    defaultValues: {
      quote: quote?.quote || '',
      author: quote?.author || '',
    },
    onSubmit: async ({ value }) => {
      if (isEditing && quote) {
        updateQuote.mutate(
          {
            id: quote.id,
            quote: value.quote,
            author: value.author,
          },
          {
            onSuccess: () => {
              form.reset()
              onOpenChange(false)
              toast.success(`Quote was updated.`)
            },
          }
        )
      } else {
        createQuote.mutate(
          {
            quote: value.quote,
            author: value.author,
          },
          {
            onSuccess: () => {
              form.reset()
              onOpenChange(false)
              toast.success(`Quote was added.`)
            },
          }
        )
      }
    },
  })

  useHotkeys(
    'mod+enter',
    () => {
      if (formRef.current?.contains(document.activeElement)) {
        formRef.current?.requestSubmit()
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    }
  )

  const isPending = isEditing ? updateQuote.isPending : createQuote.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Quote' : 'Add Quote'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit your quote details below.' : 'Add a new quote to your collection.'}
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <form.Field
              name="quote"
              validators={{
                onSubmit: ({ value }) => (!value ? 'Quote is required' : undefined),
              }}
            >
              {(field) => (
                <>
                  <Label htmlFor="quote">Quote</Label>
                  <TextareaAutosize
                    id="quote"
                    ref={textareaRef}
                    placeholder="Enter the quote"
                    minRows={5}
                    maxRows={30}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </>
              )}
            </form.Field>
          </div>

          <div className="grid gap-2">
            <form.Field
              name="author"
              validators={{
                onSubmit: ({ value }) => (!value ? 'Author is required' : undefined),
              }}
            >
              {(field) => (
                <>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    placeholder="Enter the author"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </>
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircleIcon className="animate-spin" /> : isEditing ? <SaveIcon /> : <PlusIcon />}
              {isEditing ? 'Save Changes' : 'Add Quote'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
