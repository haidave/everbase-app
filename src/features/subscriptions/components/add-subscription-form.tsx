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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type Subscription, type SubscriptionFrequency } from '@/db/schema'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { LoaderCircleIcon, PlusIcon, SaveIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useCreateSubscription, useUpdateSubscription } from '@/hooks/use-subscriptions'

// Helper function to get the day suffix (1st, 2nd, 3rd, etc.)
function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th'

  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

type AddSubscriptionFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription?: Subscription
}

export function AddSubscriptionForm({ open, onOpenChange, subscription }: AddSubscriptionFormProps) {
  const createSubscription = useCreateSubscription()
  const updateSubscription = useUpdateSubscription()
  const isEditing = !!subscription
  const formRef = useRef<HTMLFormElement>(null)

  const currentMonth = new Date().getMonth() + 1 // Get current month (1-12)

  const form = useForm({
    defaultValues: {
      name: subscription?.name || '',
      price: subscription?.price || '',
      currency: subscription?.currency || 'CZK',
      frequency: subscription?.frequency || 'monthly',
      renewalDay: subscription?.renewalDay || 1,
      renewalMonth: subscription?.renewalMonth || currentMonth, // Use current month as default
      startDate: subscription?.startDate ? new Date(subscription.startDate) : new Date(),
      description: subscription?.description || '',
    },
    onSubmit: async ({ value }) => {
      if (isEditing && subscription) {
        updateSubscription.mutate(
          {
            id: subscription.id,
            name: value.name,
            price: value.price,
            currency: value.currency,
            frequency: value.frequency as SubscriptionFrequency,
            renewalDay: parseInt(value.renewalDay.toString()),
            renewalMonth: value.frequency === 'yearly' ? parseInt(value.renewalMonth.toString()) : undefined,
            startDate: value.startDate,
            description: value.description,
          },
          {
            onSuccess: () => {
              form.reset()
              onOpenChange(false)
            },
          }
        )
      } else {
        createSubscription.mutate(
          {
            name: value.name,
            price: value.price,
            currency: value.currency,
            frequency: value.frequency as SubscriptionFrequency,
            renewalDay: parseInt(value.renewalDay.toString()),
            renewalMonth: value.frequency === 'yearly' ? parseInt(value.renewalMonth.toString()) : undefined,
            startDate: value.startDate,
            description: value.description,
            active: true,
          },
          {
            onSuccess: () => {
              form.reset()
              onOpenChange(false)
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
      enableOnFormTags: ['INPUT', 'TEXTAREA', 'SELECT'],
    }
  )

  const isPending = isEditing ? updateSubscription.isPending : createSubscription.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit your subscription details below.' : 'Track your recurring payments.'}
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
          <div className="grid gap-4">
            <form.Field
              name="name"
              validators={{
                onSubmit: ({ value }) => (!value ? 'Name is required' : undefined),
              }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Spotify"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="price"
                validators={{
                  onSubmit: ({ value }) => (!value ? 'Price is required' : undefined),
                }}
              >
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      placeholder="e.g., 45"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <form.Field name="currency">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CZK">CZK</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="frequency">
              {(field) => {
                // This function will update the renewalMonth when frequency changes
                const handleFrequencyChange = (value: string) => {
                  field.handleChange(value as SubscriptionFrequency)

                  // If changing to yearly, make sure renewalMonth is set to current month
                  if (value === 'yearly') {
                    const currentMonth = new Date().getMonth() + 1
                    form.setFieldValue('renewalMonth', currentMonth)
                  }
                }

                return (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={field.state.value} onValueChange={handleFrequencyChange}>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {field.state.value === 'monthly' ? (
                      <form.Field
                        name="renewalDay"
                        validators={{
                          onSubmit: ({ value }) => {
                            if (!value) return 'Renewal day is required'
                            const day = parseInt(value.toString())
                            if (isNaN(day) || day < 1 || day > 31) return 'Day must be between 1 and 31'
                            return undefined
                          },
                        }}
                      >
                        {(dayField) => (
                          <div className="grid gap-2">
                            <Label htmlFor="renewalDay">Renewal Day</Label>
                            <Select
                              value={dayField.state.value?.toString() || ''}
                              onValueChange={(value) => dayField.handleChange(parseInt(value))}
                            >
                              <SelectTrigger id="renewalDay">
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {day}
                                    {getDaySuffix(day)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {dayField.state.meta.errors.length > 0 ? (
                              <p className="text-destructive text-sm">{dayField.state.meta.errors.join(', ')}</p>
                            ) : null}
                          </div>
                        )}
                      </form.Field>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <form.Field
                          name="renewalMonth"
                          validators={{
                            onSubmit: ({ value }) => {
                              if (!value) return 'Month is required'
                              return undefined
                            },
                          }}
                        >
                          {(field) => (
                            <div className="grid gap-2">
                              <Label htmlFor="renewalMonth">Month</Label>
                              <Select
                                value={field.state.value?.toString() || ''}
                                onValueChange={(value) => field.handleChange(parseInt(value))}
                              >
                                <SelectTrigger id="renewalMonth">
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    { value: '1', label: 'January' },
                                    { value: '2', label: 'February' },
                                    { value: '3', label: 'March' },
                                    { value: '4', label: 'April' },
                                    { value: '5', label: 'May' },
                                    { value: '6', label: 'June' },
                                    { value: '7', label: 'July' },
                                    { value: '8', label: 'August' },
                                    { value: '9', label: 'September' },
                                    { value: '10', label: 'October' },
                                    { value: '11', label: 'November' },
                                    { value: '12', label: 'December' },
                                  ].map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                      {month.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {field.state.meta.errors.length > 0 ? (
                                <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
                              ) : null}
                            </div>
                          )}
                        </form.Field>

                        <form.Field
                          name="renewalDay"
                          validators={{
                            onSubmit: ({ value }) => {
                              if (!value) return 'Day is required'
                              const day = parseInt(value.toString())
                              if (isNaN(day) || day < 1 || day > 31) return 'Day must be between 1 and 31'
                              return undefined
                            },
                          }}
                        >
                          {(field) => (
                            <div className="grid gap-2">
                              <Label htmlFor="renewalDay">Day</Label>
                              <Select
                                value={field.state.value?.toString() || ''}
                                onValueChange={(value) => field.handleChange(parseInt(value))}
                              >
                                <SelectTrigger id="renewalDay">
                                  <SelectValue placeholder="Day" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <SelectItem key={day} value={day.toString()}>
                                      {day}
                                      {getDaySuffix(day)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {field.state.meta.errors.length > 0 ? (
                                <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
                              ) : null}
                            </div>
                          )}
                        </form.Field>
                      </div>
                    )}
                  </>
                )
              }}
            </form.Field>

            <form.Field name="startDate">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={format(field.state.value, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date()
                      field.handleChange(date)
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add some details about this subscription..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircleIcon className="animate-spin" /> : isEditing ? <SaveIcon /> : <PlusIcon />}
              {isEditing ? 'Save Changes' : 'Add Subscription'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
