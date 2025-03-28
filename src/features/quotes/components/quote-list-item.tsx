import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { type Quote } from '@/db/schema'
import { Pencil, Trash2 } from 'lucide-react'

type QuoteListItemProps = {
  quote: Quote
  onDelete: (quote: Quote) => void
  onEdit: (quote: Quote) => void
}

export function QuoteListItem({ quote, onDelete, onEdit }: QuoteListItemProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <blockquote className="space-y-2">
          <p>&quot;{quote.quote}&quot;</p>
          <footer className="text-muted-foreground text-sm">— {quote.author}</footer>
        </blockquote>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(quote)}>
          <Pencil />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(quote)}>
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  )
}
