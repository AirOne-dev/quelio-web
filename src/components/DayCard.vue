<script setup lang="ts">
import moment from "moment";
import type { TimeBlock } from "../types";
import { useTimeCalculations } from "../composables/useTimeCalculations";

const props = defineProps<{
    date: string;
    times: string[] | undefined;
    index: number;
    missingDates: string[];
    suggestedTimeBlocks?: TimeBlock[];
    selectedSuggestedBlock: string | null;
    isDayCardHalfTransparent: boolean;
    isDayCardTransparent: boolean;
  }>(),
  emit = defineEmits<{
    (e: "show-more", event: MouseEvent): void;
    (e: "mark-absent", date: string): void;
    (e: "remove-absent", date: string): void;
    (e: "update:selected-suggested-block", value: string | null): void;
    (
      e: "start-resize-suggestion",
      event: MouseEvent,
      date: string,
      idx: number,
      handle: "start" | "end"
    ): void;
  }>();

const { getTimeBlocks, getDayTotal, getBlockStyle } = useTimeCalculations();

const formatDate = (date: string) => {
    const formatted = moment(date, "DD-MM-YYYY").locale("fr").format("dddd D MMMM");
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  },
  handleShowMore = (event: MouseEvent) => {
    if (props.times) {
      emit("show-more", event);
    }
  },
  handleMarkAbsent = (date: string) => {
    if (props.missingDates.map((md) => md.split(" [-] ")[0]).includes(date)) {
      emit("remove-absent", date);
    } else {
      emit("mark-absent", date);
    }
  },
  handleSelectSuggestedBlock = (date: string, idx: number) => {
    const blockId = `${date}-${idx}`;
    emit(
      "update:selected-suggested-block",
      props.selectedSuggestedBlock === blockId ? null : blockId
    );
  },
  hasBeforeSelector = (
    block: TimeBlock,
    _date: string,
    times: string[] | undefined
  ): string | false => {
    const timeCalc = useTimeCalculations();
    return !times ||
      times.length % 2 === 0 ||
      timeCalc.timeToMinutes(block.start) >
        timeCalc.timeToMinutes(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        )
      ? "beforeSelector"
      : false;
  };
</script>

<template>
  <div class="px-6">
    <div
      class="day-card opacity-0 rounded-2xl overflow-hidden w-full max-w-md mx-auto relative border border-[var(--border)]"
      :class="[isDayCardHalfTransparent ? '' : 'backdrop-blur-xl']"
      :style="{
        animationDelay: index * 0.1 + 's',
        opacity: !isDayCardHalfTransparent && isDayCardTransparent ? '0.3 !important' : 1,
        background: isDayCardHalfTransparent
          ? 'linear-gradient(to bottom right, var(--card-bg) 50%, rgba(0,0,0,0.2) 50%)'
          : 'var(--card-bg)',
      }"
    >
      <div @click="handleShowMore" class="p-6 cursor-pointer">
        <!-- Date Header -->
        <div
          class="flex justify-between"
          :class="{ 'mb-6': isDayCardHalfTransparent || !isDayCardTransparent }"
        >
          <div>
            <div class="flex">
              <div
                @click.stop="handleMarkAbsent(date)"
                class="w-6 h-6 p-1 mr-2 cursor-pointer hover:scale-110 active:scale-95 transition-transform mt-[2px]"
              >
                <!-- Absent icon -->
                <svg
                  v-if="missingDates.map((md) => md.split(' [-] ')[0]).includes(date)"
                  title="Marquer ce jour comme non travaillé"
                  class="h-full w-full hover:opacity-80 transition-opacity text-[var(--danger)]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                >
                  <path
                    fill="currentColor"
                    d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM471 143c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                  />
                </svg>
                <!-- Present icon -->
                <svg
                  v-else
                  title="Marquer ce jour comme travaillé"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-full w-full hover:opacity-80 transition-opacity text-[var(--accent)]"
                  viewBox="0 0 640 512"
                >
                  <path
                    fill="currentColor"
                    d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM625 177L497 305c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L591 143c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-[var(--text-primary)]">
                {{ formatDate(date) }}
              </h2>
            </div>
            <div v-if="times" class="text-sm mt-1 text-[var(--accent)]">
              {{ getDayTotal(times) }}
            </div>
          </div>
          <div v-if="times" class="w-6 h-6 p-1">
            <!-- Caret down icon -->
            <svg
              title="Afficher plus d'informations"
              class="caret-icon h-full w-full transition-transform duration-300 text-[var(--text-primary)]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
            >
              <path
                fill="currentColor"
                d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
              />
            </svg>
          </div>
        </div>

        <!-- Timeline -->
        <div v-if="isDayCardHalfTransparent || !isDayCardTransparent" class="relative">
          <div class="timeline-container relative h-4 rounded-lg bg-[var(--border)]">
            <template v-if="times">
              <div
                v-for="(block, idx) in getTimeBlocks(times)"
                :key="idx"
                class="absolute h-full transition-all duration-300 rounded-md z-10 pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/10 after:via-white/20 after:to-white/10 after:bg-[length:200%_100%] after:animate-[shine_3s_infinite] after:rounded-md"
                :style="{
                  ...getBlockStyle(block),
                  background: `linear-gradient(to right, var(--accent-hover), var(--accent))`,
                }"
              />
            </template>
            <template v-if="suggestedTimeBlocks">
              <div
                v-for="(block, idx) in suggestedTimeBlocks"
                :key="idx"
                class="suggestedBlock border-2 absolute h-full transition-all duration-200 flex items-center rounded-md bg-[repeating-linear-gradient(110deg,#aaa,#aaa_2px,transparent_2px,transparent_6px)] border-[#aaa] cursor-pointer"
                :class="
                  `${date}-${idx}` === selectedSuggestedBlock
                    ? `rounded-r-none ${
                        hasBeforeSelector(block, date, times) ? 'rounded-l-none' : ''
                      }`
                    : 'opacity-20'
                "
                :style="getBlockStyle(block)"
                @click.stop="handleSelectSuggestedBlock(date, idx)"
              >
                <div
                  v-if="
                    `${date}-${idx}` === selectedSuggestedBlock &&
                    hasBeforeSelector(block, date, times)
                  "
                  class="absolute -left-0.5 w-2 h-6 rounded-full bg-[var(--text-primary)] cursor-ew-resize"
                  @mousedown.stop="
                    emit('start-resize-suggestion', $event, date, idx, 'start')
                  "
                />
                <div
                  v-if="`${date}-${idx}` === selectedSuggestedBlock"
                  class="absolute -right-0.5 w-2 h-6 rounded-full bg-[var(--text-primary)] cursor-ew-resize"
                  @mousedown.stop="
                    emit('start-resize-suggestion', $event, date, idx, 'end')
                  "
                />
              </div>
            </template>
          </div>
          <div class="flex text-xs mt-2 relative text-[var(--text-tertiary)]">
            <span
              v-for="hour in [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]"
              :key="hour"
              class="absolute -translate-x-1/2"
              :class="{ 'opacity-0': ![8, 10, 12, 14, 16, 18].includes(hour) }"
              :style="{ left: `${((hour - 8) / 11) * 100}%` }"
            >
              {{ hour }}
            </span>
          </div>
        </div>

        <!-- Time Blocks -->
        <div
          class="time-blocks overflow-y-hidden transition-[height] duration-300 ease-in-out"
          style="height: 0px"
        >
          <div v-if="times" class="space-y-1 pt-8">
            <div
              v-for="(block, idx) in getTimeBlocks(times)"
              :key="idx"
              class="flex items-center justify-between p-3 rounded-lg transition-colors bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--card-hover)]"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-2 h-2 rounded-full"
                  :style="{
                    background: `linear-gradient(to right, var(--accent), var(--accent-hover))`,
                  }"
                />
                <span
                  >{{ block.start }} <span class="text-sm">→</span> {{ block.end }}</span
                >
              </div>
              <div class="text-[var(--accent)]">{{ block.duration }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
