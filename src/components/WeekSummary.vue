<script setup lang="ts">
import { toRef } from "vue";
import WeekInsights from "./widgets/WeekInsights.vue";
import WeekObjective from "./widgets/WeekObjective.vue";
import WeekTopDay from "./widgets/WeekTopDay.vue";
import { useWeekStats } from "../composables/useWeekStats";
import type { ApiResponse } from "../types";

const props = defineProps<{
  data: ApiResponse;
  missingDates: string[];
  minutesObjective: number;
}>();

const dataRef = toRef(() => props.data);
const missingDatesRef = toRef(() => props.missingDates);
const minutesObjectiveRef = toRef(() => props.minutesObjective);

const {
  dailyAverage,
  workedDays,
  mostProductiveDay,
  progressPercentage,
  statusEmoji,
} = useWeekStats(dataRef, missingDatesRef, minutesObjectiveRef);
</script>

<template>
  <div class="pb-8">
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
        <WeekTopDay :most-productive-day="mostProductiveDay" />
      </div>
    </div>
  </div>
</template>
