<script setup lang="ts">
interface Props {
  offline: boolean
}

defineProps<Props>()
</script>

<template>
  <div v-if="offline" class="fixed top-0 inset-x-0 z-[9999]">
    <div class="backdrop-blur text-sm bg-[rgba(var(--warning-rgb),0.2)] text-[var(--warning)] border-b border-[rgba(var(--warning-rgb),0.4)]">
      <div class="max-w-md mx-auto px-4 py-2 flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
          <path fill="currentColor" d="M256 32c-17.7 0-33.9 9.5-42.7 24.9L9.4 438.6C.3 454.4 0 473 8.7 489.1S33.2 512 51.4 512H460.6c18.2 0 34.8-9.9 42.7-25.9s7.5-35.1-1.6-50.9L298.7 56.9C289.9 41.5 273.7 32 256 32zM280 392c0 13.3-10.7 24-24 24s-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24zm-8-200l-8 136c-.6 10.5-9.3 18.7-19.8 18.1s-18.7-9.3-18.1-19.8l8-136c.6-10.5 9.3-18.7 19.8-18.1s18.7 9.3 18.1 19.8z"/>
        </svg>
        <span>
          Impossible de récupérer les informations de <strong>Kelio</strong>.
          Les données affichées sont celles sauvegardées lors de la dernière ouverture de l'app.
        </span>
      </div>
    </div>
  </div>
</template>
