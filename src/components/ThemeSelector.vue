<script setup lang="ts">
import { ref } from 'vue'
import { useTheme, type ThemeName } from '../composables/useTheme'
import Drawer from './drawer/Drawer.vue'

const { currentTheme, themes, setTheme } = useTheme(),
  isOpen = ref(false);

const handleThemeChange = (themeName: ThemeName) => {
    setTheme(themeName)
    isOpen.value = false
  },
  toggleDrawer = () => {
    isOpen.value = !isOpen.value
  };
</script>

<template>
  <div>
    <label class="text-sm font-medium block mb-2 text-[var(--text-secondary)]">
      Thème
    </label>

    <!-- Theme Button (opens bottom sheet) -->
    <button
      @click="toggleDrawer"
      class="w-full px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] cursor-pointer active:scale-[0.99]"
    >
      <div class="flex items-center gap-3">
        <!-- Current theme color preview -->
        <div class="flex gap-1.5">
          <div
            class="w-3 h-3 rounded-full ring-1 ring-black/10"
            :style="{ background: themes[currentTheme].colors.primary }"
          />
          <div
            class="w-3 h-3 rounded-full ring-1 ring-black/10"
            :style="{ background: themes[currentTheme].colors.secondary }"
          />
          <div
            class="w-3 h-3 rounded-full ring-1 ring-black/10"
            :style="{ background: themes[currentTheme].colors.accent }"
          />
        </div>
        <span class="text-sm font-medium">{{ themes[currentTheme].label }}</span>
      </div>

      <!-- Chevron icon -->
      <svg
        class="w-4 h-4 transition-transform duration-200 text-[var(--text-tertiary)]"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Drawer -->
    <Drawer :open="isOpen" @update:open="isOpen = $event">
      <div class="flex flex-col gap-6 pb-2">
        <!-- Header -->
        <div class="flex items-center justify-center relative -mt-2">
          <h2 class="text-2xl font-bold text-[var(--text-primary)]">Choisir un thème</h2>
        </div>

        <!-- Theme Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto w-full">
          <button
            v-for="theme in Object.values(themes)"
            :key="theme.name"
            @click="handleThemeChange(theme.name)"
            class="relative p-3 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer backdrop-blur-xl border-2"
            :class="
              currentTheme === theme.name
                ? 'bg-[var(--accent-light)] border-[var(--accent)] scale-[0.98]'
                : 'bg-[var(--card-bg)] border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--card-hover)] active:scale-[0.98]'
            "
          >
            <!-- Check icon for selected theme -->
            <div
              v-if="currentTheme === theme.name"
              class="absolute top-1.5 right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[var(--accent)] flex items-center justify-center"
            >
              <svg
                class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <!-- Theme color preview -->
            <div class="flex justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div
                class="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-2 ring-black/10"
                :style="{ background: theme.colors.primary }"
              />
              <div
                class="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-2 ring-black/10"
                :style="{ background: theme.colors.secondary }"
              />
              <div
                class="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-2 ring-black/10"
                :style="{ background: theme.colors.accent }"
              />
            </div>

            <!-- Theme name -->
            <div class="text-center">
              <span
                class="text-xs sm:text-sm font-semibold"
                :class="
                  currentTheme === theme.name
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-primary)]'
                "
              >
                {{ theme.label }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
