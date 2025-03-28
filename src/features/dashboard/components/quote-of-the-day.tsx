import { Card } from '@/components/ui/card'
import { QuoteIcon } from 'lucide-react'

import { useQuoteOfTheDay } from '@/hooks/use-quotes'

export function QuoteOfTheDay() {
  const { data: quote, isLoading } = useQuoteOfTheDay()

  if (isLoading) return null

  if (!quote) {
    return (
      <Card className="flex flex-col items-center gap-4 p-8">
        <QuoteIcon className="text-muted-foreground size-12" />
        <p className="text-center">Add some quotes to see your quote of the day.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-foreground-primary text-sm">Quote of the Day</h2>
      <blockquote className="space-y-2">
        <p className="text-sm">&quot;{quote.quote}&quot;</p>
        <footer className="text-muted-foreground text-xs">— {quote.author}</footer>
      </blockquote>
    </div>
  )
}
