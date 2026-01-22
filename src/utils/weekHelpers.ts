import type { ApiResponse, WeekData } from '../types'

/**
 * Get ISO week number in format YYYY-w-WW
 * @param date Date object (defaults to now)
 * @returns ISO week string like "2026-w-03"
 */
export function getISOWeekKey(date: Date = new Date()): string {
  // ISO week requires Thursday to be in the week
  const target = new Date(date.valueOf())
  const dayNumber = (date.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNumber + 3)

  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const weekNumber = Math.ceil(((target.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7) + 1

  // Year for ISO week (can differ from calendar year)
  const isoYear = target.getFullYear()

  return `${isoYear}-w-${String(weekNumber).padStart(2, '0')}`
}

/**
 * Get current week data from API response
 * @param data API response with weekly structure
 * @returns Current week data or null if not found
 */
export function getCurrentWeekData(data: ApiResponse | null): WeekData | null {
  if (!data || !data.weeks) return null

  const currentWeekKey = getISOWeekKey()
  return data.weeks[currentWeekKey] || null
}

/**
 * Get current week hours in flat format (for backward compatibility)
 * @param data API response with weekly structure
 * @returns Record of date -> hours array
 */
export function getCurrentWeekHours(data: ApiResponse | null): Record<string, string[]> {
  const weekData = getCurrentWeekData(data)
  if (!weekData) return {}

  const hours: Record<string, string[]> = {}
  for (const [date, dayDetails] of Object.entries(weekData.days)) {
    hours[date] = dayDetails.hours
  }

  return hours
}

/**
 * Get current week total effective time
 * @param data API response with weekly structure
 * @returns Total effective time in HH:MM format or "00:00"
 */
export function getCurrentWeekTotalEffective(data: ApiResponse | null): string {
  const weekData = getCurrentWeekData(data)
  return weekData?.total_effective || '00:00'
}

/**
 * Get current week total paid time
 * @param data API response with weekly structure
 * @returns Total paid time in HH:MM format or "00:00"
 */
export function getCurrentWeekTotalPaid(data: ApiResponse | null): string {
  const weekData = getCurrentWeekData(data)
  return weekData?.total_paid || '00:00'
}

/**
 * Get all weeks data sorted by week key (most recent first)
 * @param data API response with weekly structure
 * @returns Array of [weekKey, weekData] sorted by week (descending)
 */
export function getAllWeeksSorted(data: ApiResponse | null): Array<[string, WeekData]> {
  if (!data || !data.weeks) return []

  return Object.entries(data.weeks).sort((a, b) => b[0].localeCompare(a[0]))
}
