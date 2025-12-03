<script setup lang="ts">
import { toRef, onMounted, computed } from "vue";
import DayCard from "./DayCard.vue";
import WeekStats from "./WeekStats.vue";
import OfflineBanner from "./OfflineBanner.vue";
import DebugConsole from "./DebugConsole.vue";
import SettingsDrawer from "./drawer/SettingsDrawer.vue";
import AbsenceDrawer from "./drawer/AbsenceDrawer.vue";
import WeekInsights from "./widgets/WeekInsights.vue";
import WeekObjective from "./widgets/WeekObjective.vue";
import WeekTopDay from "./widgets/WeekTopDay.vue";
import { useLocalStorage } from "../composables/useLocalStorage";
import { useAbsences } from "../composables/useAbsences";
import { useWeekDays } from "../composables/useWeekDays";
import { useTimeObjective } from "../composables/useTimeObjective";
import { useTimeCalculations } from "../composables/useTimeCalculations";
import { useDaysLeft } from "../composables/useDaysLeft";
import { useSuggestions } from "../composables/useSuggestions";
import { useDrawers } from "../composables/useDrawers";
import type { ApiResponse, Credentials, LogEntry, DayData } from "../types";

const props = defineProps<{
    data: ApiResponse;
    offline: boolean;
    credentials: Credentials;
    debugMode: boolean;
    logs: LogEntry[];
  }>(),
  emit = defineEmits<{
    (e: "logout"): void;
    (e: "refresh"): void;
  }>();

const dataRef = toRef(() => props.data),
  { saveLocalStorage, loadLocalStorage } = useLocalStorage(props.credentials.username),
  {
    missingDates,
    markAbsent,
    removeAbsent,
    loadMissingDates,
    isDayCardTransparent,
    isDayCardHalfTransparent,
  } = useAbsences(saveLocalStorage, loadLocalStorage),
  { days } = useWeekDays(dataRef, missingDates, saveLocalStorage),
  {
    minutesObjective,
    remainingMinutes,
    changeHourObjective,
    loadObjective,
  } = useTimeObjective(
    dataRef,
    missingDates,
    toRef(() => null),
    saveLocalStorage,
    loadLocalStorage
  ),
  { daysLeft } = useDaysLeft(days, missingDates, remainingMinutes),
  {
    selectedSuggestedBlock,
    suggestedTimeBlocks,
    getCustomBorneForSuggestions,
    startResizeSuggestion,
  } = useSuggestions(
    days,
    daysLeft,
    remainingMinutes,
    saveLocalStorage,
    loadLocalStorage
  ),
  {
    showSettingsDrawer,
    showAbsenceDrawer,
    presenceDate,
    toggleSettingsDrawer,
    toggleAbsenceDrawer,
    handleMarkAbsent,
  } = useDrawers(),
  { timeToMinutes } = useTimeCalculations();

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
    return convertTimeToMinutes(props.data.total_effective)
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
  const totalPaidMinutes = convertTimeToMinutes(props.data.total_paid)
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

const showMore = (event: MouseEvent) => {
    const parent = (event.target as HTMLElement).closest(".day-card");
    const content = parent?.querySelector(".time-blocks") as HTMLElement;

    if (content && parent) {
      if (content.style.height === "0px") {
        const caretIcon = parent.querySelector(".caret-icon") as HTMLElement;
        if (caretIcon) caretIcon.style.transform = "rotate(180deg)";
        content.style.height = content.scrollHeight + "px";
      } else {
        const caretIcon = parent.querySelector(".caret-icon") as HTMLElement;
        if (caretIcon) caretIcon.style.transform = "rotate(0deg)";
        content.style.height = "0px";
      }
    }
  },
  handleMarkAbsentAndClose = (
    date: string,
    section: "day" | "morning" | "afternoon" = "day"
  ) => {
    markAbsent(date, section);
    toggleAbsenceDrawer();
  };

// Lifecycle hooks
onMounted(() => {
  getCustomBorneForSuggestions();
  loadMissingDates();

  // Load objective from API preferences if available, otherwise from localStorage
  if (props.data.preferences?.minutes_objective) {
    changeHourObjective(props.data.preferences.minutes_objective);
  } else {
    loadObjective();
  }

  document.addEventListener("click", (event) => {
    if (
      selectedSuggestedBlock.value &&
      !(event.target as HTMLElement).closest(".suggestedBlock")
    ) {
      selectedSuggestedBlock.value = null;
    }
  });
});
</script>

<template>
  <!-- Offline banner -->

  <div class="min-h-screen">
    <!-- Header Stats -->
    <WeekStats
      :total-effective="data.total_effective"
      :total-paid="data.total_paid"
      :remaining-minutes="remainingMinutes"
      @refresh="emit('refresh')"
      @open-settings="toggleSettingsDrawer"
    />

    <!-- Résumé Section -->
    <div class="pt-47 pb-8">
      <div class="px-6 mb-4 max-w-md mx-auto">
        <h2 class="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          Résumé
        </h2>
      </div>
      <div class="px-6">
        <div class="grid grid-cols-3 gap-2 max-w-md mx-auto">
          <WeekInsights
            :daily-average="dailyAverage"
            :worked-days="workedDays"
            :most-productive-day="mostProductiveDay"
          />
          <WeekObjective
            :progress-percentage="progressPercentage"
            :status-emoji="statusEmoji"
            :worked-days="workedDays"
          />
          <WeekTopDay
            :most-productive-day="mostProductiveDay"
          />
        </div>
      </div>
    </div>

    <!-- Jours Section -->
    <div class="pb-40">
      <div class="px-6 mb-4 max-w-md mx-auto">
        <h2 class="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          Jours
        </h2>
      </div>
      <div class="space-y-6">
        <OfflineBanner :offline="offline" />

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
    </div>

    <!-- Debug Console -->
    <DebugConsole :logs="logs" :debug-mode="debugMode" :username="credentials.username" />

    <!-- Settings modal -->
    <SettingsDrawer
      :show="showSettingsDrawer"
      :minutes-objective="minutesObjective"
      :username="credentials.username"
      @close="toggleSettingsDrawer"
      @logout="emit('logout')"
      @update:minutes-objective="changeHourObjective"
    />

    <!-- Mark absent modal -->
    <AbsenceDrawer
      :show="showAbsenceDrawer"
      :presence-date="presenceDate"
      @close="toggleAbsenceDrawer"
      @mark-absent="handleMarkAbsentAndClose"
    />
  </div>
</template>
