<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { getISOWeekKey } from '../utils/weekHelpers'

const props = defineProps<{
  selectedYear: number
  selectedWeek: number
  isCurrentWeekSelected: boolean
  isLoadingWeek: boolean
}>()

const emit = defineEmits<{
  (e: 'select-week', year: number, week: number): void
  (e: 'go-to-current'): void
}>()

// Container ref for scrolling
const scrollContainer = ref<HTMLElement | null>(null)

// Number of weeks to show in the virtual scroll window
const WINDOW_SIZE = 30 // Show 30 weeks at a time

// Get current week for reference
const currentWeekKey = getISOWeekKey()
const [currentYearStr, , currentWeekStr] = currentWeekKey.split('-')
const currentYear = parseInt(currentYearStr)
const currentWeek = parseInt(currentWeekStr)

/**
 * Generate a list of weeks from a start point going backwards
 */
const generateWeeks = computed(() => {
  const weeks: Array<{ year: number; week: number; key: string; isCurrent: boolean }> = []

  let year = currentYear
  let week = currentWeek

  // Generate WINDOW_SIZE weeks backwards from current
  for (let i = 0; i < WINDOW_SIZE; i++) {
    const weekKey = `${year}-w-${String(week).padStart(2, '0')}`
    const isCurrent = year === currentYear && week === currentWeek

    weeks.push({ year, week, key: weekKey, isCurrent })

    // Go to previous week
    week--
    if (week < 1) {
      year--
      // Approximate: assume 52 weeks per year (good enough for UI)
      week = 52
    }
  }

  return weeks
})

/**
 * Check if a week is selected
 */
const isWeekSelected = (year: number, week: number) => {
  return props.selectedYear === year && props.selectedWeek === week
}

/**
 * Handle week selection
 */
const handleSelectWeek = (year: number, week: number) => {
  emit('select-week', year, week)
}

/**
 * Navigate to previous week
 */
const goToPrevious = () => {
  let year = props.selectedYear
  let week = props.selectedWeek - 1

  if (week < 1) {
    year--
    week = 52 // Approximate
  }

  emit('select-week', year, week)
}

/**
 * Navigate to next week (only if not current)
 */
const goToNext = () => {
  if (props.isCurrentWeekSelected) {
    return // Already at current week
  }

  let year = props.selectedYear
  let week = props.selectedWeek + 1

  // Check if we would exceed current week
  if (year > currentYear || (year === currentYear && week > currentWeek)) {
    return
  }

  if (week > 52) {
    year++
    week = 1
  }

  emit('select-week', year, week)
}

/**
 * Scroll to selected week on mount and when selection changes
 */
const scrollToSelected = async () => {
  await nextTick()

  if (!scrollContainer.value) return

  const selectedElement = scrollContainer.value.querySelector('.week-item.selected')
  if (selectedElement) {
    selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

// Watch for selection changes
watch(() => [props.selectedYear, props.selectedWeek], () => {
  scrollToSelected()
})

onMounted(() => {
  scrollToSelected()
})
</script>

<template>
  <div class="pt-47 pb-8">
    <!-- Section title and controls -->
    <div class="px-6 mb-4 max-w-md mx-auto">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          Période
        </h2>
        <button
          v-if="!isCurrentWeekSelected"
          @click="emit('go-to-current')"
          class="current-week-button"
          title="Retour à la semaine actuelle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Actuelle</span>
        </button>
      </div>
    </div>

    <!-- Week selector content -->
    <div class="px-6">
      <div class="max-w-md mx-auto">
        <!-- Navigation and week display -->
        <div class="week-selector-container">
          <button
            @click="goToPrevious"
            class="nav-button"
            title="Semaine précédente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <!-- Scrollable week list -->
          <div
            ref="scrollContainer"
            class="week-scroll-container"
          >
            <div class="week-list">
              <button
                v-for="weekInfo in generateWeeks"
                :key="weekInfo.key"
                @click="handleSelectWeek(weekInfo.year, weekInfo.week)"
                class="week-item"
                :class="{
                  selected: isWeekSelected(weekInfo.year, weekInfo.week),
                  current: weekInfo.isCurrent
                }"
              >
                <div class="week-number">S{{ weekInfo.week }}</div>
                <div class="week-year">{{ weekInfo.year }}</div>
              </button>
            </div>
          </div>

          <button
            @click="goToNext"
            class="nav-button"
            :disabled="isCurrentWeekSelected"
            :class="{ disabled: isCurrentWeekSelected }"
            title="Semaine suivante"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoadingWeek" class="loading-indicator">
          <div class="loading-spinner"></div>
          <span>Chargement...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.current-week-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.current-week-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.week-selector-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.5rem;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.nav-button:hover:not(.disabled) {
  background: var(--background-tertiary);
  color: var(--accent);
}

.nav-button.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.week-scroll-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.week-scroll-container::-webkit-scrollbar {
  display: none;
}

.week-list {
  display: flex;
  gap: 0.5rem;
  padding: 0.125rem 0;
  min-width: min-content;
}

.week-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 0.5rem 0.625rem;
  background: var(--background-tertiary);
  border: 1.5px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.week-item:hover {
  background: var(--background-hover);
  border-color: var(--accent);
}

.week-item.selected {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.week-item.current:not(.selected) {
  border-color: var(--accent);
  border-style: dashed;
}

.week-number {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
}

.week-year {
  font-size: 0.625rem;
  opacity: 0.7;
  margin-top: 0.25rem;
  line-height: 1;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  justify-content: center;
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
