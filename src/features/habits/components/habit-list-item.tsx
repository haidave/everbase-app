import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/ui/text-input'
import { type Habit } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useUpdateHabit } from '@/hooks/use-habits'

import { HabitProgress } from './habit-progress'

type HabitListItemProps = {
  habit: Habit
  onDelete: (habit: Habit) => void
}

const HabitListItem = ({ habit, onDelete }: HabitListItemProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const updateHabit = useUpdateHabit()

  const form = useForm({
    defaultValues: {
      name: habit.name,
      description: habit.description || '',
    },
    onSubmit: async ({ value }) => {
      // Skip if name is unchanged
      if (value.name.trim() === habit.name && value.description === habit.description) {
        inputRef.current?.blur()
        return
      }

      // Handle empty input
      if (!value.name.trim()) {
        form.reset()
        inputRef.current?.blur()
        return
      }

      // Update habit
      updateHabit.mutate(
        {
          id: habit.id,
          name: value.name,
          description: value.description,
        },
        {
          onSuccess: () => inputRef.current?.blur(),
        }
      )
    },
  })

  return (
    <li className="bg-card rounded-md border">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <form.Field name="name">
          {(field) => (
            <TextInput
              ref={inputRef}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={() => {
                field.handleBlur()
                form.handleSubmit()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  form.handleSubmit()
                } else if (e.key === 'Escape') {
                  if (field.state.value.trim() === '') {
                    form.reset()
                  }
                  inputRef.current?.blur()
                }
              }}
              className="font-medium"
              aria-label={`Edit habit: ${habit.name}`}
            />
          )}
        </form.Field>
        <Button variant="ghost" size="icon" onClick={() => onDelete(habit)} aria-label={`Delete habit ${habit.name}`}>
          <XIcon />
        </Button>
      </div>

      <div className="px-4">
        <form.Field name="description">
          {(field) => (
            <TextInput
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={() => {
                field.handleBlur()
                form.handleSubmit()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  form.handleSubmit()
                } else if (e.key === 'Escape') {
                  if (field.state.value.trim() === '') {
                    form.reset()
                  }
                  inputRef.current?.blur()
                }
              }}
              placeholder="Add description..."
              className={cn('text-muted-foreground md:text-xs', !field.state.value && 'italic')}
              aria-label={`Edit description for habit: ${habit.name}`}
            />
          )}
        </form.Field>
      </div>

      <HabitProgress habit={habit} />
    </li>
  )
}

export { HabitListItem }
