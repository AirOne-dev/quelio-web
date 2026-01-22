<script setup lang="ts">
import { toRef, computed } from "vue";
import DayCard from "./DayCard.vue";
import OfflineBanner from "./OfflineBanner.vue";
import { useWeekStats } from "../composables/useWeekStats";
import { useAbsences } from "../composables/useAbsences";
import { useSuggestions } from "../composables/useSuggestions";
import { useTimeCalculations } from "../composables/useTimeCalculations";
import type { ApiResponse } from "../types";

const props = defineProps<{
  data: ApiResponse;
  offline: boolean;
  missingDates: string[];
  minutesObjective: number;
  remainingMinutes: number;
  selectedSuggestedBlock: any;
  suggestedTimeBlocks: Record<string, any>;
  saveLocalStorage: (label: string, data: any) => void;
  loadLocalStorage: (label: string) => any;
}>();

const emit = defineEmits<{
  (e: "mark-absent", date: string): void;
  (e: "remove-absent", date: string): void;
  (e: "update:selected-suggested-block", value: any): void;
}>();

const dataRef = toRef(() => props.data);
const missingDatesRef = toRef(() => props.missingDates);
const minutesObjectiveRef = toRef(() => props.minutesObjective);

const { days } = useWeekStats(dataRef, missingDatesRef, minutesObjectiveRef);
const {
  isDayCardTransparent,
  isDayCardHalfTransparent,
} = useAbsences(props.saveLocalStorage, props.loadLocalStorage);

const { timeToMinutes, formatDataDate, isPastDateOrWeekend, getDayTotal } = useTimeCalculations();

// Days left computation
const daysLeft = computed(() => {
  const today = formatDataDate(new Date())
  const todayMinutes = timeToMinutes(getDayTotal(days.value[today]))

  const daysLeftArr = Object.keys(days.value)?.filter((date) =>
    !isPastDateOrWeekend(date) &&
    !props.missingDates.map((md) => md.split(' [-] ')[0]).includes(date)
  )

  if (!daysLeftArr) return null

  const followingDays = daysLeftArr.filter(date => date !== today)
  if (followingDays.length === 0 && todayMinutes < props.remainingMinutes) {
    return daysLeftArr
  }

  if (todayMinutes >= props.remainingMinutes / followingDays.length) {
    return followingDays
  }
  return daysLeftArr
});

const remainingMinutesRef = toRef(() => props.remainingMinutes);

const { startResizeSuggestion } = useSuggestions(
  days,
  daysLeft,
  remainingMinutesRef,
  props.saveLocalStorage,
  props.loadLocalStorage
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
};
</script>

<template>
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
        :is-day-card-half-transparent="isDayCardHalfTransparent(times, date, missingDates)"
        :is-day-card-transparent="isDayCardTransparent(times, date, missingDates)"
        @show-more="showMore"
        @mark-absent="emit('mark-absent', $event)"
        @remove-absent="emit('remove-absent', $event)"
        @update:selected-suggested-block="emit('update:selected-suggested-block', $event)"
        @start-resize-suggestion="startResizeSuggestion"
      />
    </div>
  </div>
</template>
