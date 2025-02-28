export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-white">everbase</h1>
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500"></div>
      </div>
    </div>
  )
}
