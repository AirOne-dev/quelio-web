<script setup lang="ts">
interface Props {
  presenceDate: string | null
}

interface Emits {
  (e: 'close'): void
  (e: 'mark-absent', date: string, section: 'day' | 'morning' | 'afternoon'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div
    id="presence-modal"
    class="fixed inset-0 z-50 pointer-events-none transition-color duration-100"
    style="background-color: rgba(0, 0, 0, 0);"
    @click.self="emit('close')"
  >
    <div
      class="modal-content glass rounded-t-2xl absolute bottom-0 inset-x-0 p-6 flex items-center flex-col transition-transform duration-200 gap-5"
      style="transform: translateY(100%);"
    >
      <h2 class="text-xl font-bold">Absent le {{ presenceDate }} ?</h2>
      <!-- choose between: whole day, evening or afternoon -->
      <div class="w-full flex flex-col items-center justify-center gap-2">
        <button
          @click="presenceDate && emit('mark-absent', presenceDate, 'day')"
          class="shine-btn w-2/3 py-3 px-4 rounded-xl text-white font-medium"
        >
          Journée entière
        </button>
        <div class="flex w-2/3 gap-2">
          <button
            @click="presenceDate && emit('mark-absent', presenceDate, 'morning')"
            class="shine-btn w-1/2 py-3 px-4 rounded-xl text-white font-medium"
          >
            Matin
          </button>
          <button
            @click="presenceDate && emit('mark-absent', presenceDate, 'afternoon')"
            class="shine-btn w-1/2 py-3 px-4 rounded-xl text-white font-medium"
          >
            Après-midi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
