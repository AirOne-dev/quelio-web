<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DayCard from './DayCard.vue'
import SettingsModal from './SettingsModal.vue'
import PresenceModal from './PresenceModal.vue'
import { useTimeCalculations } from '../composables/useTimeCalculations'
import type { ApiResponse, Credentials, LogEntry, CustomBornesForSuggestions } from '../types'

// Props
interface Props {
  data: ApiResponse
  offline: boolean
  credentials: Credentials
  debugMode: boolean
  logs: LogEntry[]
}

// Emits
interface Emits {
  (e: 'logout'): void
  (e: 'refresh'): void
  (e: 'update:debug-mode', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composable
const {
  timeToMinutes,
  minutesToTime,
  getDayTotal,
  formatDataDate,
  getCurrentWeekDates,
  isPastDateOrWeekend,
  withDefaultMaxBornes,
  withDefaultMinBornes,
  suggestStartHour,
  hasAlreadyLunchBreak,
  getBornesTime,
} = useTimeCalculations()

// State
const missingDates = ref<string[]>([])
const customBornesForSuggestions = ref<CustomBornesForSuggestions>({})
const selectedSuggestedBlock = ref<string | null>(null)
const minutesObjective = ref<number>(38 * 60)
const nbDays = ref<number>(5)
const presenceDate = ref<string | null>(null)
const showSettingsModal = ref(false)
const showPresenceModal = ref(false)

// Computed Properties
const days = computed(() => {
  const daysObj: Record<string, string[]> = {}
  const today = new Date()
  const todayObj = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  if (props.data) {
    for (const date of getCurrentWeekDates()) {
      daysObj[date] = props.data.hours[date]
      const [day, month, year] = date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      if (dateObj < todayObj && !missingDates.value.map((md) => md.split(' [-] ')[0]).includes(date) && !props.data.hours[date]) {
        missingDates.value.push(date)
        saveLocalStorage('missing_dates', missingDates.value)
      }
    }
  }
  return daysObj
})

const remainingMinutes = computed(() => {
  return minutesObjective.value - timeToMinutes(props.data.total_paid) - nbMissingInCurrentWeek.value * minutesObjective.value / nbDays.value
})

const nbMissingInCurrentWeek = computed(() => {
  const fullMissingDates = missingDates.value.filter((md) => md.split(' [-] ').length === 1).filter(date => getCurrentWeekDates().includes(date.split(' [-] ')[0]))?.length ?? 0
  const halfMissingDates = (missingDates.value.filter((md) => md.split(' [-] ').length === 2).filter(date => getCurrentWeekDates().includes(date.split(' [-] ')[0]))?.length ?? 0) / 2
  return fullMissingDates + halfMissingDates
})

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

const maxTimeLeft = computed((): Record<string, number> => {
  if (!daysLeft.value) {
    return {}
  }
  const now = new Date()
  const hourNow = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const today = formatDataDate(now)

  const result = daysLeft.value.reduce((acc, date) => {
    const customBornes = withDefaultMaxBornes(customBornesForSuggestions.value[date])
    if (date === today && days.value[date]) {
      const hours = [...days.value[date]]
      if (hours.length % 2) {
        hours.push(hourNow)
      }
      const startHourAfterNow = suggestStartHour(date, hours, customBornesForSuggestions.value)
      hours.push(startHourAfterNow)
      if (timeToMinutes(startHourAfterNow) < timeToMinutes(customBornes.endMorning)) {
        hours.push(...[customBornes.endMorning, customBornes.startAfternoon])
      }
      hours.push(minutesToTime(Math.min(timeToMinutes(startHourAfterNow) + remainingMinutes.value, timeToMinutes(customBornes.endAfternoon))))
      return { ...acc, [date]: timeToMinutes(getDayTotal(hours)) }
    }
    return { ...acc, [date]: timeToMinutes(getDayTotal(Object.values(customBornes))) }
  }, {} as Record<string, number>)
  return result
})

const minTimeLeft = computed((): Record<string, number> => {
  if (!daysLeft.value) {
    return {}
  }
  const now = new Date()
  const hourNow = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const today = formatDataDate(now)

  const result = daysLeft.value.reduce((acc, date) => {
    const customBornes = withDefaultMinBornes(customBornesForSuggestions.value[date])
    if (date === today && days.value[date]) {
      const hours = [...days.value[date]]
      if (hours.length % 2) {
        hours.push(hourNow)
      }
      const startHourAfterNow = suggestStartHour(date, hours, customBornesForSuggestions.value)
      hours.push(startHourAfterNow)
      if (timeToMinutes(startHourAfterNow) < timeToMinutes(customBornes.endMorning)) {
        hours.push(...[customBornes.endMorning, customBornes.startAfternoon])
      }
      hours.push(minutesToTime(Math.min(timeToMinutes(startHourAfterNow) + remainingMinutes.value, timeToMinutes(customBornes.startAfternoon))))
      return { ...acc, [date]: timeToMinutes(getDayTotal(hours)) }
    }
    return { ...acc, [date]: timeToMinutes(getDayTotal(Object.values(customBornes))) }
  }, {} as Record<string, number>)
  return result
})

const suggestedTimeBlocks = computed((): Record<string, Array<{ start: string; end: string; duration: string }>> => {
  const lunchBreakDuration = 60

  const now = new Date()
  const today = formatDataDate(now)
  const timeNow = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const minutesNow = timeToMinutes(timeNow)
  const todayHours = days.value[today]
  const todayMinutes = timeToMinutes(getDayTotal(todayHours))

  if (!daysLeft.value) {
    return {}
  }

  const timeLeftByDayWithoutToday = remainingMinutes.value / (daysLeft.value.filter(date => date !== today).length || 1)
  let timeLeftByDay = (remainingMinutes.value + (todayMinutes >= timeLeftByDayWithoutToday ? 0 : todayMinutes)) / daysLeft.value.length

  const timeLeftwithCustomBornes = getTimeLeftwithCustomBornesConstraints(timeLeftByDay)

  const result = Object.keys(days.value).reduce((acc, date) => {
    if (!daysLeft.value?.includes(date)) {
      return { ...acc, [date]: [] }
    }
    const maxEndLunch = timeToMinutes(customBornesForSuggestions.value[date]?.startAfternoon ?? '14:00')
    const minStartDay = timeToMinutes(customBornesForSuggestions.value[date]?.startMorning ?? '08:30')
    const maxStartDay = timeToMinutes(customBornesForSuggestions.value[date]?.startMorning ?? '09:00')
    const maxEndDay = timeToMinutes(customBornesForSuggestions.value[date]?.endAfternoon ?? '18:30')
    const minEndDay = timeToMinutes(customBornesForSuggestions.value[date]?.endAfternoon ?? '16:30')
    const minStartLunch = timeToMinutes(customBornesForSuggestions.value[date]?.endMorning ?? '12:00')
    let minEndLunch = Math.max(minStartLunch + lunchBreakDuration, timeToMinutes(customBornesForSuggestions.value[date]?.startAfternoon ?? '13:00'))
    const hours = days.value[date] ?? []
    const totalMinutes = timeToMinutes(getDayTotal(hours))

    const timeLeft = date === today ? timeLeftwithCustomBornes[date] - totalMinutes : timeLeftwithCustomBornes[date]
    const betweenLunchBreak = minStartLunch < minutesNow && minutesNow < maxEndLunch
    const withLunchTime = date !== today || !hasAlreadyLunchBreak(hours) && betweenLunchBreak
    let start = date === today ? (hours.length % 2 ? timeToMinutes(hours[hours.length - 1]) : withLunchTime ? Math.max(timeToMinutes(hours[hours.length - 1]) + lunchBreakDuration, minutesNow) : minutesNow) : minStartDay
    let end = Math.min(start + timeLeft + (withLunchTime ? lunchBreakDuration : 0), maxEndDay)
    const differenceWithMinEnd = end - minEndDay
    if (differenceWithMinEnd < 0) {
      end = minEndDay
      if (date !== today || !hours.length) {
        start = Math.min(start - differenceWithMinEnd, maxStartDay)
        minEndLunch = Math.min(minEndLunch + Math.max(-differenceWithMinEnd - (maxStartDay - minStartDay), 0), maxEndLunch)
      } else if (start < maxEndLunch && start > minStartLunch) {
        const endLunch = Math.max(Math.min(minEndLunch + differenceWithMinEnd, maxEndLunch), start)
        if (withLunchTime && hours.length % 2 === 0) {
          minEndLunch = endLunch
        } else {
          start = endLunch
        }
      }
    }
    const suggestHours = (start < minStartLunch ? [start, minStartLunch, minEndLunch, end] : [start, end]).map(minutesToTime)
    const blocks = []
    for (let i = 0; i < suggestHours.length; i += 2) {
      if (suggestHours[i]) {
        const endTime = suggestHours[i + 1] ?? (new Date()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        blocks.push({
          start: suggestHours[i],
          end: endTime,
          duration: ''
        })
      }
    }
    return { ...acc, [date]: blocks }
  }, {} as Record<string, Array<{ start: string; end: string; duration: string }>>)
  return result
})

// Methods
const saveLocalStorage = (label: string, data: any) => {
  localStorage.setItem(`quelio_${label}_${props.credentials.username}`, JSON.stringify(data))
}

const loadLocalStorage = (label: string) => {
  const data = localStorage.getItem(`quelio_${label}_${props.credentials.username}`)
  return data ? JSON.parse(data) : null
}

const isDayCardTransparent = (_times: string[] | undefined, date: string) => {
  return !_times && isPastDateOrWeekend(date) || missingDates.value.map((md) => md.split(' [-] ')[0]).includes(date)
}

const isDayCardHalfTransparent = (_times: string[] | undefined, date: string) => {
  return missingDates.value.filter((md) => md.split(' [-] ').length === 2).map((md) => md.split(' [-] ')[0]).includes(date)
}

const startResizeSuggestion = (event: MouseEvent, date: string, idx: number, handle: 'start' | 'end') => {
  const block = suggestedTimeBlocks.value[date][idx]
  const initBlockHandle = block[handle]
  const startX = event.clientX
  const timeLineSize = (event.target as HTMLElement).closest('.timeline-container')?.clientWidth ?? 0
  const timeLineDuration = timeToMinutes('19:00') - timeToMinutes('08:00')
  const { typeHandler, minPosition, maxPosition } = getBornesTime(date, timeToMinutes(initBlockHandle), days.value, formatDataDate)

  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX
    const diffMinutes = (dx / timeLineSize) * timeLineDuration
    block[handle] = minutesToTime(Math.min(Math.max(minPosition, timeToMinutes(initBlockHandle) + diffMinutes), maxPosition))
    if (typeHandler) {
      saveNewSuggestionBorne(date, block[handle], typeHandler)
    }
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

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
  togglePresenceModal()
}

const removeAbsent = (date: string) => {
  let missing = loadLocalStorage('missing_dates') ?? []
  missing = missing.filter((d: string) => d.split(' [-] ')[0] !== date)
  saveLocalStorage('missing_dates', missing)
  missingDates.value = missing
}

const saveNewSuggestionBorne = (date: string, time: string, section: 'startMorning' | 'endMorning' | 'startAfternoon' | 'endAfternoon') => {
  customBornesForSuggestions.value = {
    ...customBornesForSuggestions.value,
    [date]: customBornesForSuggestions.value[date] ? { ...customBornesForSuggestions.value[date], [section]: time } : { [section]: time }
  }
  saveLocalStorage('custom_bornes_for_suggestions', customBornesForSuggestions.value)
}

const getCustomBorneForSuggestions = () => {
  const customBornes = loadLocalStorage('custom_bornes_for_suggestions') ?? {}
  for (const [date] of Object.entries(customBornes)) {
    if (!getCurrentWeekDates().includes(date)) {
      delete customBornes[date]
    }
  }
  customBornesForSuggestions.value = customBornes
  saveLocalStorage('custom_bornes_for_suggestions', customBornes)
}

const getTimeLeftwithCustomBornesConstraints = (timeLeft: number): Record<string, number> => {
  let totalOverTime = 0
  let totalLowerTime = 0
  let timeLeftByDay: Record<string, number> = daysLeft.value?.reduce((acc, date) => ({
    ...acc,
    [date]: timeLeft
  }), {} as Record<string, number>) ?? {}
  let overTimeDays: string[] = []
  let lowerTimeDays: string[] = []
  let index = 0
  do {
    timeLeftByDay = daysLeft.value?.reduce((acc, date) => ({
      ...acc,
      [date]: overTimeDays.includes(date) ? maxTimeLeft.value[date] : lowerTimeDays.includes(date) ? minTimeLeft.value[date] : timeLeftByDay[date] + totalOverTime - totalLowerTime / (daysLeft.value!.length - overTimeDays.length)
    }), {} as Record<string, number>) ?? {}
    totalOverTime = 0
    totalLowerTime = 0
    overTimeDays = daysLeft.value?.reduce((acc, date) => {
      if (timeLeftByDay[date] > maxTimeLeft.value[date]) {
        totalOverTime += timeLeftByDay[date] - maxTimeLeft.value[date]
        return [...acc, date]
      }
      if (timeLeftByDay[date] < minTimeLeft.value[date]) {
        totalLowerTime += minTimeLeft.value[date] - timeLeftByDay[date]
        return [...acc, date]
      }
      return acc
    }, [] as string[]) ?? []
    index++
  } while ((totalOverTime > 0 || totalLowerTime > 0) && index < 10 && daysLeft.value!.length !== overTimeDays.length)
  return daysLeft.value?.reduce((acc, date) => ({
    ...acc,
    [date]: Math.min(Math.max(timeLeftByDay[date], minTimeLeft.value[date]), maxTimeLeft.value[date])
  }), {} as Record<string, number>) ?? {}
}

const showMore = (event: MouseEvent) => {
  const parent = (event.target as HTMLElement).closest('.day-card')
  const content = parent?.querySelector('.time-blocks') as HTMLElement

  if (content && parent) {
    if (content.style.height === '0px') {
      const caretIcon = parent.querySelector('.caret-icon') as HTMLElement
      if (caretIcon) caretIcon.style.transform = 'rotate(180deg)'
      content.style.height = content.scrollHeight + 'px'
    } else {
      const caretIcon = parent.querySelector('.caret-icon') as HTMLElement
      if (caretIcon) caretIcon.style.transform = 'rotate(0deg)'
      content.style.height = '0px'
    }
  }
}

const toggleBottomModal = () => {
  showSettingsModal.value = !showSettingsModal.value
  const modal = document.getElementById('bottom-modal')
  if (modal) {
    modal.classList.toggle('pointer-events-none')
    modal.style.backgroundColor = modal.style.backgroundColor === 'rgba(0, 0, 0, 0.5)' ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.5)'
    modal.style.margin = modal.style.margin === '0' ? '' : '0'
    const modalContent = modal.querySelector('.modal-content') as HTMLElement
    if (modalContent) {
      modalContent.style.transform = modalContent.style.transform === 'translateY(0%)' ? 'translateY(100%)' : 'translateY(0%)'
    }
  }
}

const togglePresenceModal = () => {
  showPresenceModal.value = !showPresenceModal.value
  const modal = document.getElementById('presence-modal')
  if (modal) {
    modal.classList.toggle('pointer-events-none')
    modal.style.backgroundColor = modal.style.backgroundColor === 'rgba(0, 0, 0, 0.5)' ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.5)'
    modal.style.margin = modal.style.margin === '0' ? '' : '0'
    const modalContent = modal.querySelector('.modal-content') as HTMLElement
    if (modalContent) {
      modalContent.style.transform = modalContent.style.transform === 'translateY(0%)' ? 'translateY(100%)' : 'translateY(0%)'
    }
  }
}

const changeHourObjective = (value: number) => {
  minutesObjective.value = value
  saveLocalStorage('hour_objective', minutesObjective.value)
}

const changeDebugMode = (value: boolean) => {
  emit('update:debug-mode', value)
}

const handleMarkAbsent = (date: string) => {
  presenceDate.value = date
  togglePresenceModal()
}

const waitForElement = (selector: string, callback: (element: HTMLElement) => void) => {
  const interval = setInterval(() => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      clearInterval(interval)
      callback(element)
    }
  }, 100)
}

// Lifecycle hooks
onMounted(() => {
  getCustomBorneForSuggestions()
  missingDates.value = loadLocalStorage('missing_dates') ?? []
  minutesObjective.value = Number(loadLocalStorage('hour_objective')) || 38 * 60

  document.addEventListener('click', (event) => {
    if (selectedSuggestedBlock.value && !(event.target as HTMLElement).closest('.suggestedBlock')) {
      selectedSuggestedBlock.value = null
    }
  })

  waitForElement('#daysContainerRef', (e) => {
    e.addEventListener('scroll', (ev) => {
      const statsRef = document.getElementById('statsRef')
      if (statsRef) {
        statsRef.style.setProperty('margin-bottom', `${-1 * ((ev.target as HTMLElement).scrollTop)}px`)
      }
    })
  })
})
</script>

<template>
  <!-- Offline banner -->
  <div v-if="offline" class="fixed top-0 inset-x-0 z-50">
    <div class="bg-amber-500/20 backdrop-blur border-b border-amber-500/40 text-amber-200 text-sm">
      <div class="max-w-md mx-auto px-4 py-2 flex items-center gap-2">
        <!-- Warning icon -->
        <svg class="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
          <path fill="currentColor" d="M256 32c-17.7 0-33.9 9.5-42.7 24.9L9.4 438.6C.3 454.4 0 473 8.7 489.1S33.2 512 51.4 512H460.6c18.2 0 34.8-9.9 42.7-25.9s7.5-35.1-1.6-50.9L298.7 56.9C289.9 41.5 273.7 32 256 32zM280 392c0 13.3-10.7 24-24 24s-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24zm-8-200l-8 136c-.6 10.5-9.3 18.7-19.8 18.1s-18.7-9.3-18.1-19.8l8-136c.6-10.5 9.3-18.7 19.8-18.1s18.7 9.3 18.1 19.8z"/>
        </svg>
        <span>
          Impossible de récupérer les informations de <strong>Kelio</strong>.
          Les données affichées sont celles sauvegardées lors de la dernière ouverture de l'app.
        </span>
      </div>
    </div>
  </div>

  <div class="space-y-8 overflow-hidden flex flex-col items-center" :class="offline ? 'pt-24' : ''" style="max-height: 100dwh;">
    <!-- Header Stats -->
    <div id="statsContainerRef" class="overflow-hidden rounded-2xl w-full" style="min-height: 84px;">
      <div class="px-6">
        <div id="statsRef" class="stats-card glass p-6 space-y-6 rounded-2xl max-w-md w-full mx-auto">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold tracking-tight flex justify-center">
              <span>Ma semaine</span>
              <div class="w-6 h-6 p-1 ml-2 cursor-pointer" style="margin-top: 5px;" @click="emit('refresh')">
                <!-- Refresh icon -->
                <svg title="Actualiser vos horaires"
                  class="text-indigo-300 w-full h-full" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512">
                  <path fill="currentColor"
                    d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" />
                </svg>
              </div>
            </h1>
            <div @click="toggleBottomModal" class="w-6 h-6 p-1 cursor-pointer">
              <!-- Gear icon -->
              <svg title="Réglages" class="text-indigo-300 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512">
                <path fill="currentColor"
                  d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
              </svg>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col items-center">
              <div class="text-indigo-300 text-sm mb-1">Total effectif</div>
              <div class="text-2xl font-bold">{{ data.total_effective }}</div>
            </div>
            <div class="flex flex-col items-center">
              <div class="text-indigo-300 text-sm mb-1">Temps restant</div>
              <div class="text-2xl font-bold"
                :class="remainingMinutes > 0 ? 'text-red-300' : 'text-green-300'">
                {{ minutesToTime(remainingMinutes) }}
              </div>
            </div>
            <div class="flex flex-col items-center">
              <div class="text-indigo-300 text-sm mb-1">Total payé</div>
              <div class="text-2xl font-bold">{{ data.total_paid }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Days -->
    <div id="daysContainerRef" class="space-y-6 pb-40 h-full overflow-y-auto hide-scrollbar w-full" style="max-height: calc(100dvh - 234px)">
      <DayCard
        v-for="(times, date, index) in days"
        :key="date"
        :date="date"
        :times="times"
        :index="index"
        :missing-dates="missingDates"
        :suggested-time-blocks="suggestedTimeBlocks[date]"
        :selected-suggested-block="selectedSuggestedBlock"
        :is-day-card-half-transparent="isDayCardHalfTransparent(times, date)"
        :is-day-card-transparent="isDayCardTransparent(times, date)"
        @show-more="showMore"
        @mark-absent="handleMarkAbsent"
        @remove-absent="removeAbsent"
        @update:selected-suggested-block="selectedSuggestedBlock = $event"
        @start-resize-suggestion="startResizeSuggestion"
      />
    </div>

    <!-- [DEBUG MODE] Console log viewer -->
    <div v-if="debugMode" id="debugDiv"
      class="overflow-y-auto h-1/4 bg-gray-800 text-gray-200 font-mono text-sm p-2 fixed bottom-0 left-0 right-0 day-card glass rounded-2xl">
      <div v-for="(log, index) in logs" :key="index" :class="{
        'text-green-500': log.type === 'log',
        'text-yellow-500': log.type === 'warn',
        'text-red-500': log.type === 'error'
      }">[{{ log.type.toUpperCase() }}] {{ log.message }}</div>
    </div>

    <!-- Settings modal -->
    <SettingsModal
      v-if="showSettingsModal"
      :minutes-objective="minutesObjective"
      :debug-mode="debugMode"
      @close="toggleBottomModal"
      @logout="emit('logout')"
      @update:minutes-objective="changeHourObjective"
      @update:debug-mode="changeDebugMode"
    />

    <!-- Mark absent modal -->
    <PresenceModal
      v-if="showPresenceModal"
      :presence-date="presenceDate"
      @close="togglePresenceModal"
      @mark-absent="markAbsent"
    />
  </div>
</template>
