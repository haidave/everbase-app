import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { type Quote } from '@/db/schema'
import { PlusIcon, QuoteIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useDeleteQuote, useQuotes } from '@/hooks/use-quotes'

import { AddQuoteForm } from './add-quote-form'
import { QuoteListItem } from './quote-list-item'

export function QuoteList() {
  const { data: quotes, isLoading } = useQuotes()
  const deleteQuote = useDeleteQuote()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)

  if (isLoading) return <div className="p-4">Loading quotes...</div>

  const handleDeleteQuote = (quote: Quote) => {
    setQuoteToDelete(quote)
  }

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote)
    setIsAddDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      setEditingQuote(null)
    }
  }

  const confirmDelete = () => {
    if (quoteToDelete) {
      deleteQuote.mutate(quoteToDelete.id)
      setQuoteToDelete(null)
      toast.success(`Quote by ${quoteToDelete.author} was deleted.`)
    }
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon />
        Add Quote
      </Button>

      {quotes && quotes.length > 0 ? (
        <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {quotes.map((quote) => (
            <div key={quote.id} className="mb-4 break-inside-avoid">
              <QuoteListItem quote={quote} onDelete={handleDeleteQuote} onEdit={handleEditQuote} />
            </div>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-4 p-8">
          <QuoteIcon className="text-muted-foreground size-12" />
          <p className="text-center">No quotes added yet.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon />
            Add Quote
          </Button>
        </Card>
      )}

      <AddQuoteForm open={isAddDialogOpen} onOpenChange={handleDialogClose} quote={editingQuote} />

      <ConfirmationDialog
        open={!!quoteToDelete}
        onOpenChange={(open) => !open && setQuoteToDelete(null)}
        title="Are you sure?"
        description={`This will permanently delete this quote by ${quoteToDelete?.author}.`}
        onConfirm={confirmDelete}
        isLoading={deleteQuote.isPending}
      />
    </div>
  )
}
