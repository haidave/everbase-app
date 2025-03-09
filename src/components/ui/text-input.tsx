import * as React from 'react'

import { cn } from '@/lib/utils'

const TextInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'bg-background text-foreground placeholder:text-muted-foreground flex w-full py-2 text-base transition-colors',
          'hover:border-input border-b border-transparent',
          'focus-visible:border-primary focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
TextInput.displayName = 'TextInput'

export { TextInput }
