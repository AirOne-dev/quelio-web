<template>
  <div
    class="fixed inset-0 flex justify-center items-center z-50"
    :style="{
      background: 'linear-gradient(to bottom right, var(--bg-from), var(--bg-to))'
    }"
  >
    <div class="w-10 h-10 rounded-full border-[3px] animate-spin border-[var(--accent-light)] border-t-[var(--accent)]"></div>
  </div>
</template>
