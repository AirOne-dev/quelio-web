/**
 * Save data to localStorage with user-specific key
 */
export function saveToStorage(username: string, label: string, data: any): void {
  localStorage.setItem(`quelio_${label}_${username}`, JSON.stringify(data))
}

/**
 * Load data from localStorage with user-specific key
 */
export function loadFromStorage(username: string, label: string): any {
  const data = localStorage.getItem(`quelio_${label}_${username}`)
  return data ? JSON.parse(data) : null
}

/**
 * Remove data from localStorage with user-specific key
 */
export function removeFromStorage(username: string, label: string): void {
  localStorage.removeItem(`quelio_${label}_${username}`)
}

/**
 * Save current username to localStorage
 */
export function saveUsername(username: string): void {
  localStorage.setItem('quelio_username', username)
}

/**
 * Load current username from localStorage
 */
export function loadUsername(): string | null {
  return localStorage.getItem('quelio_username')
}

/**
 * Save user token to localStorage
 */
export function saveToken(username: string, token: string): void {
  localStorage.setItem(`quelio_token_${username}`, token)
}

/**
 * Load user token from localStorage
 */
export function loadToken(username: string): string | null {
  return localStorage.getItem(`quelio_token_${username}`)
}

/**
 * Remove user token from localStorage
 */
export function removeToken(username: string): void {
  localStorage.removeItem(`quelio_token_${username}`)
}
