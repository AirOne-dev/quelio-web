import { ref } from 'vue'

export type ThemeName = 'midnight' | 'light' | 'abyss' | 'ocean' | 'forest' | 'sunset' | 'lavender'

export interface Theme {
  name: ThemeName
  label: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

// Uniquement pour l'aperçu dans le sélecteur
export const themes: Record<ThemeName, Theme> = {
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    colors: {
      primary: '#4F46E5',
      secondary: '#6366F1',
      accent: '#818CF8'
    }
  },
  light: {
    name: 'light',
    label: 'Light',
    colors: {
      primary: '#6366F1',
      secondary: '#818CF8',
      accent: '#A5B4FC'
    }
  },
  abyss: {
    name: 'abyss',
    label: 'Abyss',
    colors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#93C5FD'
    }
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#7DD3FC'
    }
  },
  forest: {
    name: 'forest',
    label: 'Forest',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7'
    }
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    colors: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FDBA74'
    }
  },
  lavender: {
    name: 'lavender',
    label: 'Lavender',
    colors: {
      primary: '#A855F7',
      secondary: '#C084FC',
      accent: '#D8B4FE'
    }
  }
}

const currentTheme = ref<ThemeName>('midnight')
let currentStyleElement: HTMLStyleElement | null = null

// Map des imports de thèmes
const themeModules: Record<ThemeName, () => Promise<{ default: string }>> = {
  midnight: () => import('../styles/themes/midnight.css?inline'),
  light: () => import('../styles/themes/light.css?inline'),
  abyss: () => import('../styles/themes/abyss.css?inline'),
  ocean: () => import('../styles/themes/ocean.css?inline'),
  forest: () => import('../styles/themes/forest.css?inline'),
  sunset: () => import('../styles/themes/sunset.css?inline'),
  lavender: () => import('../styles/themes/lavender.css?inline')
}

export function useTheme() {
  const setTheme = async (themeName: ThemeName) => {
    currentTheme.value = themeName

    // Charger dynamiquement le CSS du thème
    try {
      const themeModule = await themeModules[themeName]()
      const cssText = themeModule.default

      // Supprimer l'ancien style
      if (currentStyleElement) {
        currentStyleElement.remove()
      }

      // Créer et injecter le nouveau style
      currentStyleElement = document.createElement('style')
      currentStyleElement.setAttribute('data-theme', themeName)
      currentStyleElement.textContent = cssText
      document.head.appendChild(currentStyleElement)

      // Sauvegarder dans localStorage
      const username = localStorage.getItem('quelio_username')
      if (username) {
        localStorage.setItem(`quelio_theme_${username}`, themeName)
      }
    } catch (error) {
      console.error(`Erreur lors du chargement du thème ${themeName}:`, error)
    }
  }

  const loadTheme = () => {
    const username = localStorage.getItem('quelio_username')
    if (username) {
      const savedTheme = localStorage.getItem(`quelio_theme_${username}`) as ThemeName
      if (savedTheme && themes[savedTheme]) {
        setTheme(savedTheme)
      } else {
        setTheme('midnight')
      }
    } else {
      setTheme('midnight')
    }
  }

  return {
    currentTheme,
    themes,
    setTheme,
    loadTheme
  }
}
