<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  progressPercentage: {
    type: Number,
    required: true
  },
  statusEmoji: {
    type: String,
    required: true
  },
  workedDays: {
    type: Number,
    required: true
  }
})

const progressColor = computed(() => {
  if (props.progressPercentage >= 100) return 'var(--success)'
  if (props.progressPercentage >= 80) return 'var(--accent)'
  if (props.progressPercentage >= 60) return 'var(--accent)'
  return 'var(--warning)'
})
</script>

<template>
  <div class="backdrop-blur-xl rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] aspect-square flex flex-col items-center justify-center p-2">
    <div class="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide mb-1">Objectif</div>
    <div class="flex items-baseline gap-0.5 leading-tight">
      <span class="text-xl font-bold" :style="{ color: progressColor }">{{ progressPercentage }}</span>
      <span class="text-sm font-bold" :style="{ color: progressColor }">%</span>
    </div>
  </div>
</template>

