import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { LoaderCircleIcon, PlusIcon } from 'lucide-react'

import { useCreateTask } from '@/hooks/use-tasks'

const TaskForm = () => {
  const createTask = useCreateTask()

  const form = useForm({
    defaultValues: {
      text: '',
    },
    onSubmit: async ({ value }) => {
      createTask.mutate(
        { text: value.text },
        {
          onSuccess: () => {
            form.reset()
          },
        }
      )
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <form.Field
            name="text"
            validators={{
              onSubmit: ({ value }) => (!value ? 'Cannot be empty' : null),
            }}
          >
            {(field) => (
              <>
                <Input
                  placeholder="Add new task"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={!!field.state.meta.errors?.length}
                  className="bg-card"
                />
                {field.state.meta.errors.length > 0 ? (
                  <em role="alert" className="text-destructive text-sm">
                    {field.state.meta.errors.join(', ')}
                  </em>
                ) : null}
              </>
            )}
          </form.Field>
        </div>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button variant="secondary" size="icon" type="submit" disabled={!canSubmit}>
              {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon />}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

export { TaskForm }
