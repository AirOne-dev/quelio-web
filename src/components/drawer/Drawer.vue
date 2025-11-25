<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDragging = ref(false)
const startY = ref(0)
const currentY = ref(0)
const translateY = ref(0)
const isClosing = ref(false)
const isAnimating = ref(false)

const handleClose = () => {
  isClosing.value = true
  // Wait for animation to complete before emitting close
  setTimeout(() => {
    emit('update:open', false)
    isClosing.value = false
  }, 300) // Match animation duration
}

const handleDragStart = (e: TouchEvent | MouseEvent) => {
  isDragging.value = true
  startY.value = 'touches' in e ? e.touches[0].clientY : e.clientY
  currentY.value = startY.value
}

const handleDragMove = (e: TouchEvent | MouseEvent) => {
  if (!isDragging.value) return

  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const deltaY = clientY - startY.value

  // Only allow dragging down
  if (deltaY > 0) {
    translateY.value = deltaY
    currentY.value = clientY
  }
}

const handleDragEnd = () => {
  if (!isDragging.value) return

  isDragging.value = false

  // If dragged more than 150px, close the drawer
  if (translateY.value > 150) {
    handleClose()
  }

  translateY.value = 0
}

// Reset translateY when drawer opens/closes
watch(() => props.open, (newVal) => {
  if (newVal) {
    isAnimating.value = true
    // Use requestAnimationFrame for instant visual update
    requestAnimationFrame(() => {
      isAnimating.value = false
    })
  } else {
    translateY.value = 0
    isClosing.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      :class="isAnimating || isClosing ? 'opacity-0' : 'opacity-100'"
      @click="handleClose"
    />

    <!-- Drawer -->
    <div
      v-if="open"
      class="fixed inset-x-0 bottom-0 z-50 flex flex-col transition-transform duration-[400ms]"
      :style="{
        transform: isClosing ? 'translateY(100%)' : isAnimating ? 'translateY(100%)' : `translateY(${translateY}px)`,
        transitionTimingFunction: isClosing ? 'cubic-bezier(0.32, 0.72, 0, 1)' : 'cubic-bezier(0.32, 0.72, 0, 1)',
        transitionDuration: isDragging ? '0ms' : isClosing ? '500ms' : '400ms'
      }"
    >
      <div class="absolute h-[50px] top-0 w-full bg-gradient-to-b from-transparent to-white/5">
      </div>
      <!-- Drag handle area -->
      <div
        class="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
        @mousedown="handleDragStart"
        @touchstart="handleDragStart"
        @mousemove="handleDragMove"
        @touchmove="handleDragMove"
        @mouseup="handleDragEnd"
        @touchend="handleDragEnd"
        @mouseleave="handleDragEnd"
      >
        <div class="w-12 h-1.5 rounded-full bg-white/30 backdrop-blur" />
      </div>

      <!-- Content -->
      <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-t-2xl p-6 flex flex-col max-h-[85vh] overflow-y-auto">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
