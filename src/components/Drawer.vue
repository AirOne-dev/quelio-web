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
  if (!newVal) {
    translateY.value = 0
    isClosing.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        @click="handleClose"
      />
    </Transition>

    <Transition
      name="drawer"
      @before-enter="isClosing = false"
      @after-leave="translateY = 0"
    >
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-50 flex flex-col"
        :class="{ 'drawer-closing': isClosing }"
        :style="{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : isClosing ? 'transform 0.3s cubic-bezier(0.4, 0, 1, 1)' : 'none'
        }"
      >
        <!-- Drag handle area -->
        <div
          class="flex justify-center pt-4 pb-2 bg-gradient-to-b from-transparent to-white/5 cursor-grab active:cursor-grabbing"
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
        <div class="glass rounded-t-2xl p-6 flex flex-col max-h-[85vh] overflow-y-auto">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Enter animation */
.drawer-enter-active {
  animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

/* Leave animation */
.drawer-leave-active {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.drawer-closing {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
</style>
