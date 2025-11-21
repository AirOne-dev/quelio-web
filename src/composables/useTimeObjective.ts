import { ref, computed, type Ref } from 'vue'
import { useTimeCalculations } from './useTimeCalculations'

export function useTimeObjective(
  data: Ref<{ total_paid: string }>,
  missingDates: Ref<string[]>,
  _daysLeft: Ref<string[] | null>,
  saveLocalStorage: (label: string, data: any) => void,
  loadLocalStorage: (label: string) => any
) {
  const { timeToMinutes, getCurrentWeekDates } = useTimeCalculations()

  const minutesObjective = ref<number>(38 * 60)
  const nbDays = ref<number>(5)

  const remainingMinutes = computed(() => {
    return minutesObjective.value - timeToMinutes(data.value.total_paid) - nbMissingInCurrentWeek.value * minutesObjective.value / nbDays.value
  })

  const nbMissingInCurrentWeek = computed(() => {
    const fullMissingDates = missingDates.value.filter((md) => md.split(' [-] ').length === 1).filter(date => getCurrentWeekDates().includes(date.split(' [-] ')[0]))?.length ?? 0
    const halfMissingDates = (missingDates.value.filter((md) => md.split(' [-] ').length === 2).filter(date => getCurrentWeekDates().includes(date.split(' [-] ')[0]))?.length ?? 0) / 2
    return fullMissingDates + halfMissingDates
  })

  const changeHourObjective = (value: number) => {
    minutesObjective.value = value
    saveLocalStorage('hour_objective', minutesObjective.value)
  }

  const loadObjective = () => {
    minutesObjective.value = Number(loadLocalStorage('hour_objective')) || 38 * 60
  }

  return {
    minutesObjective,
    nbDays,
    remainingMinutes,
    nbMissingInCurrentWeek,
    changeHourObjective,
    loadObjective
  }
}
