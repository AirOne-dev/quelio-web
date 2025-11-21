export function useLocalStorage(username: string) {
  const saveLocalStorage = (label: string, data: any) => {
    localStorage.setItem(`quelio_${label}_${username}`, JSON.stringify(data))
  }

  const loadLocalStorage = (label: string) => {
    const data = localStorage.getItem(`quelio_${label}_${username}`)
    return data ? JSON.parse(data) : null
  }

  return {
    saveLocalStorage,
    loadLocalStorage
  }
}
