import { computed, type Ref } from 'vue'
import { useTimeCalculations } from './useTimeCalculations'

export function useDaysLeft(
  days: Ref<Record<string, string[]>>,
  missingDates: Ref<string[]>,
  remainingMinutes: Ref<number>
) {
  const { timeToMinutes, getDayTotal, formatDataDate, isPastDateOrWeekend } = useTimeCalculations()

  const daysLeft = computed(() => {
    const today = formatDataDate(new Date())
    const todayMinutes = timeToMinutes(getDayTotal(days.value[today]))

    const daysLeftArr = Object.keys(days.value)?.filter((date) => !isPastDateOrWeekend(date) && !missingDates.value.map((md) => md.split(' [-] ')[0]).includes(date))
    if (!daysLeftArr) {
      return null
    }
    const followingDays = daysLeftArr.filter(date => date !== today)
    if (followingDays.length === 0 && todayMinutes < remainingMinutes.value) {
      return daysLeftArr
    }

    if (todayMinutes >= remainingMinutes.value / followingDays.length) {
      return followingDays
    }
    return daysLeftArr
  })

  return {
    daysLeft
  }
}
