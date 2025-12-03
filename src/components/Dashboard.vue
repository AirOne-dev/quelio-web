<script setup lang="ts">
import { ref, toRef, onMounted } from "vue";
import WeekStats from "./WeekStats.vue";
import WeekSummary from "./WeekSummary.vue";
import DaysSection from "./DaysSection.vue";
import DebugConsole from "./DebugConsole.vue";
import SettingsDrawer from "./drawer/SettingsDrawer.vue";
import AbsenceDrawer from "./drawer/AbsenceDrawer.vue";
import { saveToStorage, loadFromStorage } from "../utils/storage";
import { useAbsences } from "../composables/useAbsences";
import { useTimeObjective } from "../composables/useTimeObjective";
import { useSuggestions } from "../composables/useSuggestions";
import { useWeekStats } from "../composables/useWeekStats";
import type { ApiResponse, Credentials, LogEntry } from "../types";

const props = defineProps<{
  data: ApiResponse;
  offline: boolean;
  credentials: Credentials;
  debugMode: boolean;
  logs: LogEntry[];
}>();

const emit = defineEmits<{
  (e: "logout"): void;
  (e: "refresh"): void;
}>();

// Storage helpers
const saveLocalStorage = (label: string, data: any) => saveToStorage(props.credentials.username, label, data);
const loadLocalStorage = (label: string) => loadFromStorage(props.credentials.username, label);

// Composables
const dataRef = toRef(() => props.data);
const {
  missingDates,
  markAbsent,
  loadMissingDates,
} = useAbsences(saveLocalStorage, loadLocalStorage);

const {
  minutesObjective,
  remainingMinutes,
  changeHourObjective,
  loadObjective,
} = useTimeObjective(dataRef, missingDates, toRef(() => null), saveLocalStorage, loadLocalStorage);

const { days } = useWeekStats(dataRef, missingDates, minutesObjective);

const {
  selectedSuggestedBlock,
  suggestedTimeBlocks,
  getCustomBorneForSuggestions,
} = useSuggestions(days, toRef(() => null), remainingMinutes, saveLocalStorage, loadLocalStorage);

// Drawers state
const showSettingsDrawer = ref(false);
const showAbsenceDrawer = ref(false);
const presenceDate = ref<string | null>(null);

const toggleSettingsDrawer = () => {
  showSettingsDrawer.value = !showSettingsDrawer.value;
};

const toggleAbsenceDrawer = () => {
  showAbsenceDrawer.value = !showAbsenceDrawer.value;
};

const handleMarkAbsent = (date: string) => {
  presenceDate.value = date;
  toggleAbsenceDrawer();
};

const handleMarkAbsentAndClose = (date: string, section: "day" | "morning" | "afternoon" = "day") => {
  markAbsent(date, section);
  toggleAbsenceDrawer();
};

// Lifecycle
onMounted(() => {
  getCustomBorneForSuggestions();
  loadMissingDates();

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
    <WeekSummary
      :data="data"
      :missing-dates="missingDates"
      :minutes-objective="minutesObjective"
    />

    <!-- Jours Section -->
    <DaysSection
      :data="data"
      :offline="offline"
      :missing-dates="missingDates"
      :minutes-objective="minutesObjective"
      :remaining-minutes="remainingMinutes"
      :selected-suggested-block="selectedSuggestedBlock"
      :suggested-time-blocks="suggestedTimeBlocks"
      :save-local-storage="saveLocalStorage"
      :load-local-storage="loadLocalStorage"
      @mark-absent="handleMarkAbsent"
      @update:selected-suggested-block="selectedSuggestedBlock = $event"
    />

    <!-- Debug Console -->
    <DebugConsole :logs="logs" :debug-mode="debugMode" :username="credentials.username" />

    <!-- Settings Drawer -->
    <SettingsDrawer
      :show="showSettingsDrawer"
      :minutes-objective="minutesObjective"
      :username="credentials.username"
      @close="toggleSettingsDrawer"
      @logout="emit('logout')"
      @update:minutes-objective="changeHourObjective"
    />

    <!-- Absence Drawer -->
    <AbsenceDrawer
      :show="showAbsenceDrawer"
      :presence-date="presenceDate"
      @close="toggleAbsenceDrawer"
      @mark-absent="handleMarkAbsentAndClose"
    />
  </div>
</template>
