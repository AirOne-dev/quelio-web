<script setup lang="ts">
import type { LogEntry } from '../types'

interface Props {
  logs: LogEntry[]
  debugMode: boolean
}

defineProps<Props>()
</script>

<template>
  <div v-if="debugMode" id="debugDiv"
    class="overflow-y-auto h-1/4 bg-gray-800 text-gray-200 font-mono text-sm p-2 fixed bottom-0 left-0 right-0 day-card glass rounded-2xl">
    <div v-for="(log, index) in logs" :key="index" :class="{
      'text-green-500': log.type === 'log',
      'text-yellow-500': log.type === 'warn',
      'text-red-500': log.type === 'error'
    }">[{{ log.type.toUpperCase() }}] {{ log.message }}</div>
  </div>
</template>
