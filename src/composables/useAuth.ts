import { ref } from "vue";
import { useTheme } from "./useTheme";
import { loginUser } from "../utils/api";
import {
  saveUsername,
  saveToken,
  removeToken,
  loadUsername,
  loadToken,
} from "../utils/storage";
import type { Credentials, ApiResponse } from "../types";

export function useAuth() {
  const { loadTheme } = useTheme();

  const isAuthenticated = ref(false),
    loading = ref(true),
    error = ref<string | null>(null),
    credentials = ref<Credentials>({
      username: "",
      password: "",
    }),
    offline = ref(false),
    data = ref<ApiResponse | null>(null);

  const clearSession = () => {
      const username = credentials.value.username;

      if (username) {
        removeToken(username);
      }
      credentials.value.password = "";
    },
    cleanupOldCredentials = () => {
      document.cookie = "quelio_credentials=; max-age=0; path=/;";
    },
    login = async () => {
      loading.value = true;
      error.value = null;

      try {
        const responseData = await loginUser(credentials.value);

        if (responseData.error?.includes("using cached data")) {
          offline.value = true;
        }

        data.value = responseData;
        isAuthenticated.value = true;

        // Save username
        saveUsername(credentials.value.username);

        // Save token for future requests
        if (responseData.token) {
          saveToken(credentials.value.username, responseData.token);
        }

        // Clear password from memory after successful login
        credentials.value.password = "";

        await loadTheme(responseData.preferences?.theme);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";

        if (errorMessage === "TOKEN_INVALIDATED") {
          error.value = "Votre session a été invalidée suite à une erreur. Veuillez vous reconnecter.";
          clearSession();
        } else if (errorMessage === "TOKEN_EXPIRED") {
          error.value = "Session expirée. Veuillez vous reconnecter.";
        } else {
          error.value = "Erreur de connexion. Vérifiez vos identifiants.";
        }

        console.error("Erreur:", err);
      } finally {
        loading.value = false;
      }
    },
    logout = () => {
      isAuthenticated.value = false;
      data.value = null;
      clearSession();
    },
    autoLogin = async () => {
      // Clean up old insecure credentials from previous version
      cleanupOldCredentials();

      // Try to auto-login with stored token (no password needed)
      const username = loadUsername();

      if (username) {
        const token = loadToken(username);
        credentials.value.username = username;

        if (token) {
          try {
            await login();
          } catch (err) {
            clearSession();
          }
        }
      }

      loading.value = false;
    };

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
  };
}
