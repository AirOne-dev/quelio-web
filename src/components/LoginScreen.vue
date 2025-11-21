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
        <h1 class="text-4xl font-bold mb-2">Quel io ?</h1>
        <p class="text-indigo-300">Suivez vos horaires, tout simplement</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 text-black">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm text-indigo-300">Nom d'utilisateur</label>
            <input
              type="text"
              :value="credentials.username"
              @input="updateUsername"
              class="bg-[#595e68] border border-white/10 backdrop-blur-md text-white transition-all duration-300 placeholder:text-white/50 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 w-full px-4 py-3 rounded-xl"
              :class="{'border-red-500': error}"
              placeholder="Votre nom d'utilisateur"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm text-indigo-300">Mot de passe</label>
            <input
              type="password"
              :value="credentials.password"
              @input="updatePassword"
              class="bg-[#595e68] border border-white/10 backdrop-blur-md text-white transition-all duration-300 placeholder:text-white/50 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 w-full px-4 py-3 rounded-xl"
              :class="{'border-red-500': error}"
              placeholder="Votre mot de passe"
            >
          </div>

          <div v-if="error" class="text-red-400 text-sm text-center">
            {{ error }}
          </div>

          <button
            type="submit"
            class="bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-300 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] active:translate-y-px w-full py-3 px-4 rounded-xl text-white font-medium"
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
