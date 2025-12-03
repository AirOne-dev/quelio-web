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

  const saveCredentials = () => {
    const encodedCredentials = btoa(JSON.stringify(credentials.value))
    document.cookie = `quelio_credentials=${encodedCredentials}; max-age=2592000; path=/; Secure; SameSite=Strict`
    saveUsername(credentials.value.username)
  }

  const clearCredentials = () => {
    document.cookie = 'quelio_credentials=; max-age=0; path=/;'
    const username = credentials.value.username
    removeUsername()
    if (username) {
      removeToken(username)
    }
  }

  const loadCredentials = (): boolean => {
    const cookies = document.cookie.split(';')
    const credentialCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('quelio_credentials=')
    )

    if (credentialCookie) {
      try {
        const encodedCredentials = credentialCookie.split('=')[1]
        const decodedCredentials = JSON.parse(atob(encodedCredentials))
        credentials.value = decodedCredentials
        saveUsername(decodedCredentials.username)
        return true
      } catch (err) {
        console.error('Erreur lors du chargement des credentials:', err)
        return false
      }
    }
    return false
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

      saveCredentials()

      if (responseData.token) {
        saveToken(credentials.value.username, responseData.token)
      }

      loadTheme(responseData.preferences?.theme)
    } catch (err) {
      error.value = 'Erreur de connexion. Vérifiez vos identifiants.'
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

  const autoLogin = async () => {
    if (loadCredentials()) {
      await login()
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
