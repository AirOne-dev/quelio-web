import { ref, computed, type Ref } from 'vue'
import type { ApiResponse, Credentials } from '../types'
import { getWeek } from '../utils/api'
import { getISOWeekKey } from '../utils/weekHelpers'

/**
 * Composable for managing week selection and navigation
 */
export function useWeekSelection(
  data: Ref<ApiResponse>,
  credentials: Ref<Credentials>,
  onDataUpdate: (newData: ApiResponse) => void
) {
  // Get current week info
  const currentWeekKey = getISOWeekKey()
  const [currentYear, , currentWeek] = currentWeekKey.split('-')

  // Selected week state (start with current week)
  const selectedYear = ref(parseInt(currentYear))
  const selectedWeek = ref(parseInt(currentWeek))
  const isLoadingWeek = ref(false)

  // Computed week key for selected week
  const selectedWeekKey = computed(() => {
    return `${selectedYear.value}-w-${String(selectedWeek.value).padStart(2, '0')}`
  })

  // Check if current week is selected
  const isCurrentWeekSelected = computed(() => {
    return selectedWeekKey.value === currentWeekKey
  })

  /**
   * Select a specific week and fetch data if needed
   */
  const selectWeek = async (year: number, week: number) => {
    selectedYear.value = year
    selectedWeek.value = week

    const weekKey = `${year}-w-${String(week).padStart(2, '0')}`

    // Check if week data already exists
    if (data.value.weeks && data.value.weeks[weekKey]) {
      return // Data already available
    }

    // Fetch week data from API
    try {
      isLoadingWeek.value = true
      const weekData = await getWeek(year, week, credentials.value)

      // Merge new data with existing data
      const updatedData: ApiResponse = {
        ...data.value,
        weeks: {
          ...data.value.weeks,
          ...weekData.weeks
        }
      }

      onDataUpdate(updatedData)
    } catch (error) {
      console.error('Failed to fetch week data:', error)
      throw error
    } finally {
      isLoadingWeek.value = false
    }
  }

  /**
   * Go back to current week
   */
  const goToCurrentWeek = () => {
    selectedYear.value = parseInt(currentYear)
    selectedWeek.value = parseInt(currentWeek)
  }

  /**
   * Navigate to previous week
   */
  const goToPreviousWeek = async () => {
    let year = selectedYear.value
    let week = selectedWeek.value - 1

    // Handle year transition
    if (week < 1) {
      year--
      // Get last week of previous year (usually 52 or 53)
      const lastWeekKey = getISOWeekKey(new Date(year, 11, 28))
      const [, , lastWeek] = lastWeekKey.split('-')
      week = parseInt(lastWeek)
    }

    await selectWeek(year, week)
  }

  /**
   * Navigate to next week (only if not current week)
   */
  const goToNextWeek = async () => {
    // Don't allow going beyond current week
    if (isCurrentWeekSelected.value) {
      return
    }

    let year = selectedYear.value
    let week = selectedWeek.value + 1

    // Get max week of current year
    const lastWeekKey = getISOWeekKey(new Date(year, 11, 28))
    const [, , maxWeek] = lastWeekKey.split('-')

    // Handle year transition
    if (week > parseInt(maxWeek)) {
      year++
      week = 1
    }

    // Don't go beyond current week
    const targetKey = `${year}-w-${String(week).padStart(2, '0')}`
    if (targetKey > currentWeekKey) {
      return
    }

    await selectWeek(year, week)
  }

  return {
    selectedYear,
    selectedWeek,
    selectedWeekKey,
    isCurrentWeekSelected,
    isLoadingWeek,
    selectWeek,
    goToCurrentWeek,
    goToPreviousWeek,
    goToNextWeek
  }
}
