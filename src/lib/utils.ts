import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    console.error('Failed to copy to clipboard')
  }
}

export const moveCaretToEnd = <T extends HTMLInputElement | HTMLTextAreaElement>(e: React.FocusEvent<T>) => {
  const tempValue = e.target.value
  e.target.value = ''
  e.target.value = tempValue
}

/**
 * Creates a date range for a specific day in UTC
 * Returns an object with start (00:00:00) and end (23:59:59.999) times
 */
export function getUTCDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999))

  return { start, end }
}
