import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    console.error('Failed to copy to clipboard')
  }
}

export { cn, copyToClipboard }
