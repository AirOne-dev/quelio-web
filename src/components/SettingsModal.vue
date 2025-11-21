<script setup lang="ts">
interface Props {
  minutesObjective: number
  debugMode: boolean
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
  <div
    id="bottom-modal"
    class="fixed inset-0 z-50 pointer-events-none transition-color duration-100"
    @click.self="emit('close')"
    style="background-color: rgba(0, 0, 0, 0);"
  >
    <div
      class="modal-content glass rounded-t-2xl absolute bottom-0 inset-x-0 p-6 flex items-center flex-col transition-transform duration-200 gap-5"
      style="transform: translateY(100%);"
    >
      <h2 class="text-xl font-bold">Réglages</h2>
      <!-- Logout icon -->
      <svg
        title="Se déconnecter"
        @click="emit('logout')"
        class="text-indigo-300 h-6 w-6 absolute top-6 right-6 cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path fill="currentColor"
          d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
        />
      </svg>
      <div class="w-full flex flex-col items-stretch">
        <label
          for="hour-objective"
          class="flex items-center justify-between pb-2"
          style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"
        >
          Heures par semaine
          <input
            type="number"
            id="hour-objective"
            class="glass-input w-12 px-2 py-1 rounded-xl text-center"
            placeholder="38?"
            :value="minutesObjective / 60"
            @input="changeHourObjective"
          >
        </label>
        <label
          for="debug-mode"
          class="flex items-center justify-between pb-2"
          style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"
        >
          Mode debug
          <input
            type="checkbox"
            id="debug-mode"
            class="w-4 h-4 px-2 py-1 rounded-xl text-center"
            :checked="debugMode"
            @input="changeDebugMode"
          >
        </label>
      </div>
    </div>
  </div>
</template>
