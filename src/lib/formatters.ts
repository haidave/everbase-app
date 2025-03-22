/**
 * Converts an object with snake_case keys to an object with camelCase keys
 */
export function snakeToCamelCase<T>(obj: Record<string, unknown>): T {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj as T
  }

  const result: Record<string, unknown> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = obj[key]
    }
  }

  return result as T
}

/**
 * Transforms an array of objects with snake_case keys to objects with camelCase keys
 */
export function transformArraySnakeToCamel<T>(array: Record<string, unknown>[] | null): T[] {
  if (!array) return []
  return array.map((item) => snakeToCamelCase<T>(item))
}

/**
 * Formats a date as YYYY-MM-DD string
 * Useful for consistent date comparison across the application
 */
export function formatDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
