import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with window check to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Check if window exists (for SSR compatibility)
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Use the matches property directly
    const onChange = () => {
      setIsMobile(mql.matches)
    }

    // Add event listener
    mql.addEventListener('change', onChange)

    // Set initial value
    setIsMobile(mql.matches)

    // Cleanup
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
