<script setup lang="ts">
import { type PropType } from 'vue'
import type { DayData } from '../../types'

defineProps({
  dailyAverage: {
    type: Number,
    required: true
  },
  workedDays: {
    type: Number,
    required: true
  },
  mostProductiveDay: {
    type: Object as PropType<DayData | null>,
    default: null
  }
})

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h${mins.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="backdrop-blur-xl rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] aspect-square flex flex-col items-center justify-center p-2">
    <div class="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide mb-1">Moyenne</div>
    <div class="text-xl font-bold text-[var(--accent)] leading-tight">{{ formatMinutes(dailyAverage) }}</div>
    <div class="text-xs text-[var(--text-secondary)] mt-0.5">par jour</div>
  </div>
</template>

