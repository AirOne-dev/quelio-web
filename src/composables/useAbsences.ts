import { ref } from 'vue'
import type { CustomBornesForSuggestions } from '../types'
import { useTimeCalculations } from './useTimeCalculations'

export function useAbsences(
  saveLocalStorage: (label: string, data: any) => void,
  loadLocalStorage: (label: string) => any
) {
  const { getCurrentWeekDates } = useTimeCalculations()

  const missingDates = ref<string[]>([])

  const markAbsent = (date: string, section: 'day' | 'morning' | 'afternoon' = 'day') => {
    let missing = loadLocalStorage('missing_dates') ?? []
    missing = missing.filter((_: string) => {
      const [day, month, year] = date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      return dateObj > new Date()
    })
    missing.push(section === 'day' ? date : `${date} [-] ${section}`)
    saveLocalStorage('missing_dates', missing)
    missingDates.value = missing
  }

  const removeAbsent = (date: string) => {
    let missing = loadLocalStorage('missing_dates') ?? []
    missing = missing.filter((d: string) => d.split(' [-] ')[0] !== date)
    saveLocalStorage('missing_dates', missing)
    missingDates.value = missing
  }

  const loadMissingDates = () => {
    missingDates.value = loadLocalStorage('missing_dates') ?? []
  }

  const isDayCardTransparent = (times: string[] | undefined, date: string) => {
    const { isPastDateOrWeekend } = useTimeCalculations()
    return !times && isPastDateOrWeekend(date) || missingDates.value.map((md) => md.split(' [-] ')[0]).includes(date)
  }

  const isDayCardHalfTransparent = (times: string[] | undefined, date: string) => {
    return missingDates.value.filter((md) => md.split(' [-] ').length === 2).map((md) => md.split(' [-] ')[0]).includes(date)
  }

  return {
    missingDates,
    markAbsent,
    removeAbsent,
    loadMissingDates,
    isDayCardTransparent,
    isDayCardHalfTransparent
  }
}
