<script setup lang="ts">
import { type PropType } from 'vue'
import type { DayData } from '../../types'

defineProps({
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

function getDayShortName(dayName: string): string {
  const shortNames: { [key: string]: string } = {
    'Lundi': 'Lun',
    'Mardi': 'Mar',
    'Mercredi': 'Mer',
    'Jeudi': 'Jeu',
    'Vendredi': 'Ven',
    'Samedi': 'Sam',
    'Dimanche': 'Dim'
  }
  return shortNames[dayName] || dayName
}
</script>

<template>
  <div class="backdrop-blur-xl rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] aspect-square flex flex-col items-center justify-center p-2">
    <div class="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide mb-1">Meilleur</div>
    <div v-if="mostProductiveDay" class="text-center leading-tight">
      <div class="text-xl font-bold text-[var(--text-primary)]">{{ getDayShortName(mostProductiveDay.dayName) }}</div>
      <div class="text-xs text-[var(--accent)] mt-0.5">{{ formatMinutes(mostProductiveDay.totalMinutes) }}</div>
    </div>
    <div v-else class="text-lg text-[var(--text-tertiary)]">—</div>
  </div>
</template>

