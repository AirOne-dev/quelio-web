import { computed, type Ref } from 'vue'
import type { ApiResponse } from '../types'
import { useTimeCalculations } from './useTimeCalculations'

export function useWeekDays(
  data: Ref<ApiResponse>,
  missingDates: Ref<string[]>,
  saveLocalStorage: (label: string, data: any) => void
) {
  const { getCurrentWeekDates, formatDataDate } = useTimeCalculations()

  const days = computed(() => {
    const daysObj: Record<string, string[]> = {}
    const today = new Date()
    const todayObj = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    if (data.value) {
      for (const date of getCurrentWeekDates()) {
        daysObj[date] = data.value.hours[date]
        const [day, month, year] = date.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day)
        if (dateObj < todayObj && !missingDates.value.map((md) => md.split(' [-] ')[0]).includes(date) && !data.value.hours[date]) {
          missingDates.value.push(date)
          saveLocalStorage('missing_dates', missingDates.value)
        }
      }
    }
    return daysObj
  })

  return {
    days
  }
}
