import { useRouter } from '@tanstack/react-router'

/**
 * Hook to update document title and router meta when data changes
 * @param routeId The route ID to update meta for (e.g. '/_authenticated/projects/$projectId')
 * @param newTitle The new title to set
 * @param originalTitle The original title to compare against
 */
export function useDynamicTitle(routeId: string, newTitle: string | undefined, originalTitle: string | undefined) {
  const router = useRouter()

  // Only update if we have both titles and they're different
  if (newTitle && originalTitle && newTitle !== originalTitle) {
    // Update document title
    document.title = newTitle

    // Update router meta for breadcrumbs
    const routeMatch = router.state.matches.find((match) => match.routeId === routeId)

    if (routeMatch) {
      routeMatch.meta = [{ ...routeMatch.meta?.[0], title: newTitle }]

      // Force router state update to refresh components
      router.navigate({
        to: router.state.location.pathname,
        search: router.state.location.search,
        replace: true,
      })
    }

    return true
  }

  return false
}
