import type { UserPreferences, Credentials, ApiResponse } from '../types'
import { loadToken } from './storage'

/**
 * Get the session token for the current user
 */
function getToken(username: string): string | null {
  return loadToken(username)
}

/**
 * Login user and return API response
 * Uses token if available, otherwise uses credentials
 */
export async function loginUser(credentials: Credentials): Promise<ApiResponse> {
  const formData = new FormData()

  // Try to use token first if available
  const token = getToken(credentials.username)

  if (token && !credentials.password) {
    // Use token authentication
    formData.append('token', token)
  } else if (credentials.password) {
    // Use password authentication (first login or token expired)
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
  } else {
    throw new Error('No authentication method available')
  }

  formData.append('action', 'login')

  const response = await fetch('./api/', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    // Parse error response to check for token invalidation
    try {
      const errorData = await response.json()

      // If token was invalidated, throw specific error
      if (errorData.token_invalidated) {
        throw new Error('TOKEN_INVALIDATED')
      }
    } catch (e) {
      // If json parsing fails or TOKEN_INVALIDATED is thrown, re-throw
      if (e instanceof Error && e.message === 'TOKEN_INVALIDATED') {
        throw e
      }
    }

    // If token auth failed with 401, throw a specific error
    if (response.status === 401 && token && !credentials.password) {
      throw new Error('TOKEN_EXPIRED')
    }
    throw new Error('Identifiants invalides')
  }

  const responseData = await response.json()

  if (responseData.error && !responseData.error.includes('using cached data')) {
    throw new Error(responseData.error)
  }

  return responseData
}

/**
 * Update user preferences on the server
 */
export async function updateUserPreferences(
  username: string,
  preferences: Partial<UserPreferences>
): Promise<boolean> {
  try {
    const token = getToken(username)

    if (!token) {
      console.error('No valid token found')
      return false
    }

    const formData = new FormData()
    formData.append('action', 'update_preferences')
    formData.append('token', token)

    if (preferences.theme !== undefined) {
      formData.append('theme', preferences.theme)
    }

    if (preferences.minutes_objective !== undefined) {
      formData.append('minutes_objective', preferences.minutes_objective.toString())
    }

    const response = await fetch('./api/', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      // Parse error response to check for token invalidation
      try {
        const errorData = await response.json()

        // If token was invalidated, throw specific error
        if (errorData.token_invalidated) {
          throw new Error('TOKEN_INVALIDATED')
        }
      } catch (e) {
        // If json parsing fails or TOKEN_INVALIDATED is thrown, re-throw
        if (e instanceof Error && e.message === 'TOKEN_INVALIDATED') {
          throw e
        }
      }

      if (response.status === 401) {
        console.error('Token expired or invalid. Please login again.')
      } else {
        console.error('Failed to update preferences:', response.statusText)
      }
      return false
    }

    const data = await response.json()
    return data.success === true
  } catch (error) {
    // Re-throw TOKEN_INVALIDATED to trigger logout
    if (error instanceof Error && error.message === 'TOKEN_INVALIDATED') {
      throw error
    }
    console.error('Error updating preferences:', error)
    return false
  }
}
