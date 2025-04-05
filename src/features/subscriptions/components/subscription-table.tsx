import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { type Subscription } from '@/db/schema'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  addMonths,
  addYears,
  differenceInMonths,
  differenceInYears,
  format,
  getDate,
  isAfter,
  isBefore,
  setDate,
  setMonth,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'

interface SubscriptionTableProps {
  data: Subscription[]
  onEdit: (subscription: Subscription) => void
  onDelete: (subscription: Subscription) => void
}

export function SubscriptionTable({ data, onEdit, onDelete }: SubscriptionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'price',
      desc: false,
    },
  ])

  const getNextRenewalDate = (subscription: Subscription): Date => {
    const today = startOfDay(new Date())

    if (subscription.frequency === 'monthly') {
      // Create this month's renewal date
      const thisMonthRenewal = setDate(startOfMonth(today), subscription.renewalDay)

      // If today is past this month's renewal, get next month's date
      return isAfter(today, thisMonthRenewal) ? addMonths(thisMonthRenewal, 1) : thisMonthRenewal
    } else {
      // Create this year's renewal date
      const thisYearRenewal = setDate(
        setMonth(startOfYear(today), (subscription.renewalMonth || 1) - 1),
        subscription.renewalDay
      )

      // If today is past this year's renewal, get next year's date
      return isAfter(today, thisYearRenewal) ? addYears(thisYearRenewal, 1) : thisYearRenewal
    }
  }

  const calculateTotalSpent = (subscription: Subscription): number => {
    const startDate = new Date(subscription.startDate)
    const today = startOfDay(new Date())
    const price = parseFloat(subscription.price)

    if (subscription.frequency === 'monthly') {
      const monthsDiff = differenceInMonths(today, startDate)

      // Check if we need to include current month based on renewal day
      const currentMonthShouldCount =
        getDate(today) >= subscription.renewalDay && getDate(startDate) <= subscription.renewalDay

      return price * (monthsDiff + (currentMonthShouldCount ? 1 : 0))
    } else {
      // For yearly subscriptions
      const renewalDate = new Date(today.getFullYear(), (subscription.renewalMonth || 1) - 1, subscription.renewalDay)

      // Get complete years between start and today
      const yearsDiff = differenceInYears(today, startDate)

      // Check if this year's renewal has happened
      const thisYearRenewalPassed = isAfter(today, renewalDate)

      // Adjust count based on start date's position relative to renewal date
      const startYearRenewalDate = new Date(
        startDate.getFullYear(),
        (subscription.renewalMonth || 1) - 1,
        subscription.renewalDay
      )
      const startYearAdjustment = isBefore(startDate, startYearRenewalDate) ? 0 : -1

      return price * (yearsDiff + (thisYearRenewalPassed ? 1 : 0) + startYearAdjustment)
    }
  }

  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => `${row.original.price} ${row.original.currency}`,
      sortingFn: (rowA, rowB) => {
        const priceA = parseFloat(rowA.original.price)
        const priceB = parseFloat(rowB.original.price)
        return priceA - priceB
      },
    },
    {
      id: 'nextRenewal',
      accessorFn: (row) => getNextRenewalDate(row).getTime(),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Next Renewal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => format(getNextRenewalDate(row.original), 'PPP'),
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Start Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.startDate), 'dd.MM.yyyy')
        } catch {
          return 'Invalid date'
        }
      },
    },
    {
      id: 'totalSpent',
      accessorFn: (row) => calculateTotalSpent(row),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Total Spent
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const total = calculateTotalSpent(row.original)
        return `${total} ${row.original.currency}`
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <div className="max-w-[200px] truncate">{row.original.description || '-'}</div>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            aria-label={`Edit ${row.original.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            aria-label={`Delete ${row.original.name}`}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No subscriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
