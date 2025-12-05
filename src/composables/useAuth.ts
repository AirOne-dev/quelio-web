import { ref } from 'vue'
import { useTheme } from './useTheme'
import { loginUser } from '../utils/api'
import { saveUsername, removeUsername, saveToken, removeToken } from '../utils/storage'
import type { Credentials, ApiResponse } from '../types'

export function useAuth() {
  const { loadTheme } = useTheme()

  const isAuthenticated = ref(false)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const credentials = ref<Credentials>({
    username: '',
    password: '',
  })
  const offline = ref(false)
  const data = ref<ApiResponse | null>(null)

  const saveSession = () => {
    // Only save username, never save password
    saveUsername(credentials.value.username)
  }

  const clearSession = () => {
    const username = credentials.value.username
    removeUsername()
    if (username) {
      removeToken(username)
    }
    credentials.value = { username: '', password: '' }
  }

  // Clean up old insecure credential cookies (migration)
  const cleanupOldCredentials = () => {
    document.cookie = 'quelio_credentials=; max-age=0; path=/;'
  }

  const login = async () => {
    loading.value = true
    error.value = null

    try {
      const responseData = await loginUser(credentials.value)

      if (responseData.error?.includes('using cached data')) {
        offline.value = true
      }

      data.value = responseData
      isAuthenticated.value = true

      // Save session (username only)
      saveSession()

      // Save token for future requests
      if (responseData.token) {
        saveToken(credentials.value.username, responseData.token)
      }

      // Clear password from memory after successful login
      credentials.value.password = ''

      loadTheme(responseData.preferences?.theme)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      if (errorMessage === 'TOKEN_EXPIRED') {
        error.value = 'Session expirée. Veuillez vous reconnecter.'
      } else {
        error.value = 'Erreur de connexion. Vérifiez vos identifiants.'
      }

      console.error('Erreur:', err)
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    isAuthenticated.value = false
    data.value = null
    clearSession()
  }

  const autoLogin = async () => {
    // Clean up old insecure credentials from previous version
    cleanupOldCredentials()

    // Try to auto-login with stored token (no password needed)
    const storedUsername = localStorage.getItem('quelio_username')

    if (storedUsername) {
      credentials.value.username = storedUsername
      // Don't set password - loginUser will use token instead

      try {
        await login()
      } catch (err) {
        // Token expired or invalid, show login screen
        loading.value = false
        loadTheme()
      }
    } else {
      loading.value = false
      loadTheme()
    }
  }

  return {
    isAuthenticated,
    loading,
    error,
    credentials,
    offline,
    data,
    login,
    logout,
    autoLogin,
  }
}
