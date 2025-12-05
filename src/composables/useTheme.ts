import { ref } from "vue";
import { updateUserPreferences } from "../utils/api";
import { loadUsername, saveToStorage, loadFromStorage } from "../utils/storage";

export type ThemeName =
  | "midnight"
  | "light"
  | "abyss"
  | "ocean"
  | "forest"
  | "sunset"
  | "lavender";

export interface Theme {
  name: ThemeName;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Uniquement pour l'aperçu dans le sélecteur
export const themes: Record<ThemeName, Theme> = {
  midnight: {
    name: "midnight",
    label: "Midnight",
    colors: {
      primary: "#4F46E5",
      secondary: "#6366F1",
      accent: "#818CF8",
    },
  },
  light: {
    name: "light",
    label: "Light",
    colors: {
      primary: "#6366F1",
      secondary: "#818CF8",
      accent: "#A5B4FC",
    },
  },
  abyss: {
    name: "abyss",
    label: "Abyss",
    colors: {
      primary: "#3B82F6",
      secondary: "#60A5FA",
      accent: "#93C5FD",
    },
  },
  ocean: {
    name: "ocean",
    label: "Ocean",
    colors: {
      primary: "#0EA5E9",
      secondary: "#38BDF8",
      accent: "#7DD3FC",
    },
  },
  forest: {
    name: "forest",
    label: "Forest",
    colors: {
      primary: "#10B981",
      secondary: "#34D399",
      accent: "#6EE7B7",
    },
  },
  sunset: {
    name: "sunset",
    label: "Sunset",
    colors: {
      primary: "#F97316",
      secondary: "#FB923C",
      accent: "#FDBA74",
    },
  },
  lavender: {
    name: "lavender",
    label: "Lavender",
    colors: {
      primary: "#A855F7",
      secondary: "#C084FC",
      accent: "#D8B4FE",
    },
  },
};

// Background colors for each theme (for meta theme-color)
const themeBackgrounds: Record<ThemeName, string> = {
  midnight: "#1a1d29",
  light: "#F9FAFB",
  abyss: "#000000",
  ocean: "#1e293b",
  forest: "#1a1f1a",
  sunset: "#1f1d1a",
  lavender: "#1d1a24",
};

const currentTheme = ref<ThemeName>("midnight");
let currentStyleElement: HTMLStyleElement | null = null;

// Map des imports de thèmes
const themeModules: Record<ThemeName, () => Promise<{ default: string }>> = {
  midnight: () => import("../styles/themes/midnight.css?inline"),
  light: () => import("../styles/themes/light.css?inline"),
  abyss: () => import("../styles/themes/abyss.css?inline"),
  ocean: () => import("../styles/themes/ocean.css?inline"),
  forest: () => import("../styles/themes/forest.css?inline"),
  sunset: () => import("../styles/themes/sunset.css?inline"),
  lavender: () => import("../styles/themes/lavender.css?inline"),
};

export function useTheme() {
  const setTheme = async (themeName: ThemeName, saveToApi = true) => {
      currentTheme.value = themeName;

      // Charger dynamiquement le CSS du thème
      try {
        const themeModule = await themeModules[themeName]();
        const cssText = themeModule.default;

        // Supprimer l'ancien style
        if (currentStyleElement) {
          currentStyleElement.remove();
        }

        // Créer et injecter le nouveau style
        currentStyleElement = document.createElement("style");
        currentStyleElement.setAttribute("data-theme", themeName);
        currentStyleElement.textContent = cssText;
        document.head.appendChild(currentStyleElement);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector(
          'meta[name="theme-color"]'
        );
        if (metaThemeColor) {
          metaThemeColor.setAttribute("content", themeBackgrounds[themeName]);
        }

        // Get current theme colors
        const themeColors = themes[themeName].colors;
        const background = themeBackgrounds[themeName];

        // Remove # from colors for URL params
        const primary = themeColors.primary.replace("#", "");
        const secondary = themeColors.secondary.replace("#", "");
        const bg = background.replace("#", "");

        // Update manifest link with color parameters
        const manifestLink = document.querySelector(
          "#manifest-link"
        ) as HTMLLinkElement;
        if (manifestLink) {
          manifestLink.href = `./api/manifest.json?primary=${primary}&secondary=${secondary}&background=${bg}`;
        }

        // Update Apple Touch Icon with color parameters
        const appleIconLink = document.querySelector(
          "#apple-icon-link"
        ) as HTMLLinkElement;
        if (appleIconLink) {
          appleIconLink.href = `./api/icon.svg?primary=${primary}&secondary=${secondary}`;
        }

        // Update favicon with color parameters
        const faviconLink = document.querySelector(
          "#favicon-link"
        ) as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = `./api/icon.svg?primary=${primary}&secondary=${secondary}`;
        }

        // Sauvegarder dans l'API et localStorage
        const username = loadUsername();
        if (username) {
          saveToStorage(username, "theme", themeName);

          // Save to API if requested
          if (saveToApi) {
            await updateUserPreferences(username, { theme: themeName });
          }
        }
      } catch (error) {
        console.error(
          `Erreur lors du chargement du thème ${themeName}:`,
          error
        );
      }
    },
    loadTheme = async (serverTheme?: string) => {
      try {
        const username = loadUsername();

        if (username) {
          // Priority: server theme > localStorage > default
          const savedTheme = (serverTheme ||
            loadFromStorage(username, "theme")) as ThemeName;
          if (savedTheme && themes[savedTheme]) {
            await setTheme(savedTheme, false); // Don't save back to API when loading
          } else {
            await setTheme("midnight", false);
          }
        } else {
          // No username, use provided theme or default
          const themeToLoad =
            serverTheme && themes[serverTheme as ThemeName]
              ? (serverTheme as ThemeName)
              : "midnight";
          await setTheme(themeToLoad, false);
        }
      } catch (error) {
        console.error("Error loading theme, falling back to midnight:", error);
        // Last resort: try to load midnight theme
        try {
          await setTheme("midnight", false);
        } catch (fallbackError) {
          console.error(
            "Critical: Failed to load fallback theme:",
            fallbackError
          );
        }
      }
    };

  return {
    currentTheme,
    themes,
    setTheme,
    loadTheme,
  };
}
