<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import LoginScreen from './components/LoginScreen.vue'
import Dashboard from './components/Dashboard.vue'
import Loader from './components/Loader.vue'
import { useTheme } from './composables/useTheme'
import type { Credentials, ApiResponse, LogEntry } from './types'

// Initialize theme
const { loadTheme } = useTheme()

// State
const isAuthenticated = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const credentials = ref<Credentials>({
  username: '',
  password: ''
})
const offline = ref(false)
const data = ref<ApiResponse | null>(null)

// Debug mode data
const debugMode = ref(false)
const logs = ref<LogEntry[]>([])
let originalLog: typeof console.log
let originalWarn: typeof console.warn
let originalError: typeof console.error

// Methods
const login = async () => {
  loading.value = true
  error.value = null

  try {
    const formData = new FormData()
    formData.append('username', credentials.value.username)
    formData.append('password', credentials.value.password)

    const response = await fetch('./api/', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Identifiants invalides')
    }

    const responseData = await response.json()

    if (responseData.error) {
      if (responseData.error.includes('using cached data')) {
        offline.value = true
      } else {
        throw new Error(responseData.error)
      }
    }

    data.value = responseData
    isAuthenticated.value = true

    saveCredentials()

    // Save token to localStorage if provided
    if (responseData.token) {
      localStorage.setItem(`quelio_token_${credentials.value.username}`, responseData.token)
    }

    // Load theme and preferences from server
    loadTheme(responseData.preferences?.theme)
  } catch (err) {
    error.value = "Erreur de connexion. Vérifiez vos identifiants."
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

const logout = () => {
  isAuthenticated.value = false
  data.value = null
  clearCredentials()
}

const saveCredentials = () => {
  const encodedCredentials = btoa(JSON.stringify(credentials.value))
  document.cookie = `quelio_credentials=${encodedCredentials}; max-age=2592000; path=/; Secure; SameSite=Strict`
  // Save username to localStorage for theme persistence
  localStorage.setItem('quelio_username', credentials.value.username)
}

const clearCredentials = () => {
  document.cookie = 'quelio_credentials=; max-age=0; path=/;'
  // Clear username and token from localStorage
  const username = credentials.value.username
  localStorage.removeItem('quelio_username')
  if (username) {
    localStorage.removeItem(`quelio_token_${username}`)
  }
}

const loadCredentials = () => {
  const cookies = document.cookie.split(';')
  const credentialCookie = cookies.find(cookie => cookie.trim().startsWith('quelio_credentials='))

  if (credentialCookie) {
    try {
      const encodedCredentials = credentialCookie.split('=')[1]
      const decodedCredentials = JSON.parse(atob(encodedCredentials))
      credentials.value = decodedCredentials
      // Save username to localStorage for theme persistence
      localStorage.setItem('quelio_username', decodedCredentials.username)
      return true
    } catch (err) {
      console.error('Erreur lors du chargement des credentials:', err)
      return false
    }
  }
  return false
}

const autoLogin = async () => {
  if (loadCredentials()) {
    await login()
    // Theme is loaded inside login() with server preferences
  } else {
    loading.value = false
    // Load default theme
    loadTheme()
  }
}

const changeDebugMode = (value: boolean) => {
  debugMode.value = value
  localStorage.setItem(`quelio_debug_mode_${credentials.value.username}`, JSON.stringify(value))
}

const addLog = (type: 'log' | 'warn' | 'error', args: unknown[]) => {
  const message = args.map(arg => {
    try {
      return typeof arg === "object" ? JSON.stringify(arg) : String(arg)
    } catch (e) {
      return String(arg)
    }
  }).join(" ")

  logs.value.push({ type, message })

  const debugDiv = document.getElementById('debugDiv')
  if (debugDiv) {
    debugDiv.scrollTop = debugDiv.scrollHeight
  }
}

// Lifecycle hooks
onMounted(() => {
  autoLogin()

  const storedDebugMode = localStorage.getItem(`quelio_debug_mode_${credentials.value.username}`)
  if (storedDebugMode) {
    debugMode.value = JSON.parse(storedDebugMode)
  }

  // Override console methods for debug mode
  originalLog = console.log
  originalWarn = console.warn
  originalError = console.error

  console.log = (...args: unknown[]) => {
    addLog("log", args)
    originalLog.apply(console, args)
  }

  console.warn = (...args: unknown[]) => {
    addLog("warn", args)
    originalWarn.apply(console, args)
  }

  console.error = (...args: unknown[]) => {
    addLog("error", args)
    originalError.apply(console, args)
  }
})

onBeforeUnmount(() => {
  console.log = originalLog
  console.warn = originalWarn
  console.error = originalError
})
</script>

<template>
  <div>
    <!-- Loader -->
    <Loader v-if="loading" />

    <!-- Login Screen -->
    <LoginScreen
      v-if="!isAuthenticated && !loading"
      v-model:credentials="credentials"
      :error="error"
      :loading="loading"
      @login="login"
    />

    <!-- Main App -->
    <Dashboard
      v-if="isAuthenticated && !loading"
      :data="data!"
      :offline="offline"
      :credentials="credentials"
      :debug-mode="debugMode"
      :logs="logs"
      @logout="logout"
      @refresh="autoLogin"
      @update:debug-mode="changeDebugMode"
    />
  </div>
</template>
