import { ref } from "vue";
import { useTimeCalculations } from "./useTimeCalculations";

export function useAbsences(
  saveLocalStorage: (label: string, data: any) => void,
  loadLocalStorage: (label: string) => any
) {
  const missingDates = ref<string[]>([]);

  const markAbsent = (
      date: string,
      section: "day" | "morning" | "afternoon" = "day"
    ) => {
      let missing = loadLocalStorage("missing_dates") ?? [];
      // Remove old future-only filter - we want to keep all absences
      missing.push(section === "day" ? date : `${date} [-] ${section}`);
      saveLocalStorage("missing_dates", missing);
      missingDates.value = missing;
    },
    removeAbsent = (date: string) => {
      let missing = loadLocalStorage("missing_dates") ?? [];
      missing = missing.filter((d: string) => d.split(" [-] ")[0] !== date);
      saveLocalStorage("missing_dates", missing);
      missingDates.value = missing;
    },
    loadMissingDates = () => {
      missingDates.value = loadLocalStorage("missing_dates") ?? [];
    },
    isDayCardTransparent = (times: string[] | undefined, date: string, missing: string[] = missingDates.value) => {
      const { isPastDateOrWeekend } = useTimeCalculations();
      return (
        (!times && isPastDateOrWeekend(date)) ||
        missing.map((md) => md.split(" [-] ")[0]).includes(date)
      );
    },
    isDayCardHalfTransparent = (_times: string[] | undefined, date: string, missing: string[] = missingDates.value) => {
      return missing
        .filter((md) => md.split(" [-] ").length === 2)
        .map((md) => md.split(" [-] ")[0])
        .includes(date);
    };

  return {
    missingDates,
    markAbsent,
    removeAbsent,
    loadMissingDates,
    isDayCardTransparent,
    isDayCardHalfTransparent,
  };
}
