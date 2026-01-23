<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getISOWeekKey } from '../utils/weekHelpers'

const props = defineProps<{
  show: boolean
  selectedYear: number
  selectedWeek: number
  isCurrentWeekSelected: boolean
  originRect: DOMRect | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-week', year: number, week: number): void
  (e: 'go-to-current'): void
}>()

// Get current week for reference
const currentWeekKey = getISOWeekKey()
const [currentYearStr, , currentWeekStr] = currentWeekKey.split('-')
const currentYear = parseInt(currentYearStr)
const currentWeek = parseInt(currentWeekStr)

// Current index in the weeks array
const currentIndex = ref(0)

// Animation hooks for Transition component
const onBeforeEnter = (el: Element) => {
  const element = el as HTMLElement

  if (props.originRect) {
    const originX = props.originRect.left + props.originRect.width / 2
    const originY = props.originRect.top + props.originRect.height / 2

    // Position the modal at the button's position
    element.style.left = `${originX}px`
    element.style.top = `${originY}px`
    element.style.transform = 'translate(-50%, -50%) scale(0)'
    element.style.opacity = '0'
  } else {
    element.style.transform = 'translate(-50%, -50%) scale(0)'
    element.style.opacity = '0'
  }
}

const onEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement

  // Force reflow
  element.offsetHeight

  // Animate to center
  element.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
  element.style.left = '50%'
  element.style.top = '50%'
  element.style.transform = 'translate(-50%, -50%) scale(1)'
  element.style.opacity = '1'

  setTimeout(done, 300)
}

const onLeave = (el: Element, done: () => void) => {
  const element = el as HTMLElement

  if (props.originRect) {
    const originX = props.originRect.left + props.originRect.width / 2
    const originY = props.originRect.top + props.originRect.height / 2

    element.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
    element.style.left = `${originX}px`
    element.style.top = `${originY}px`
    element.style.transform = 'translate(-50%, -50%) scale(0)'
    element.style.opacity = '0'
  } else {
    element.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
    element.style.transform = 'translate(-50%, -50%) scale(0)'
    element.style.opacity = '0'
  }

  setTimeout(done, 300)
}

// Generate weeks (going backwards from current week)
const WEEKS_TO_SHOW = 52

const weeks = computed(() => {
  const result: Array<{ year: number; week: number; key: string; isCurrent: boolean }> = []

  let year = currentYear
  let week = currentWeek

  for (let i = 0; i < WEEKS_TO_SHOW; i++) {
    const weekKey = `${year}-w-${String(week).padStart(2, '0')}`
    const isCurrent = year === currentYear && week === currentWeek

    result.push({ year, week, key: weekKey, isCurrent })

    // Go to previous week
    week--
    if (week < 1) {
      year--
      week = 52
    }
  }

  return result
})

// Current selected week info
const selectedWeekInfo = computed(() => weeks.value[currentIndex.value])

const goToPrevious = () => {
  if (currentIndex.value < weeks.value.length - 1) {
    currentIndex.value++
  }
}

const goToNext = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const handleConfirm = () => {
  const week = selectedWeekInfo.value
  emit('select-week', week.year, week.week)
  emit('close')
}

const handleGoToCurrent = () => {
  emit('go-to-current')
  emit('close')
}

// Initialize currentIndex when picker opens
watch(() => props.show, (show) => {
  if (show) {
    const index = weeks.value.findIndex(
      w => w.year === props.selectedYear && w.week === props.selectedWeek
    )
    if (index !== -1) {
      currentIndex.value = index
    }
  }
})
</script>

<template>
  <!-- Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    leave-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-[9999]"
      @click="emit('close')"
    ></div>
  </Transition>

  <!-- Picker Modal with custom animation -->
  <Transition
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
    :css="false"
  >
    <div
      v-if="show"
      class="fixed w-[90%] max-w-[380px] bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] z-[10000] overflow-hidden"
    >
      <!-- Header with close button -->
      <div class="flex items-center justify-between px-6 pt-4 pb-3">
        <h3 class="text-base font-semibold text-[var(--text-secondary)]">Choisir une semaine</h3>
        <button @click="emit('close')" class="flex items-center justify-center w-8 h-8 bg-[var(--background-tertiary)] rounded-full cursor-pointer transition-all hover:bg-[var(--background-hover)] active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--text-secondary)]">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Main content -->
      <div class="px-6 pb-6">
        <!-- Selected week display -->
        <div class="relative mb-6">
          <div class="text-center py-6 bg-[var(--background-tertiary)] rounded-2xl">
            <div class="flex items-baseline justify-center gap-2">
              <span class="text-4xl font-bold text-[var(--accent)]">{{ selectedWeekInfo.week }}</span>
              <span class="text-xl font-semibold text-[var(--text-secondary)]">/ {{ selectedWeekInfo.year }}</span>
            </div>
            <div v-if="selectedWeekInfo.isCurrent" class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--accent)] text-white rounded-full text-xs font-semibold">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
              Semaine actuelle
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center gap-3 mb-6">
          <button
            @click="goToNext"
            :disabled="currentIndex === 0"
            class="flex items-center justify-center w-11 h-11 bg-[var(--background-tertiary)] rounded-xl cursor-pointer transition-all"
            :class="currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--accent)] hover:text-white active:scale-95'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="flex-1 text-center">
            <div class="text-sm font-medium text-[var(--text-secondary)]">
              {{ weeks.length - currentIndex }} sur {{ weeks.length }}
            </div>
          </div>

          <button
            @click="goToPrevious"
            :disabled="currentIndex === weeks.length - 1"
            class="flex items-center justify-center w-11 h-11 bg-[var(--background-tertiary)] rounded-xl cursor-pointer transition-all"
            :class="currentIndex === weeks.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--accent)] hover:text-white active:scale-95'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="mb-6">
          <div class="h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
            <div
              class="h-full bg-[var(--accent)] transition-all duration-300 ease-out rounded-full"
              :style="{ width: `${((weeks.length - 1 - currentIndex) / (weeks.length - 1)) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2">
          <button
            v-if="!selectedWeekInfo.isCurrent"
            @click="handleGoToCurrent"
            class="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--background-tertiary)] text-[var(--text-primary)] rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-[var(--background-hover)] active:scale-98"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Actuelle
          </button>
          <button
            @click="handleConfirm"
            class="flex items-center justify-center gap-2 py-3 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90 active:scale-98"
            :class="selectedWeekInfo.isCurrent ? 'flex-1' : 'px-8'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Valider
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

