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
import { format } from 'date-fns'
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

  // Function to calculate next renewal date
  const getNextRenewalDate = (subscription: Subscription): Date => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (subscription.frequency === 'monthly') {
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const thisMonthRenewal = new Date(currentYear, currentMonth, subscription.renewalDay)

      if (today > thisMonthRenewal) {
        return new Date(currentYear, currentMonth + 1, subscription.renewalDay)
      }
      return thisMonthRenewal
    } else {
      const renewalMonth = subscription.renewalMonth || 1
      const renewalDay = subscription.renewalDay
      const currentYear = today.getFullYear()
      const thisYearRenewal = new Date(currentYear, renewalMonth - 1, renewalDay)

      if (today > thisYearRenewal) {
        return new Date(currentYear + 1, renewalMonth - 1, renewalDay)
      }
      return thisYearRenewal
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
