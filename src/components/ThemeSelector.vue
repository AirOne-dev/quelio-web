<script setup lang="ts">
import { ref } from 'vue'
import { useTheme, type ThemeName } from '../composables/useTheme'

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
      class="w-full px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between backdrop-blur-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] cursor-pointer active:scale-[0.99]"
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

    <!-- Bottom Sheet -->
    <Teleport to="body">
      <!-- Backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          @click="isOpen = false"
          class="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm cursor-pointer"
        />
      </Transition>

      <!-- Bottom Sheet Content -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div
          v-if="isOpen"
          class="fixed bottom-0 left-0 right-0 z-[10001] backdrop-blur-xl bg-[var(--card-bg)] border-t border-[var(--border)] rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]"
          >
            <h3 class="text-lg font-semibold text-[var(--text-primary)]">
              Choisir un thème
            </h3>
            <button
              @click="isOpen = false"
              class="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-[var(--card-hover)] active:scale-95"
            >
              <svg
                class="w-5 h-5 text-[var(--text-secondary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Theme Grid -->
          <div class="overflow-y-auto p-6">
            <div class="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <button
                v-for="theme in Object.values(themes)"
                :key="theme.name"
                @click="handleThemeChange(theme.name)"
                class="relative p-4 rounded-2xl transition-all duration-200 cursor-pointer backdrop-blur-xl border-2"
                :class="
                  currentTheme === theme.name
                    ? 'bg-[var(--accent-light)] border-[var(--accent)] scale-[0.98]'
                    : 'bg-[var(--card-bg)] border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--card-hover)] active:scale-[0.98]'
                "
              >
                <!-- Check icon for selected theme -->
                <div
                  v-if="currentTheme === theme.name"
                  class="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center"
                >
                  <svg
                    class="w-3 h-3 text-white"
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
                <div class="flex justify-center gap-2 mb-3">
                  <div
                    class="w-6 h-6 rounded-full ring-2 ring-black/10"
                    :style="{ background: theme.colors.primary }"
                  />
                  <div
                    class="w-6 h-6 rounded-full ring-2 ring-black/10"
                    :style="{ background: theme.colors.secondary }"
                  />
                  <div
                    class="w-6 h-6 rounded-full ring-2 ring-black/10"
                    :style="{ background: theme.colors.accent }"
                  />
                </div>

                <!-- Theme name -->
                <div class="text-center">
                  <span
                    class="text-sm font-semibold"
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
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
