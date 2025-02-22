import { createFileRoute } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-6xl font-bold">everdash</h1>
        <p className={cn('text-xl', 'text-balance text-zinc-400')}>to organize my messy life</p>
        <div className="size-16 animate-pulse rounded-full bg-zinc-600" />
      </div>
    </main>
  )
}
