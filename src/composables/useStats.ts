import { computed, type Ref } from 'vue'
import { useTimeCalculations } from './useTimeCalculations'

export interface DayData {
  date: string
  dayName: string
  totalMinutes: number
  present: boolean
  timeBlocks: string[]
  minutesObjective?: number
}

export function useStats(
  days: Ref<Record<string, string[]>>,
  missingDates: Ref<string[]>,
  minutesObjective: Ref<number>,
  totalEffective: Ref<string>,
  totalPaid: Ref<string>
) {
  const { timeToMinutes } = useTimeCalculations()

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

  // Obtenir le nom du jour à partir de la date
  const getDayName = (date: string): string => {
    const [day, month, year] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return days[dateObj.getDay()]
  }

  // Conversion des données en format structuré
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

  // Moyenne journalière des heures travaillées (basée sur total_effective)
  const dailyAverage = computed(() => {
    const presentDays = daysData.value.filter(day => day.present && day.timeBlocks.length > 0)
    if (presentDays.length === 0) return 0

    const totalEffectiveMinutes = convertTimeToMinutes(totalEffective.value)
    return Math.round(totalEffectiveMinutes / presentDays.length)
  })

  // Jour le plus productif (en minutes)
  const mostProductiveDay = computed(() => {
    const presentDays = daysData.value.filter(day => day.present)
    if (presentDays.length === 0) return null

    return presentDays.reduce((max, day) =>
      day.totalMinutes > max.totalMinutes ? day : max
    )
  })

  // Nombre de jours travaillés cette semaine
  const workedDays = computed(() => {
    return daysData.value.filter(day => day.present && day.timeBlocks.length > 0).length
  })

  // Total des heures de la semaine
  const totalWeekMinutes = computed(() => {
    return daysData.value.reduce((sum, day) => sum + day.totalMinutes, 0)
  })

  // Pourcentage de progression vers l'objectif (basé sur total_paid)
  const progressPercentage = computed(() => {
    const objective = minutesObjective.value || 2100 // 35h par défaut
    if (objective === 0) return 0
    const totalPaidMinutes = convertTimeToMinutes(totalPaid.value)
    return Math.min(100, Math.round((totalPaidMinutes / objective) * 100))
  })

  // Temps restant pour atteindre l'objectif (basé sur total_paid)
  const remainingMinutes = computed(() => {
    const objective = minutesObjective.value || 2100
    const totalPaidMinutes = convertTimeToMinutes(totalPaid.value)
    return Math.max(0, objective - totalPaidMinutes)
  })

  // Prédiction : est-ce qu'on va atteindre l'objectif ?
  const willReachObjective = computed(() => {
    const objective = minutesObjective.value || 2100
    const daysLeft = 7 - workedDays.value
    const totalPaidMinutes = convertTimeToMinutes(totalPaid.value)
    if (daysLeft === 0) return totalPaidMinutes >= objective

    // Prédiction basée sur la moyenne journalière
    const predictedTotal = totalPaidMinutes + (dailyAverage.value * daysLeft)
    return predictedTotal >= objective
  })

  // Conseil du jour basé sur les stats
  const dailyTip = computed(() => {
    const objective = minutesObjective.value || 2100
    const dailyObjective = Math.round(objective / 5) // 5 jours ouvrés

    if (progressPercentage.value >= 100) {
      return "Objectif atteint ! 🎉 Tu peux te détendre."
    }

    if (willReachObjective.value) {
      return "Tu es sur la bonne voie ! Continue comme ça."
    }

    const daysLeft = Math.max(1, 7 - workedDays.value)
    const neededPerDay = Math.round(remainingMinutes.value / daysLeft)
    const neededHours = Math.floor(neededPerDay / 60)
    const neededMins = neededPerDay % 60

    if (neededPerDay > dailyObjective * 1.5) {
      return `Il faudrait ${neededHours}h${neededMins.toString().padStart(2, '0')} par jour. Courage !`
    }

    return `Plus que ${neededHours}h${neededMins.toString().padStart(2, '0')} par jour en moyenne.`
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
    daysData,
    dailyAverage,
    mostProductiveDay,
    workedDays,
    totalWeekMinutes,
    progressPercentage,
    remainingMinutes,
    willReachObjective,
    dailyTip,
    statusEmoji
  }
}
