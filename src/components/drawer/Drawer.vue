<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  open: boolean;
}>();
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const isDragging = ref(false),
  startY = ref(0),
  currentY = ref(0),
  translateY = ref(0),
  isClosing = ref(false),
  isAnimating = ref(false),
  shouldShowBackdrop = ref(false);

// Global counter for open drawers
if (!(window as any).__drawerCount) {
  (window as any).__drawerCount = 0;
}

const updateAppScale = (progress: number) => {
    // progress: 0 = drawer open (scale 0.98), 1 = drawer closed (scale 1)
    const appElement = document.getElementById("app");
    if (appElement) {
      const scale = 0.95 + (0.05 * progress); // 0.98 to 1
      const borderRadius = 12 * (1 - progress); // 12px to 0px

      appElement.style.transform = `scale(${scale})`;
      appElement.style.borderRadius = `${borderRadius}px`;
      appElement.style.overflow = progress < 1 ? "hidden" : "";
    }
  };

const handleClose = () => {
    isClosing.value = true;
    const appElement = document.getElementById("app");

    // Only update scale if this will be the last drawer closing
    // We need to check if count will be 0 after this drawer closes
    if ((window as any).__drawerCount === 1) {
      if (appElement) {
        appElement.style.transition = "transform 500ms cubic-bezier(0.32, 0.72, 0, 1), border-radius 500ms cubic-bezier(0.32, 0.72, 0, 1)";
      }
      updateAppScale(1); // Scale back to 1
    }

    // Wait for animation to complete before emitting close
    setTimeout(() => {
      emit("update:open", false);
      isClosing.value = false;
    }, 500); // Match animation duration
  },
  handleDragStart = (e: TouchEvent | MouseEvent) => {
    isDragging.value = true;
    startY.value = "touches" in e ? e.touches[0].clientY : e.clientY;
    currentY.value = startY.value;

    // Remove transition for smooth real-time dragging
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.style.transition = "none";
    }
  },
  handleDragMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging.value) return;

    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startY.value;

    // Only allow dragging down
    if (deltaY > 0) {
      translateY.value = deltaY;
      currentY.value = clientY;

      // Calculate progress based on drag distance (max 300px for full scale)
      const progress = Math.min(deltaY / 300, 1);
      updateAppScale(progress);
    }
  },
  handleDragEnd = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    // Restore transition
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.style.transition = "transform 400ms cubic-bezier(0.32, 0.72, 0, 1), border-radius 400ms cubic-bezier(0.32, 0.72, 0, 1)";
    }

    // If dragged more than 150px, close the drawer
    if (translateY.value > 150) {
      handleClose();
    } else {
      // Return to open state
      updateAppScale(0);
    }

    translateY.value = 0;
  };

// Reset translateY when drawer opens/closes and add scale effect to #app
watch(
  () => props.open,
  (newVal) => {
    const appElement = document.getElementById("app");

    if (newVal) {
      // Increment drawer count
      (window as any).__drawerCount++;

      isAnimating.value = true;
      // Add scale effect to #app only if this is the first drawer
      if ((window as any).__drawerCount === 1) {
        shouldShowBackdrop.value = true;
        if (appElement) {
          appElement.style.transition = "transform 400ms cubic-bezier(0.32, 0.72, 0, 1), border-radius 400ms cubic-bezier(0.32, 0.72, 0, 1)";
        }
        updateAppScale(0); // Scale to 0.98
      }
      // Use requestAnimationFrame for instant visual update
      requestAnimationFrame(() => {
        isAnimating.value = false;
      });
    } else {
      // Decrement drawer count
      (window as any).__drawerCount--;

      translateY.value = 0;
      isClosing.value = false;
      // Remove scale effect from #app only if no more drawers are open
      if ((window as any).__drawerCount === 0) {
        shouldShowBackdrop.value = false;
        if (appElement) {
          appElement.style.transition = "transform 500ms cubic-bezier(0.32, 0.72, 0, 1), border-radius 500ms cubic-bezier(0.32, 0.72, 0, 1)";
        }
        updateAppScale(1); // Scale to 1
      }
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop - only render for the first drawer -->
    <div
      v-if="open"
      :class="[
        'fixed inset-0 z-[9999] transition-opacity duration-300 cursor-pointer',
        shouldShowBackdrop && 'bg-[rgba(0,0,0,0.4)]',
        isAnimating || isClosing ? 'opacity-0' : 'opacity-100',
      ]"
      @click="handleClose"
    />

    <!-- Drawer -->
    <div
      v-if="open"
      class="fixed inset-x-0 bottom-0 z-[9999] flex flex-col transition-transform duration-[400ms] cursor-grab active:cursor-grabbing"
      :style="{
        transform: isClosing
          ? 'translateY(100%)'
          : isAnimating
          ? 'translateY(100%)'
          : `translateY(${translateY}px)`,
        transitionTimingFunction: isClosing
          ? 'cubic-bezier(0.32, 0.72, 0, 1)'
          : 'cubic-bezier(0.32, 0.72, 0, 1)',
        transitionDuration: isDragging ? '0ms' : isClosing ? '500ms' : '400ms',
      }"
      @mousedown="handleDragStart"
      @touchstart="handleDragStart"
      @mousemove="handleDragMove"
      @touchmove="handleDragMove"
      @mouseup="handleDragEnd"
      @touchend="handleDragEnd"
      @mouseleave="handleDragEnd"
    >
      <div
        class="absolute h-[50px] top-0 w-full"
        :style="{
          background: 'linear-gradient(to bottom, transparent, var(--card-bg))',
        }"
      ></div>
      <!-- Drag handle area -->
      <div
        class="flex justify-center pt-4 pb-2"
      >
        <div class="w-12 h-1.5 rounded-full backdrop-blur bg-[var(--text-tertiary)]" />
      </div>

      <!-- Content -->
      <div
        class="backdrop-blur-xl rounded-t-2xl p-6 flex flex-col max-h-[85vh] overflow-y-auto bg-[var(--card-bg)] border-t border-x border-[var(--border)]"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>
