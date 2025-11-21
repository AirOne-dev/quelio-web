<script setup lang="ts">
import moment from 'moment'
import type { TimeBlock } from '../types'
import { useTimeCalculations } from '../composables/useTimeCalculations'

interface Props {
  date: string
  times: string[] | undefined
  index: number
  missingDates: string[]
  suggestedTimeBlocks?: TimeBlock[]
  selectedSuggestedBlock: string | null
  isDayCardHalfTransparent: boolean
  isDayCardTransparent: boolean
}

interface Emits {
  (e: 'show-more', event: MouseEvent): void
  (e: 'mark-absent', date: string): void
  (e: 'remove-absent', date: string): void
  (e: 'update:selected-suggested-block', value: string | null): void
  (e: 'start-resize-suggestion', event: MouseEvent, date: string, idx: number, handle: 'start' | 'end'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getTimeBlocks, getDayTotal, getBlockStyle } = useTimeCalculations()

const formatDate = (date: string) => {
  return moment(date, 'DD-MM-YYYY').format('dddd D MMMM')
}

const handleShowMore = (event: MouseEvent) => {
  if (props.times) {
    emit('show-more', event)
  }
}

const handleMarkAbsent = (date: string) => {
  if (props.missingDates.map((md) => md.split(' [-] ')[0]).includes(date)) {
    emit('remove-absent', date)
  } else {
    emit('mark-absent', date)
  }
}

const handleSelectSuggestedBlock = (date: string, idx: number) => {
  const blockId = `${date}-${idx}`
  emit('update:selected-suggested-block', props.selectedSuggestedBlock === blockId ? null : blockId)
}

const hasBeforeSelector = (block: TimeBlock, _date: string, times: string[] | undefined): string | false => {
  const timeCalc = useTimeCalculations()
  return !times || times.length % 2 === 0 || timeCalc.timeToMinutes(block.start) > timeCalc.timeToMinutes(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })) ? 'beforeSelector' : false
}
</script>

<template>
  <div class="px-6">
    <div
      class="day-card glass rounded-2xl overflow-hidden w-full max-w-md mx-auto"
      :class="{ 'day-card-half-opacity': isDayCardHalfTransparent }"
      :style="{
        animationDelay: index * 0.1 + 's',
        opacity: !isDayCardHalfTransparent && isDayCardTransparent ? '0.3 !important' : 1
      }"
    >
      <div @click="handleShowMore" class="p-6 cursor-pointer">
        <!-- Date Header -->
        <div
          class="flex justify-between"
          :class="{'mb-6': isDayCardHalfTransparent || !isDayCardTransparent}"
        >
          <div>
            <div class="flex">
              <div
                @click.stop="handleMarkAbsent(date)"
                style="margin-top: 2px;"
                class="w-6 h-6 p-1 mr-2 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              >
                <!-- Absent icon -->
                <svg
                  v-if="missingDates.map((md) => md.split(' [-] ')[0]).includes(date)"
                  title="Marquer ce jour comme non travaillé"
                  class="text-red-300 h-full w-full hover:text-red-200 transition-colors"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                >
                  <path fill="currentColor"
                    d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM471 143c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                  />
                </svg>
                <!-- Present icon -->
                <svg
                  v-else
                  title="Marquer ce jour comme travaillé"
                  xmlns="http://www.w3.org/2000/svg"
                  class="text-indigo-300 h-full w-full hover:text-indigo-200 transition-colors"
                  viewBox="0 0 640 512"
                >
                  <path fill="currentColor"
                    d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM625 177L497 305c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L591 143c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold">{{ formatDate(date) }}</h2>
            </div>
            <div v-if="times" class="text-indigo-300 text-sm mt-1">
              {{ getDayTotal(times) }}
            </div>
          </div>
          <div v-if="times" class="w-6 h-6 p-1">
            <!-- Caret down icon -->
            <svg
              title="Afficher plus d'informations"
              class="caret-icon text-white h-full w-full transition-transform duration-300"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
            >
              <path fill="currentColor"
                d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
              />
            </svg>
          </div>
        </div>

        <!-- Timeline -->
        <div v-if="isDayCardHalfTransparent || !isDayCardTransparent" class="relative">
          <div class="timeline-container relative">
            <template v-if="times">
              <div
                v-for="(block, idx) in getTimeBlocks(times)"
                :key="idx"
                class="time-block z-10 pointer-events-none"
                :style="getBlockStyle(block)"
              />
            </template>
            <template v-if="suggestedTimeBlocks">
              <div
                v-for="(block, idx) in suggestedTimeBlocks"
                :key="idx"
                class="suggestedBlock border-2 absolute h-full transition-all duration-200 flex items-center rounded-md"
                :class="`${date}-${idx}` === selectedSuggestedBlock ? `selectedSuggestedBlock ${hasBeforeSelector(block, date, times)}` : 'opacity-20'"
                :style="getBlockStyle(block)"
                style="background: repeating-linear-gradient(110deg,#aaa, #aaa 2px, transparent 2px, transparent 6px); border-color: #aaa;"
                @click.stop="handleSelectSuggestedBlock(date, idx)"
              >
                <div
                  v-if="`${date}-${idx}` === selectedSuggestedBlock && hasBeforeSelector(block, date, times)"
                  class="absolute -left-0.5 w-2 h-6 rounded-full bg-white"
                  @mousedown.stop="emit('start-resize-suggestion', $event, date, idx, 'start')"
                />
                <div
                  v-if="`${date}-${idx}` === selectedSuggestedBlock"
                  class="absolute -right-0.5 w-2 h-6 rounded-full bg-white"
                  @mousedown.stop="emit('start-resize-suggestion', $event, date, idx, 'end')"
                />
              </div>
            </template>
          </div>
          <div class="time-labels">
            <span
              v-for="hour in 12"
              :key="hour"
              class="text-center"
              :class="{'opacity-0': ![8, 10, 12, 14, 16, 18].includes(hour + 7)}"
            >
              {{ hour + 7 }}
            </span>
          </div>
        </div>

        <!-- Time Blocks -->
        <div class="time-blocks overflow-y-hidden transition-height" style="height: 0px;">
          <div v-if="times" class="space-y-1 pt-8">
            <div
              v-for="(block, idx) in getTimeBlocks(times)"
              :key="idx"
              class="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600" />
                <span>{{ block.start }} <span class="text-sm">→</span> {{ block.end }}</span>
              </div>
              <div class="text-indigo-300">{{ block.duration }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
