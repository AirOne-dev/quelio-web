<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { getISOWeekKey } from '../../utils/weekHelpers'

const props = defineProps<{
  show: boolean
  selectedYear: number
  selectedWeek: number
  isCurrentWeekSelected: boolean
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

const scrollContainer = ref<HTMLElement | null>(null)

// Generate weeks (going backwards from current week)
const WEEKS_TO_SHOW = 52 // Show up to 52 weeks back

const weeks = computed(() => {
  const result: Array<{ year: number; week: number; key: string; isCurrent: boolean; isSelected: boolean }> = []

  let year = currentYear
  let week = currentWeek

  for (let i = 0; i < WEEKS_TO_SHOW; i++) {
    const weekKey = `${year}-w-${String(week).padStart(2, '0')}`
    const isCurrent = year === currentYear && week === currentWeek
    const isSelected = year === props.selectedYear && week === props.selectedWeek

    result.push({ year, week, key: weekKey, isCurrent, isSelected })

    // Go to previous week
    week--
    if (week < 1) {
      year--
      week = 52
    }
  }

  return result
})

const handleSelectWeek = (year: number, week: number) => {
  emit('select-week', year, week)
  emit('close')
}

const handleGoToCurrent = () => {
  emit('go-to-current')
  emit('close')
}

// Scroll to selected week when drawer opens
watch(() => props.show, async (newShow) => {
  if (newShow) {
    await nextTick()
    if (scrollContainer.value) {
      const selectedElement = scrollContainer.value.querySelector('.week-item.selected')
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }
})
</script>

<template>
  <!-- Backdrop -->
  <div
    v-if="show"
    class="drawer-backdrop"
    @click="emit('close')"
  ></div>

  <!-- Drawer -->
  <div
    :class="['drawer', { 'drawer-open': show }]"
  >
    <!-- Handle bar -->
    <div class="drawer-handle-container">
      <div class="drawer-handle"></div>
    </div>

    <!-- Header -->
    <div class="drawer-header">
      <h2 class="drawer-title">Sélectionner une semaine</h2>
      <button
        v-if="!isCurrentWeekSelected"
        @click="handleGoToCurrent"
        class="current-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Semaine actuelle
      </button>
    </div>

    <!-- Week list -->
    <div ref="scrollContainer" class="drawer-content">
      <div class="weeks-list">
        <button
          v-for="weekInfo in weeks"
          :key="weekInfo.key"
          @click="handleSelectWeek(weekInfo.year, weekInfo.week)"
          class="week-item"
          :class="{
            selected: weekInfo.isSelected,
            current: weekInfo.isCurrent
          }"
        >
          <div class="week-item-content">
            <div class="week-main">
              <span class="week-label">Semaine {{ weekInfo.week }}</span>
              <span v-if="weekInfo.isCurrent" class="current-badge">Actuelle</span>
            </div>
            <div class="week-year">{{ weekInfo.year }}</div>
          </div>
          <svg
            v-if="weekInfo.isSelected"
            class="check-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 70vh;
  background: var(--card-bg);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.drawer-open {
  transform: translateY(0);
}

.drawer-handle-container {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0 0.5rem;
}

.drawer-handle {
  width: 40px;
  height: 4px;
  background: var(--text-tertiary);
  opacity: 0.3;
  border-radius: 2px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border);
}

.drawer-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.current-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.current-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.current-button:active {
  transform: translateY(0);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 1rem 1.5rem;
  -webkit-overflow-scrolling: touch;
}

.weeks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.week-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--background-tertiary);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.week-item:hover {
  background: var(--background-hover);
  border-color: var(--accent);
  transform: translateX(4px);
}

.week-item:active {
  transform: translateX(2px);
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

.week-item-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.week-main {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.week-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.week-item.selected .week-label {
  color: white;
}

.current-badge {
  padding: 0.125rem 0.5rem;
  background: var(--accent);
  color: white;
  border-radius: 6px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.week-item.selected .current-badge {
  background: rgba(255, 255, 255, 0.25);
}

.week-year {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.week-item.selected .week-year {
  color: rgba(255, 255, 255, 0.8);
}

.check-icon {
  color: white;
  flex-shrink: 0;
}
</style>
