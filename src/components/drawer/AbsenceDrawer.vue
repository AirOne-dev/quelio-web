<script setup lang="ts">
import Drawer from './Drawer.vue'

interface Props {
  presenceDate: string | null
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'mark-absent', date: string, section: 'day' | 'morning' | 'afternoon'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <Drawer :open="show" @update:open="(val) => !val && emit('close')">
    <div class="flex flex-col gap-6 pb-2">
      <!-- Header -->
      <div class="text-center">
        <div class="text-lg text-indigo-300 mb-2">Marquer comme absent</div>
        <h2 class="text-2xl font-bold">{{ presenceDate }}</h2>
      </div>

      <!-- Options -->
      <div class="flex flex-col gap-3 max-w-md mx-auto w-full">
        <!-- Full Day -->
        <button
          @click="presenceDate && emit('mark-absent', presenceDate, 'day')"
          class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-indigo-500/10 active:scale-[0.98] transition-all group"
        >
          <div class="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
            <svg class="w-6 h-6 text-indigo-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path fill="currentColor" d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40L64 64C28.7 64 0 92.7 0 128l0 16 0 48L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-256 0-48 0-16c0-35.3-28.7-64-64-64l-40 0 0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40L152 64l0-40zM48 192l352 0 0 256c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256z"/>
            </svg>
          </div>
          <div class="text-left flex-1">
            <div class="font-semibold text-lg text-white">Journée entière</div>
            <div class="text-sm text-indigo-300">Absence toute la journée</div>
          </div>
          <svg class="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path fill="currentColor" d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/>
          </svg>
        </button>

        <!-- Half Day Options -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Morning -->
          <button
            @click="presenceDate && emit('mark-absent', presenceDate, 'morning')"
            class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-amber-500/10 active:scale-[0.98] transition-all group"
          >
            <div class="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
              <svg class="w-6 h-6 text-amber-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/>
              </svg>
            </div>
            <div class="text-center">
              <div class="font-semibold text-white">Matin</div>
              <div class="text-xs text-amber-300 mt-1">Demi-journée</div>
            </div>
          </button>

          <!-- Afternoon -->
          <button
            @click="presenceDate && emit('mark-absent', presenceDate, 'afternoon')"
            class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-purple-500/10 active:scale-[0.98] transition-all group"
          >
            <div class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <svg class="w-6 h-6 text-purple-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path fill="currentColor" d="M144.7 98.7c-21 34.1-33.1 74.3-33.1 117.3c0 98 62.8 181.4 150.4 211.7c-12.4 2.8-25.3 4.3-38.6 4.3C126.6 432 48 353.3 48 256c0-68.9 39.4-128.4 96.8-157.3zm62.1-66C91.1 41.2 0 137.9 0 256C0 379.7 100 480 223.5 480c47.8 0 92-15 128.4-40.6c1.9-1.3 3.7-2.7 5.5-4c4.8-3.6 9.4-7.4 13.9-11.4c2.7-2.4 5.3-4.8 7.9-7.3c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-3.7 .6-7.4 1.2-11.1 1.6c-5 .5-10.1 .9-15.3 1c-1.2 0-2.5 0-3.7 0l-.3 0c-96.8-.2-175.2-78.9-175.2-176c0-54.8 24.9-103.7 64.1-136c1-.9 2.1-1.7 3.2-2.6c4-3.2 8.2-6.2 12.5-9c3.1-2 6.3-4 9.6-5.8c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-3.6-.3-7.1-.5-10.7-.6c-2.7-.1-5.5-.1-8.2-.1c-3.3 0-6.5 .1-9.8 .2c-2.3 .1-4.6 .2-6.9 .4z"/>
              </svg>
            </div>
            <div class="text-center">
              <div class="font-semibold text-white">Après-midi</div>
              <div class="text-xs text-purple-300 mt-1">Demi-journée</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="text-center text-sm text-white/60 mt-2">
        Cette absence sera prise en compte dans le calcul de vos heures
      </div>
    </div>
  </Drawer>
</template>
