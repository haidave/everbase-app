import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { type MonthlyChecklist } from '@/db/schema'

import { cn } from '@/lib/utils'
import { useCompleteMonthlyChecklist, useUncompleteMonthlyChecklist } from '@/hooks/use-monthly-checklist'

type MonthlyChecklistItemProps = {
  monthlyChecklist: MonthlyChecklist
  isCompleted: boolean
}

const MonthlyChecklistItem = ({ monthlyChecklist, isCompleted }: MonthlyChecklistItemProps) => {
  const completeMonthlyChecklist = useCompleteMonthlyChecklist()
  const uncompleteMonthlyChecklist = useUncompleteMonthlyChecklist()
  const [checked, setChecked] = useState(isCompleted)

  const handleCheckChange = (checked: boolean) => {
    setChecked(checked)
    if (checked) {
      completeMonthlyChecklist.mutate(monthlyChecklist.id)
    } else {
      uncompleteMonthlyChecklist.mutate(monthlyChecklist.id)
    }
  }

  return (
    <li className="flex items-center gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={handleCheckChange}
        aria-label={`Mark ${monthlyChecklist.name} as ${checked ? 'incomplete' : 'complete'}`}
      />
      <div>
        <p className={cn('text-sm', checked && 'line-through')}>{monthlyChecklist.name}</p>
        {monthlyChecklist.description && (
          <p className="text-muted-foreground text-sm">{monthlyChecklist.description}</p>
        )}
      </div>
    </li>
  )
}

export { MonthlyChecklistItem }
