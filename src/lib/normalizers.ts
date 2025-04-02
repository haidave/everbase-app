/**
 * Normalizes a date to 00:00:00 UTC for the given calendar day
 * This ensures consistent date storage regardless of user timezone
 */
export function normalizeToUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}
