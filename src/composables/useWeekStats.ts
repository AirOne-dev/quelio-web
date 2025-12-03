import { computed, type Ref } from 'vue'
import { useTimeCalculations } from './useTimeCalculations'
import type { ApiResponse, DayData } from '../types'

export function useWeekStats(
  data: Ref<ApiResponse>,
  missingDates: Ref<string[]>,
  minutesObjective: Ref<number>
) {
  const { timeToMinutes, getCurrentWeekDates } = useTimeCalculations()

  // Convertir HH:MM en minutes
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return (hours * 60) + minutes
  }

  // Calculer le total des minutes pour un jour
  const getDayTotalMinutes = (times: string[]): number => {
    let total = 0
    for (let i = 0; i < times.length; i += 2) {
      const duration = Math.max(timeToMinutes('08:30'), Math.min(timeToMinutes(times[i + 1] ?? (new Date()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })), timeToMinutes('18:30')))
        - Math.max(timeToMinutes('08:30'), Math.min(timeToMinutes(times[i]), timeToMinutes('18:30')))
      total += duration
    }
    return total
  }

  // Obtenir le nom du jour
  const getDayName = (date: string): string => {
    const [day, month, year] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return dayNames[dateObj.getDay()]
  }

  // Jours de la semaine avec détection des absences
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
        }
      }
    }
    return daysObj
  })

  // Données structurées des jours
  const daysData = computed<DayData[]>(() => {
    return Object.entries(days.value).map(([date, times]) => {
      const isAbsent = missingDates.value.some(md => md.split(' [-] ')[0] === date)
      return {
        date,
        dayName: getDayName(date),
        totalMinutes: times ? getDayTotalMinutes(times) : 0,
        present: !isAbsent,
        timeBlocks: times || [],
        minutesObjective: minutesObjective.value
      }
    })
  })

  // Nombre de jours travaillés
  const workedDays = computed(() => {
    return daysData.value.filter(day => day.present && day.timeBlocks.length > 0).length
  })

  // Moyenne journalière (jours passés uniquement)
  const dailyAverage = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const pastDays = daysData.value.filter(day => {
      if (!day.present || day.timeBlocks.length === 0) return false

      const [d, m, y] = day.date.split('-').map(Number)
      const dayDate = new Date(y, m - 1, d)
      dayDate.setHours(0, 0, 0, 0)

      return dayDate < today
    })

    if (pastDays.length === 0) {
      return convertTimeToMinutes(data.value.total_effective)
    }

    const pastDaysTotal = pastDays.reduce((sum, day) => sum + day.totalMinutes, 0)
    return Math.round(pastDaysTotal / pastDays.length)
  })

  // Jour le plus productif
  const mostProductiveDay = computed(() => {
    const presentDays = daysData.value.filter(day => day.present)
    if (presentDays.length === 0) return null

    return presentDays.reduce((max, day) =>
      day.totalMinutes > max.totalMinutes ? day : max
    )
  })

  // Progression vers l'objectif (basé sur total_paid)
  const progressPercentage = computed(() => {
    const objective = minutesObjective.value || 2100
    if (objective === 0) return 0
    const totalPaidMinutes = convertTimeToMinutes(data.value.total_paid)
    return Math.min(100, Math.round((totalPaidMinutes / objective) * 100))
  })

  // Emoji de statut
  const statusEmoji = computed(() => {
    if (progressPercentage.value >= 100) return '🎉'
    if (progressPercentage.value >= 80) return '🔥'
    if (progressPercentage.value >= 60) return '💪'
    if (progressPercentage.value >= 40) return '⚡'
    return '🚀'
  })

  return {
    days,
    daysData,
    workedDays,
    dailyAverage,
    mostProductiveDay,
    progressPercentage,
    statusEmoji,
  }
}
