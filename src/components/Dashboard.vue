<script setup lang="ts">
import { toRef, onMounted } from "vue";
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
import { useDaysLeft } from "../composables/useDaysLeft";
import { useSuggestions } from "../composables/useSuggestions";
import { useDrawers } from "../composables/useDrawers";
import { useStats } from "../composables/useStats";
import type { ApiResponse, Credentials, LogEntry } from "../types";

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
  {
    dailyAverage,
    mostProductiveDay,
    workedDays,
    progressPercentage,
    statusEmoji,
  } = useStats(
    days,
    missingDates,
    minutesObjective,
    toRef(() => props.data.total_effective),
    toRef(() => props.data.total_paid)
  );

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
