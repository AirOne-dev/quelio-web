import { ref } from "vue";
import type { LogEntry } from "../types";

export function useDebugConsole() {
  const debugMode = ref(false),
    logs = ref<LogEntry[]>([]);

  let originalLog: typeof console.log,
    originalWarn: typeof console.warn,
    originalError: typeof console.error;

  const addLog = (type: "log" | "warn" | "error", args: unknown[]) => {
      const message = args
        .map((arg) => {
          try {
            return typeof arg === "object" ? JSON.stringify(arg) : String(arg);
          } catch (e) {
            return String(arg);
          }
        })
        .join(" ");

      logs.value.push({ type, message });

      const debugDiv = document.getElementById("debugDiv");
      if (debugDiv) {
        debugDiv.scrollTop = debugDiv.scrollHeight;
      }
    },
    setupDebugMode = () => {
      // Check URL for debug=1 parameter
      const urlParams = new URLSearchParams(window.location.search);
      debugMode.value = urlParams.get("debug") === "1";

      // Override console methods for debug mode
      originalLog = console.log;
      originalWarn = console.warn;
      originalError = console.error;

      console.log = (...args: unknown[]) => {
        addLog("log", args);
        originalLog.apply(console, args);
      };

      console.warn = (...args: unknown[]) => {
        addLog("warn", args);
        originalWarn.apply(console, args);
      };

      console.error = (...args: unknown[]) => {
        addLog("error", args);
        originalError.apply(console, args);
      };
    },
    cleanup = () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };

  return {
    debugMode,
    logs,
    setupDebugMode,
    cleanup,
  };
}
