<script setup lang="ts">
import type { Credentials } from '../types'

interface Props {
  credentials: Credentials
  error: string | null
  loading: boolean
}

interface Emits {
  (e: 'update:credentials', value: Credentials): void
  (e: 'login'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateUsername = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:credentials', { ...props.credentials, username: target.value })
}

const updatePassword = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:credentials', { ...props.credentials, password: target.value })
}

const handleSubmit = () => {
  emit('login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md space-y-8 opacity-0 translate-y-5 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <!-- Logo/Title -->
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-2 text-[var(--text-primary)]">Quel io ?</h1>
        <p class="text-[var(--text-secondary)]">Suivez vos horaires, tout simplement</p>
      </div>

      <!-- Login Form -->
      <div class="backdrop-blur-xl rounded-2xl p-8 space-y-6 text-black bg-[var(--card-bg)] border border-[var(--border)]">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm text-[var(--text-secondary)]">Nom d'utilisateur</label>
            <input
              type="text"
              :value="credentials.username"
              @input="updateUsername"
              class="backdrop-blur-md transition-all duration-300 w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 bg-[#595e68] border text-[var(--text-primary)]"
              :class="{'border-red-500': error, 'border-[var(--border)]': !error}"
              placeholder="Votre nom d'utilisateur"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm text-[var(--text-secondary)]">Mot de passe</label>
            <input
              type="password"
              :value="credentials.password"
              @input="updatePassword"
              class="backdrop-blur-md transition-all duration-300 w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 bg-[#595e68] border text-[var(--text-primary)]"
              :class="{'border-red-500': error, 'border-[var(--border)]': !error}"
              placeholder="Votre mot de passe"
            >
          </div>

          <div v-if="error" class="text-sm text-center text-[var(--danger)]">
            {{ error }}
          </div>

          <button
            type="submit"
            class="transition-all duration-300 hover:-translate-y-px active:translate-y-px w-full py-3 px-4 rounded-xl font-medium text-[var(--text-primary)] shadow-[0_0_0_rgba(var(--accent-rgb),0.3)] hover:shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)]"
            :style="{
              background: 'linear-gradient(to right, var(--accent), var(--accent-hover))'
            }"
            :disabled="loading"
          >
            <span v-if="!loading">Se connecter</span>
            <span v-else>Connexion...</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
