import type { UserPreferences } from '../types'

/**
 * Get the session token for the current user
 */
function getToken(username: string): string | null {
  return localStorage.getItem(`quelio_token_${username}`)
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
    formData.append('username', username)
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
    console.error('Error updating preferences:', error)
    return false
  }
}
