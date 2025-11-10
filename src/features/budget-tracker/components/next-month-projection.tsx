import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusIcon, XIcon } from 'lucide-react'

import { formatCzechNumber } from '@/lib/formatters'

interface NextMonthProjectionProps {
  currentBalance: number
}

export function NextMonthProjection({ currentBalance }: NextMonthProjectionProps) {
  const [additionalAmount, setAdditionalAmount] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!additionalAmount.trim() || isNaN(parseFloat(additionalAmount))) {
      return
    }

    setIsAdding(false)
  }

  const handleCancel = () => {
    setIsAdding(false)
  }

  const handleClear = () => {
    setAdditionalAmount('')
  }

  const projectedBalance =
    additionalAmount && !isNaN(parseFloat(additionalAmount))
      ? currentBalance + parseFloat(additionalAmount)
      : currentBalance

  const hasProjection = additionalAmount && !isNaN(parseFloat(additionalAmount))

  return (
    <div className="rounded-md border p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Next Month Projection</Label>
          {hasProjection && !isAdding && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClear} aria-label="Clear projection">
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="additionalAmount" className="text-sm">
                Additional Amount
              </Label>
              <Input
                id="additionalAmount"
                type="text"
                value={additionalAmount}
                onChange={(e) => setAdditionalAmount(e.target.value)}
                placeholder="60000"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Apply
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        ) : hasProjection ? (
          <div className="space-y-2">
            <div className="text-3xl font-bold">{formatCzechNumber(projectedBalance)} CZK</div>
            <div className="text-muted-foreground text-sm">
              Current: {formatCzechNumber(currentBalance)} CZK + {formatCzechNumber(additionalAmount)} CZK
            </div>
            <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full">
              Update Projection
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full">
            <PlusIcon className="h-4 w-4" />
            Add Projection
          </Button>
        )}
      </div>
    </div>
  )
}
