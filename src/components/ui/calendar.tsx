import * as React from 'react'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex justify-between w-full',
        head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center',
        row: 'flex w-full justify-between mt-1',
        cell: 'text-center text-sm p-0 relative h-9 w-9 [&:has([aria-selected])]:bg-transparent',
        day: cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-0 font-normal rounded-md aria-selected:opacity-100'),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-active text-foreground-primary hover:bg-hover hover:text-foreground-primary focus:bg-active focus:text-foreground-primary',
        day_today: 'text-destructive',
        day_outside: 'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }: { className?: string } & React.ComponentProps<typeof ChevronLeft>) => (
          <ChevronLeft className={cn('h-4 w-4', className)} {...props} />
        ),
        IconRight: ({ className, ...props }: { className?: string } & React.ComponentProps<typeof ChevronRight>) => (
          <ChevronRight className={cn('h-4 w-4', className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
