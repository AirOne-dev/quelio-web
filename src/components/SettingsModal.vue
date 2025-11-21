<script setup lang="ts">
import Drawer from './Drawer.vue'

interface Props {
  minutesObjective: number
  debugMode: boolean
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'logout'): void
  (e: 'update:minutes-objective', value: number): void
  (e: 'update:debug-mode', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const changeHourObjective = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:minutes-objective', Number(target.value) * 60)
}

const changeDebugMode = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:debug-mode', target.checked)
}
</script>

<template>
  <Drawer :open="show" @update:open="(val) => !val && emit('close')">
    <div class="flex flex-col gap-6 pb-2">
      <!-- Header -->
      <div class="flex items-center justify-center relative">
        <h2 class="text-2xl font-bold">Réglages</h2>
      </div>

      <!-- Settings List -->
      <div class="flex flex-col gap-3">
        <!-- Hour Objective -->
        <div class="glass-card rounded-2xl p-4">
          <label for="hour-objective" class="flex items-center justify-between cursor-pointer group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                <svg class="w-5 h-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path fill="currentColor" d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                </svg>
              </div>
              <div>
                <div class="font-medium text-white">Heures par semaine</div>
                <div class="text-sm text-indigo-300">Objectif hebdomadaire</div>
              </div>
            </div>
            <input
              type="number"
              id="hour-objective"
              class="w-16 px-3 py-2 rounded-xl text-center font-semibold text-lg bg-white/5 border border-white/10 hover:bg-white/10 focus:bg-white/15 focus:border-indigo-400 transition-all outline-none cursor-pointer"
              placeholder="38"
              :value="minutesObjective / 60"
              @input="changeHourObjective"
            >
          </label>
        </div>

        <!-- Debug Mode -->
        <div class="glass-card rounded-2xl p-4">
          <label for="debug-mode" class="flex items-center justify-between cursor-pointer group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <svg class="w-5 h-5 text-amber-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
                </svg>
              </div>
              <div>
                <div class="font-medium text-white">Mode debug</div>
                <div class="text-sm text-amber-300">Console développeur</div>
              </div>
            </div>
            <div class="relative">
              <input
                type="checkbox"
                id="debug-mode"
                class="sr-only peer"
                :checked="debugMode"
                @input="changeDebugMode"
              >
              <div class="w-11 h-6 bg-white/10 rounded-full peer-checked:bg-indigo-500 transition-colors cursor-pointer"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 cursor-pointer"></div>
            </div>
          </label>
        </div>

        <!-- Logout Button -->
        <button
          @click="emit('logout')"
          class="glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-red-500/10 active:scale-[0.98] transition-all group mt-2"
        >
          <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
            <svg class="w-5 h-5 text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="currentColor" d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
            </svg>
          </div>
          <div class="text-left flex-1">
            <div class="font-medium text-white">Se déconnecter</div>
            <div class="text-sm text-red-300">Fermer la session</div>
          </div>
          <svg class="w-5 h-5 text-white/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path fill="currentColor" d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/>
          </svg>
        </button>
      </div>
    </div>
  </Drawer>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Hide default checkbox but keep accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
