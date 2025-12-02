<script setup lang="ts">
import type { Credentials } from "../types";

const props = defineProps<{
    credentials: Credentials;
    error: string | null;
    loading: boolean;
  }>(),
  emit = defineEmits<{
    (e: "update:credentials", value: Credentials): void;
    (e: "login"): void;
  }>();

const updateUsername = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit("update:credentials", { ...props.credentials, username: target.value });
  },
  updatePassword = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit("update:credentials", { ...props.credentials, password: target.value });
  },
  handleSubmit = () => {
    emit("login");
  };
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between p-6 pb-8">
    <!-- Top section with logo and title -->
    <div
      class="flex-1 flex flex-col justify-center items-center opacity-0 translate-y-5"
    >
      <!-- App Icon -->
      <div class="mb-8 relative">
        <div
          class="w-20 h-20 rounded-[1.75rem] flex items-center justify-center shadow-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)]"
        >
          <svg
            class="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <!-- Glow effect -->
        <div
          class="absolute inset-0 w-20 h-20 rounded-[1.75rem] bg-[var(--accent)] opacity-20 blur-xl -z-10"
        ></div>
      </div>

      <!-- Title -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-3 text-[var(--text-primary)]">Quel io</h1>
        <p class="text-lg text-[var(--text-secondary)]">Suivez vos horaires</p>
      </div>

      <!-- Login Form -->
      <div class="w-full max-w-sm space-y-4">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Username input -->
          <div class="relative">
            <div
              class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              type="text"
              :value="credentials.username"
              @input="updateUsername"
              class="w-full pl-12 pr-4 py-4 rounded-2xl transition-all duration-200 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20"
              :class="{ '!border-[#EF4444] !ring-[#EF4444]': error }"
              placeholder="Nom d'utilisateur"
              autocomplete="username"
            />
          </div>

          <!-- Password input -->
          <div class="relative">
            <div
              class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              type="password"
              :value="credentials.password"
              @input="updatePassword"
              class="w-full pl-12 pr-4 py-4 rounded-2xl transition-all duration-200 bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20"
              :class="{ '!border-[#EF4444] !ring-[#EF4444]': error }"
              placeholder="Mot de passe"
              autocomplete="current-password"
            />
          </div>

          <!-- Error message -->
          <div
            v-if="error"
            class="flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]"
          >
            <svg
              class="w-5 h-5 text-[#EF4444] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm text-[#EF4444]">{{ error }}</span>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="w-full py-4 px-4 rounded-2xl font-semibold text-white text-lg transition-all duration-200 shadow-[0_4px_16px_rgba(var(--accent-rgb),0.25)] hover:shadow-[0_6px_24px_rgba(var(--accent-rgb),0.4)] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :style="{
              background: loading
                ? 'var(--accent)'
                : 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
            }"
            :disabled="loading"
          >
            <span v-if="!loading" class="flex items-center justify-center gap-2">
              <span>Se connecter</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Connexion...</span>
            </span>
          </button>
        </form>
      </div>
    </div>

    <!-- Bottom info text -->
    <div class="text-center opacity-0">
      <p class="text-sm text-[var(--text-tertiary)]">Connexion sécurisée avec Kelio</p>
    </div>
  </div>
</template>
