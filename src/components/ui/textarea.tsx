import * as React from 'react'
import TextareaAutosizeComponent from 'react-textarea-autosize'

import { cn } from '@/lib/utils'

const textareaStyles =
  'border-input resize-none custom-scrollbar text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return <textarea className={cn(textareaStyles, className)} ref={ref} {...props} />
  }
)
Textarea.displayName = 'Textarea'

const TextareaAutosize = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof TextareaAutosizeComponent>>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosizeComponent data-slot="textarea" className={cn(textareaStyles, className)} ref={ref} {...props} />
    )
  }
)
TextareaAutosize.displayName = 'TextareaAutosize'

export { Textarea, TextareaAutosize }
