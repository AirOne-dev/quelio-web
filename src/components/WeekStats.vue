<script setup lang="ts">
interface Props {
  totalEffective: string
  totalPaid: string
  remainingMinutes: number
}

interface Emits {
  (e: 'refresh'): void
  (e: 'openSettings'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(Math.abs(minutes) / 60)
  const mins = Math.abs(minutes) % 60
  const sign = minutes < 0 ? '-' : ''
  return `${sign}${hours}:${mins.toString().padStart(2, '0')}`
}
</script>

<template>
  <div id="statsContainerRef" class="overflow-hidden rounded-2xl w-full mt-6" style="min-height: 84px;">
    <div class="px-6">
      <div id="statsRef" class="stats-card glass p-6 space-y-6 rounded-2xl max-w-md w-full mx-auto">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold tracking-tight flex justify-center">
            <span>Ma semaine</span>
            <div class="w-6 h-6 p-1 ml-2 cursor-pointer hover:scale-110 active:scale-95 transition-transform" style="margin-top: 5px;" @click="emit('refresh')">
              <svg title="Actualiser vos horaires"
                class="text-indigo-300 w-full h-full hover:text-indigo-200 transition-colors" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512">
                <path fill="currentColor"
                  d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" />
              </svg>
            </div>
          </h1>
          <div @click="emit('openSettings')" class="w-6 h-6 p-1 cursor-pointer hover:scale-110 active:scale-95 transition-transform">
            <svg title="Réglages" class="text-indigo-300 w-full h-full hover:text-indigo-200 transition-colors"
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
            <div class="text-2xl font-bold">{{ totalEffective }}</div>
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
            <div class="text-2xl font-bold">{{ totalPaid }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
