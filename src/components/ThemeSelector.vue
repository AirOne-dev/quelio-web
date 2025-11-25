<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTheme, type ThemeName } from '../composables/useTheme'

const { currentTheme, themes, setTheme } = useTheme()
const isOpen = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0, width: 0 })

const handleThemeChange = (themeName: ThemeName) => {
  setTheme(themeName)
  isOpen.value = false
}

const updatePosition = () => {
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width
    }
  }
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    updatePosition()
  }
}

const dropdownStyle = computed(() => ({
  top: dropdownPosition.value.top + 'px',
  left: dropdownPosition.value.left + 'px',
  width: dropdownPosition.value.width + 'px'
}))

onMounted(() => {
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>

<template>
  <div class="relative">
    <label class="text-sm font-medium block mb-2 text-[var(--text-secondary)]">
      Thème
    </label>

    <!-- Select Button -->
    <button
      ref="buttonRef"
      @click="toggleDropdown"
      class="w-full px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between backdrop-blur-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)]"
    >
      <div class="flex items-center gap-3">
        <!-- Current theme color preview -->
        <div class="flex gap-1">
          <div
            class="w-2.5 h-2.5 rounded-full"
            :style="{ background: themes[currentTheme].colors.primary }"
          />
          <div
            class="w-2.5 h-2.5 rounded-full"
            :style="{ background: themes[currentTheme].colors.secondary }"
          />
          <div
            class="w-2.5 h-2.5 rounded-full"
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Backdrop to close dropdown -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        @click="isOpen = false"
        class="fixed inset-0 z-[9998]"
      />
    </Teleport>

    <!-- Dropdown Menu -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-2"
      >
        <div
          v-if="isOpen"
          :style="dropdownStyle"
          class="fixed rounded-xl shadow-2xl overflow-hidden backdrop-blur-[20px] bg-[var(--card-bg)] border border-[var(--border)] z-[9999]"
        >
          <button
            v-for="theme in Object.values(themes)"
            :key="theme.name"
            @click="handleThemeChange(theme.name)"
            class="w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 relative"
            :class="currentTheme === theme.name ? 'bg-[var(--card-hover)]' : 'hover:bg-[var(--card-hover)]'"
          >
            <!-- Theme color preview -->
            <div class="flex gap-1">
              <div
                class="w-2.5 h-2.5 rounded-full"
                :style="{ background: theme.colors.primary }"
              />
              <div
                class="w-2.5 h-2.5 rounded-full"
                :style="{ background: theme.colors.secondary }"
              />
              <div
                class="w-2.5 h-2.5 rounded-full"
                :style="{ background: theme.colors.accent }"
              />
            </div>

            <!-- Theme name -->
            <span
              class="text-sm font-medium flex-1 text-left"
              :class="currentTheme === theme.name ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'"
            >
              {{ theme.label }}
            </span>

            <!-- Check icon for selected theme -->
            <svg
              v-if="currentTheme === theme.name"
              class="w-4 h-4 flex-shrink-0 text-[var(--accent)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
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
