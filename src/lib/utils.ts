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
