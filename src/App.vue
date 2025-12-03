<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import LoginScreen from "./components/LoginScreen.vue";
import Dashboard from "./components/Dashboard.vue";
import Loader from "./components/Loader.vue";
import { useAuth } from "./composables/useAuth";
import { useDebugConsole } from "./composables/useDebugConsole";

const {
  isAuthenticated,
  loading,
  error,
  credentials,
  offline,
  data,
  login,
  logout,
  autoLogin,
} = useAuth();

const { debugMode, logs, setupDebugMode, cleanup } = useDebugConsole();

onMounted(() => {
  setupDebugMode();
  autoLogin();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <!-- Loader -->
  <Loader v-if="loading" />

  <!-- Login Screen -->
  <LoginScreen
    v-else-if="!isAuthenticated"
    v-model:credentials="credentials"
    :error="error"
    :loading="loading"
    @login="login"
  />

  <!-- Main App -->
  <Dashboard
    v-else
    :data="data!"
    :offline="offline"
    :credentials="credentials"
    :debug-mode="debugMode"
    :logs="logs"
    @logout="logout"
    @refresh="autoLogin"
  />
</template>
