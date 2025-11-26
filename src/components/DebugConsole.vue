<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import type { LogEntry } from "../types";

const props = defineProps<{
  logs: LogEntry[];
  debugMode: boolean;
  username: string;
}>();

// Position and size state
const position = ref({ x: 20, y: 20 }),
  size = ref({ width: 600, height: 400 }),
  isDragging = ref(false),
  isResizing = ref(false),
  dragStart = ref({ x: 0, y: 0 }),
  resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });

const loadSettings = () => {
  // Load saved position and size from localStorage
  const saved = localStorage.getItem(`quelio_debug_console_${props.username}`);
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      position.value = settings.position;
      size.value = settings.size;
    } catch (e) {
      console.error("Failed to load debug console settings:", e);
    }
  }
};

const saveSettings = () => {
    // Save position and size to localStorage
    const settings = {
      position: position.value,
      size: size.value,
    };
    localStorage.setItem(
      `quelio_debug_console_${props.username}`,
      JSON.stringify(settings)
    );
  },
  handleDragStart = (e: MouseEvent | TouchEvent) => {
    // Drag handlers (supporting both mouse and touch)
    isDragging.value = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStart.value = {
      x: clientX - position.value.x,
      y: clientY - position.value.y,
    };
    e.preventDefault();
  },
  handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    position.value = {
      x: clientX - dragStart.value.x,
      y: clientY - dragStart.value.y,
    };
  },
  handleDragEnd = () => {
    if (isDragging.value) {
      isDragging.value = false;
      saveSettings();
    }
  },
  handleResizeStart = (e: MouseEvent | TouchEvent) => {
    // Resize handlers (supporting both mouse and touch)
    isResizing.value = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    resizeStart.value = {
      x: clientX,
      y: clientY,
      width: size.value.width,
      height: size.value.height,
    };
    e.preventDefault();
  },
  handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing.value) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - resizeStart.value.x;
    const deltaY = clientY - resizeStart.value.y;

    size.value = {
      width: resizeStart.value.width + deltaX,
      height: resizeStart.value.height + deltaY,
    };
  },
  handleResizeEnd = () => {
    if (isResizing.value) {
      isResizing.value = false;
      saveSettings();
    }
  };

// Auto-scroll to bottom when new logs arrive
watch(
  () => props.logs.length,
  async () => {
    await nextTick();
    const debugDiv = document.getElementById("debugDiv");
    if (debugDiv) {
      debugDiv.scrollTop = debugDiv.scrollHeight;
    }
  }
);

// Global event listeners
onMounted(() => {
  loadSettings();

  // Mouse events
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("mousemove", handleResizeMove);
  document.addEventListener("mouseup", handleResizeEnd);

  // Touch events
  document.addEventListener("touchmove", handleDragMove);
  document.addEventListener("touchend", handleDragEnd);
  document.addEventListener("touchmove", handleResizeMove);
  document.addEventListener("touchend", handleResizeEnd);
});
</script>

<template>
  <div
    v-if="debugMode"
    id="debugConsole"
    class="fixed z-[9999] backdrop-blur-xl rounded-xl shadow-2xl flex flex-col bg-[rgba(17,24,39,0.95)] border border-[var(--border)]"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
    }"
  >
    <!-- Header (draggable) -->
    <div
      class="flex items-center justify-between px-4 py-3 cursor-move select-none border-b border-[var(--border)] bg-[var(--card-bg)]"
      @mousedown="handleDragStart"
      @touchstart="handleDragStart"
    >
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span class="text-sm font-semibold text-[var(--text-primary)]"
          >Console Debug</span
        >
        <span class="text-xs text-[var(--text-tertiary)]">({{ logs.length }} logs)</span>
      </div>
      <div class="text-xs select-none text-[var(--text-tertiary)]">
        Déplacer et redimensionner
      </div>
    </div>

    <!-- Logs content -->
    <div id="debugDiv" class="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="p-2 rounded border-l-2"
        :class="{
          'text-green-300 bg-green-500/5 border-green-500': log.type === 'log',
          'text-yellow-300 bg-yellow-500/5 border-yellow-500': log.type === 'warn',
          'text-red-300 bg-red-500/5 border-red-500': log.type === 'error',
        }"
      >
        <span class="opacity-60">[{{ log.type.toUpperCase() }}]</span> {{ log.message }}
      </div>
      <div v-if="logs.length === 0" class="text-center py-8 text-[var(--text-tertiary)]">
        Aucun log pour le moment
      </div>
    </div>

    <!-- Resize handle -->
    <div
      class="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize group"
      @mousedown="handleResizeStart"
      @touchstart="handleResizeStart"
    >
      <div
        class="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 transition-colors border-[var(--text-tertiary)]"
      />
    </div>
  </div>
</template>
