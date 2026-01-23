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

// Visible weeks (5 at a time: 2 before, current, 2 after)
const visibleWeeks = computed(() => {
  const start = Math.max(0, currentIndex.value - 2)
  const end = Math.min(weeks.value.length, currentIndex.value + 3)

  return weeks.value.slice(start, end).map((week, idx) => ({
    ...week,
    actualIndex: start + idx,
    offset: (start + idx) - currentIndex.value
  }))
})

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

const selectWeek = (index: number) => {
  currentIndex.value = index
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

// Touch handling for swipe
const touchStartX = ref(0)
const touchEndX = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e: TouchEvent) => {
  touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      goToPrevious() // Swipe left = next week (going back in time)
    } else {
      goToNext() // Swipe right = previous week
    }
  }
}
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
      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-5 pb-4">
        <button @click="emit('close')" class="flex items-center justify-center w-9 h-9 bg-[var(--background-tertiary)] rounded-full cursor-pointer transition-all hover:bg-[var(--background-hover)] hover:scale-105 active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--text-secondary)]">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h3 class="text-lg font-bold text-[var(--text-primary)]">Sélectionner une semaine</h3>
      <div class="w-9"></div>
    </div>

    <!-- Main Week Display -->
    <div class="flex flex-col items-center px-6 pt-8 pb-6 bg-[var(--background-tertiary)] rounded-[20px] mx-6 mb-6 relative">
      <div class="text-[5rem] font-extrabold leading-none text-[var(--accent)] tracking-[-0.04em]">{{ selectedWeekInfo.week }}</div>
      <div class="flex items-center gap-2 mt-2">
        <span class="text-base font-medium text-[var(--text-secondary)]">Semaine</span>
        <span class="text-lg font-bold text-[var(--text-primary)]">{{ selectedWeekInfo.year }}</span>
      </div>
      <div v-if="selectedWeekInfo.isCurrent" class="absolute top-4 right-4 px-3 py-1.5 bg-[var(--accent)] text-white rounded-[20px] text-xs font-bold tracking-[0.02em]">
        Semaine actuelle
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="flex items-center gap-3 px-6 mb-6">
      <button
        @click="goToNext"
        :disabled="currentIndex === 0"
        class="flex items-center justify-center w-12 h-12 bg-[var(--background-tertiary)] border-2 border-[var(--border)] rounded-xl cursor-pointer transition-all shrink-0"
        :class="currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] hover:scale-105 active:scale-95'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--text-primary)]">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Week Carousel -->
      <div
        class="flex-1 overflow-hidden relative"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="flex gap-2 justify-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
          <div
            v-for="week in visibleWeeks"
            :key="week.key"
            @click="selectWeek(week.actualIndex)"
            class="flex flex-col items-center justify-center min-w-[60px] px-2 py-3 bg-[var(--background-tertiary)] border-2 border-transparent rounded-xl cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative"
            :class="{
              'bg-[var(--accent)] border-[var(--accent)] scale-115 min-w-[70px]': week.offset === 0,
              'opacity-70 scale-95': Math.abs(week.offset) === 1,
              'opacity-40 scale-85': Math.abs(week.offset) === 2,
              'hover:border-[var(--accent)] hover:scale-105': week.offset !== 0
            }"
          >
            <div class="text-xl font-bold leading-none" :class="week.offset === 0 ? 'text-white' : 'text-[var(--text-primary)]'">{{ week.week }}</div>
            <div class="text-[0.625rem] font-semibold mt-1 leading-none" :class="week.offset === 0 ? 'text-white' : 'text-[var(--text-secondary)]'">{{ week.year }}</div>
            <div v-if="week.isCurrent" class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" :class="week.offset === 0 ? 'bg-white' : 'bg-[var(--accent)]'"></div>
          </div>
        </div>
      </div>

      <button
        @click="goToPrevious"
        :disabled="currentIndex === weeks.length - 1"
        class="flex items-center justify-center w-12 h-12 bg-[var(--background-tertiary)] border-2 border-[var(--border)] rounded-xl cursor-pointer transition-all shrink-0"
        :class="currentIndex === weeks.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] hover:scale-105 active:scale-95'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--text-primary)]">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Progress Indicator -->
    <div class="px-6 mb-6">
      <div class="h-1 bg-[var(--background-tertiary)] rounded-sm overflow-hidden mb-2">
        <div
          class="h-full bg-[var(--accent)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          :style="{ width: `${((weeks.length - 1 - currentIndex) / (weeks.length - 1)) * 100}%` }"
        ></div>
      </div>
      <div class="text-xs font-medium text-[var(--text-secondary)] text-center">
        {{ weeks.length - currentIndex }} / {{ weeks.length }} semaines
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 px-6 pb-6">
      <button
        v-if="!selectedWeekInfo.isCurrent"
        @click="handleGoToCurrent"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-[var(--background-tertiary)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-[14px] text-[0.9375rem] font-bold cursor-pointer transition-all hover:border-[var(--accent)] hover:-translate-y-0.5 active:translate-y-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Semaine actuelle
      </button>
      <button @click="handleConfirm" class="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-[var(--accent)] text-white rounded-[14px] text-[0.9375rem] font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0">
        Confirmer
      </button>
    </div>
    </div>
  </Transition>
</template>

