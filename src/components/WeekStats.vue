<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import WeekPicker from "./WeekPicker.vue";

const props = defineProps<{
  totalEffective: string;
  totalPaid: string;
  remainingMinutes: number;
  selectedYear: number;
  selectedWeek: number;
  isCurrentWeekSelected: boolean;
  isLoadingWeek: boolean;
}>();

const emit = defineEmits<{
  (e: "refresh"): void;
  (e: "openSettings"): void;
  (e: "select-week", year: number, week: number): void;
  (e: "go-to-current"): void;
}>();

const showWeekPicker = ref(false);
const weekTitleButton = ref<HTMLElement | null>(null);
const buttonRect = ref<DOMRect | null>(null);

const toggleWeekPicker = () => {
  if (!showWeekPicker.value && weekTitleButton.value) {
    // Capture button position before opening
    buttonRect.value = weekTitleButton.value.getBoundingClientRect();
  }
  showWeekPicker.value = !showWeekPicker.value;
};

const weekTitle = computed(() => {
  if (props.isCurrentWeekSelected) {
    return "Ma semaine";
  }
  return `Semaine ${props.selectedWeek}`;
});

const lastScrollTop = ref(0),
  lastDirectionChangeScrollTop = ref(0),
  currentDirection = ref<'up' | 'down' | null>(null),
  state = ref<'open' | 'closed'>('open');

const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? "-" : "";
    return `${sign}${hours}:${mins.toString().padStart(2, "0")}`;
  },
  handleScroll = (e: Event) => {
    if (!e.target) return;

    const scrollTop = (e.target as HTMLElement).scrollTop;
    const direction = scrollTop > lastScrollTop.value ? 'down' : 'up';
    
    // Vérifier si la direction a changé
    if (currentDirection.value !== direction) {
      lastDirectionChangeScrollTop.value = lastScrollTop.value;
      currentDirection.value = direction;
    }
    
    // Calculer l'offset depuis le dernier changement de direction
    const offsetSinceDirectionChange = Math.abs(scrollTop - lastDirectionChangeScrollTop.value);
    
    if (scrollTop <= 30) {
      state.value = 'open';
    } else {
      if (direction === 'up' && offsetSinceDirectionChange >= 30) {
        state.value = 'open';
      }
      if (direction === 'down' && offsetSinceDirectionChange >= 30) {
        state.value = 'closed'
      }
    }

    // Mettre à jour le dernier scrollTop
    lastScrollTop.value = scrollTop;
  };

onMounted(() => {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.addEventListener("scroll", handleScroll);
  }
});

onBeforeUnmount(() => {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.removeEventListener("scroll", handleScroll);
  }
});
</script>

<template>
  <div>
    <div
      :class="[
        'fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-500',
        { '!top-6': state === 'open' }
      ]"
    >
      <!-- fond gradient derrière la barre -->
      <div
        class="absolute -top-6 left-0 right-1 h-screen bg-[linear-gradient(to_bottom_right,_var(--bg-from),_var(--bg-to))] pointer-events-none w-full"
        :style="{ mask: 'linear-gradient(to bottom, black 0px, black 65px, transparent 140px)' }"
      ></div>

      <div
        :class="[
          'px-0 w-full transition-all duration-500',
          { '!px-6': state === 'open' },
        ]"
      >
        <div
          :class="[
            'px-[24px] py-4 backdrop-blur-xl rounded-2xl w-full max-w-md mx-auto overflow-visible relative pointer-events-auto min-w-[255px] bg-[var(--card-bg)] border border-1 border-[var(--border)] transition-all duration-500',
            { '!bg-transparent !border-transparent !backdrop-blur-none': state === 'closed' }
          ]"
        >
          <!-- Header avec titre et icônes -->
          <div class="flex justify-between items-center">
            <h1
              ref="weekTitleButton"
              :class="[
                'font-bold tracking-tight flex items-center text-[var(--text-primary)] heading-[1.2] text-[18px] transition-all duration-500 cursor-pointer select-none',
                { '!text-[24px]': state === 'open' },
              ]"
              @click="toggleWeekPicker"
            >
              <span>{{ weekTitle }}</span>
              <svg
                class="w-4 h-4 ml-1.5 transition-transform"
                :class="{ 'rotate-180': showWeekPicker }"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <div
                class="w-6 h-6 p-1 ml-2 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                @click.stop="emit('refresh')"
              >
                <svg
                  title="Actualiser vos horaires"
                  class="w-full h-full hover:opacity-80 transition-opacity"
                  :style="{ color: 'var(--accent)' }"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"
                  />
                </svg>
              </div>
            </h1>
            <div class="flex items-center gap-3">
              <div
                @click="emit('openSettings')"
                class="w-6 h-6 p-1 cursor-pointer hover:scale-110 active:scale-95 transition-transform flex-shrink-0"
              >
                <svg
                  title="Réglages"
                  class="w-full h-full hover:opacity-80 transition-opacity"
                  :style="{ color: 'var(--accent)' }"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div
            :class="[
              'grid grid-cols-3 gap-4 h-0 transition-all duration-500',
              { '!h-[70px]': state === 'open' },
            ]"
          >
            <div
              :class="[
                'flex flex-col items-center mt-auto absolute left-6 top-16 opacity-0 transition-all duration-300',
                {
                  '!opacity-100': state === 'open',
                  'delay-200': state === 'open'
                },
              ]"
            >
              <div
                :class="[
                  'text-[4px] mb-1 text-[var(--accent)] transition-all duration-500',
                  { '!text-[12px]': state === 'open' },
                ]"
              >
                Effectif
              </div>
              <div
                :class="[
                  'text-[4px] font-bold text-[var(--text-primary)] transition-all duration-500',
                  { '!text-[20px]': state === 'open' }
                ]"
              >
                {{ totalEffective }}
              </div>
            </div>
            <div
              :class="[
                'flex flex-col items-center absolute space-y-1 translate-x-1/2 top-0 right-0 mr-[85px] mt-[12px] transition-all duration-500',
                { '!top-[65px] !mt-0 !right-1/2 !mr-0': state === 'open' },
              ]"
            >
              <div
                :class="[
                  'text-xs transition-all duration-500 text-[var(--text-tertiary)] mb-[-3.6px]',
                  { '!text-[var(--accent)] !mb-[4px]': state === 'open' },
                ]"
              >
                Restant
              </div>
              <div
                :class="[
                  'font-bold text-[var(--success)] transition-all duration-500 text-[14px]',
                  {
                    '!text-[var(--danger)]': remainingMinutes > 0,
                    '!text-[20px]': state === 'open',
                  },
                ]"
              >
                {{ minutesToTime(remainingMinutes) }}
              </div>
            </div>
            <div
              :class="[
                'flex flex-col items-center mt-auto absolute right-6 top-16 opacity-0 transition-all duration-300',
                { '!opacity-100 delay-200': state === 'open' },
              ]"
            >
              <div
                :class="[
                  'text-[4px] mb-1 text-[var(--accent)] transition-all duration-500',
                  { '!text-[12px]': state === 'open' },
                ]"
              >
                Payé
              </div>
              <div
                :class="[
                  'text-[4px] font-bold text-[var(--text-primary)] transition-all duration-500',
                  { '!text-[20px]': state === 'open' },
                ]"
              >
                {{ totalPaid }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Week Picker -->
    <WeekPicker
      :show="showWeekPicker"
      :selected-year="selectedYear"
      :selected-week="selectedWeek"
      :is-current-week-selected="isCurrentWeekSelected"
      :origin-rect="buttonRect"
      @close="showWeekPicker = false"
      @select-week="(year, week) => emit('select-week', year, week)"
      @go-to-current="emit('go-to-current')"
    />
  </div>
</template>
