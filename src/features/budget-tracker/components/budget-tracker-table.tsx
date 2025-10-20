import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { type BudgetItem, type BudgetSubItem } from '@/db/schema'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react'

import { formatCzechNumber } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { useBudgetSubItems } from '@/hooks/use-budget'

interface BudgetTrackerTableProps {
  data: BudgetItem[]
  balance: number
  onEditItem: (item: BudgetItem) => void
  onDeleteItem: (item: BudgetItem) => void
  onAddSubItem: (itemId: string) => void
  onEditSubItem: (itemId: string, subItem: BudgetSubItem) => void
  onDeleteSubItem: (itemId: string, subItem: BudgetSubItem) => void
  onTogglePaid: (id: string, paid: boolean, isSubItem?: boolean, budgetItemId?: string) => void
}

export function BudgetTrackerTable({
  data,
  balance,
  onEditItem,
  onDeleteItem,
  onAddSubItem,
  onEditSubItem,
  onDeleteSubItem,
  onTogglePaid,
}: BudgetTrackerTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  // Calculate if an item is affordable
  const isAffordable = (amount: string, amountPaid: string) => {
    const remaining = parseFloat(amount) - parseFloat(amountPaid)
    return balance >= remaining
  }

  // Sort items: unpaid items by effective amount (highest first), then paid items at the bottom
  // The effective amount is pre-computed in the API and includes sub-items
  const sortedData = [...data].sort((a, b) => {
    // First, separate paid from unpaid
    if (a.paid !== b.paid) {
      return a.paid ? 1 : -1 // Unpaid first, paid last
    }

    // Within same paid status, sort by effective amount (highest to lowest)
    const aWithEffect = a as BudgetItem & { _effectiveAmount?: number }
    const bWithEffect = b as BudgetItem & { _effectiveAmount?: number }
    const amountA = aWithEffect._effectiveAmount || parseFloat(a.amount)
    const amountB = bWithEffect._effectiveAmount || parseFloat(b.amount)
    return amountB - amountA // Descending order
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead className="w-[80px]">Paid</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No budget items yet.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => <BudgetItemRow key={item.id} item={item} />)
          )}
        </TableBody>
      </Table>
    </div>
  )

  function BudgetItemRow({ item }: { item: BudgetItem }) {
    // Use pre-loaded sub-items if available (from API), otherwise fetch them
    const itemWithSubItems = item as BudgetItem & { subItems?: BudgetSubItem[] }
    const preLoadedSubItems = itemWithSubItems.subItems
    const { data: fetchedSubItems = [] } = useBudgetSubItems(item.id)
    const subItems = preLoadedSubItems || fetchedSubItems
    const hasSubItems = subItems.length > 0
    const isExpanded = expandedItems.has(item.id)

    // Calculate sum of sub-items amounts
    const subItemsTotal = subItems.reduce((sum: number, subItem: BudgetSubItem) => sum + parseFloat(subItem.amount), 0)
    const subItemsPaidTotal = subItems.reduce(
      (sum: number, subItem: BudgetSubItem) => sum + parseFloat(subItem.amountPaid),
      0
    )

    // Calculate effective amounts by ADDING item's own amount to sub-items total
    // Example: Kitchen 300k + Elektrina 50k = 350k displayed
    const itemOwnAmount = parseFloat(item.amount)
    const itemOwnAmountPaid = parseFloat(item.amountPaid)

    const effectiveAmount = (itemOwnAmount + subItemsTotal).toString()
    const effectiveAmountPaid = (itemOwnAmountPaid + subItemsPaidTotal).toString()

    // Check affordability based on effective amounts
    const affordable = isAffordable(effectiveAmount, effectiveAmountPaid)

    // Sort sub-items: unpaid first, then paid at the bottom
    const sortedSubItems = [...subItems].sort((a, b) => {
      if (a.paid === b.paid) return 0
      return a.paid ? 1 : -1
    })

    return (
      <>
        <TableRow className={cn({ 'opacity-50': item.paid })}>
          <TableCell>
            {hasSubItems && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleExpanded(item.id)}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </TableCell>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {formatCzechNumber(effectiveAmount)} CZK
              {!affordable && !item.paid && <TriangleAlert className="text-destructive size-3 flex-shrink-0" />}
            </div>
          </TableCell>
          <TableCell>{formatCzechNumber(effectiveAmountPaid)} CZK</TableCell>
          <TableCell>
            <Checkbox
              checked={item.paid}
              onCheckedChange={(checked) => onTogglePaid(item.id, checked as boolean)}
              disabled={hasSubItems}
            />
          </TableCell>
          <TableCell>
            <div className="max-w-[200px] truncate">{item.note || '-'}</div>
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onAddSubItem(item.id)}
                aria-label="Add sub-item"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEditItem(item)}
                aria-label={`Edit ${item.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-8 w-8"
                onClick={() => onDeleteItem(item)}
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>

        {/* Sub-items */}
        {isExpanded &&
          sortedSubItems.map((subItem) => {
            const subItemAffordable = isAffordable(subItem.amount, subItem.amountPaid)
            return (
              <TableRow key={subItem.id} className={cn('bg-muted/30', { 'opacity-50': subItem.paid })}>
                <TableCell></TableCell>
                <TableCell className="pl-8">
                  <span className="text-muted-foreground">↳</span> {subItem.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {formatCzechNumber(subItem.amount)} CZK
                    {!subItemAffordable && !subItem.paid && (
                      <TriangleAlert className="text-destructive size-3 flex-shrink-0" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatCzechNumber(subItem.amountPaid)} CZK</TableCell>
                <TableCell>
                  <Checkbox
                    checked={subItem.paid}
                    onCheckedChange={(checked) => onTogglePaid(subItem.id, checked as boolean, true, item.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate">{subItem.note || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditSubItem(item.id, subItem)}
                      aria-label={`Edit ${subItem.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => onDeleteSubItem(item.id, subItem)}
                      aria-label={`Delete ${subItem.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
      </>
    )
  }
}
