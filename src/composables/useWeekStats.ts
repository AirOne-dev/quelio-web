import { computed, type Ref } from "vue";
import { useTimeCalculations } from "./useTimeCalculations";
import { getCurrentWeekHours, getCurrentWeekTotalEffective, getCurrentWeekTotalPaid } from "../utils/weekHelpers";
import type { ApiResponse, DayData } from "../types";

export function useWeekStats(
  data: Ref<ApiResponse>,
  missingDates: Ref<string[]>,
  minutesObjective: Ref<number>
) {
  const { timeToMinutes, getCurrentWeekDates } = useTimeCalculations();

  const days = computed(() => {
      // Jours de la semaine avec détection des absences
      const daysObj: Record<string, string[]> = {};
      const today = new Date();
      const todayObj = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const currentWeekHours = data.value ? getCurrentWeekHours(data.value) : {};

      // Always populate all days of the week, even if no data yet
      for (const date of getCurrentWeekDates()) {
        // Ensure we always have an array (empty if no data)
        daysObj[date] = currentWeekHours[date] || [];
        const [day, month, year] = date.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);
        if (
          dateObj < todayObj &&
          !missingDates.value
            .map((md) => md.split(" [-] ")[0])
            .includes(date) &&
          !currentWeekHours[date]
        ) {
          missingDates.value.push(date);
        }
      }

      return daysObj;
    }),
    daysData = computed<DayData[]>(() => {
      // Données structurées des jours
      return Object.entries(days.value).map(([date, times]) => {
        const isAbsent = missingDates.value.some(
          (md) => md.split(" [-] ")[0] === date
        );
        return {
          date,
          dayName: getDayName(date),
          totalMinutes: times ? getDayTotalMinutes(times) : 0,
          present: !isAbsent,
          timeBlocks: times || [],
          minutesObjective: minutesObjective.value,
        };
      });
    }),
    workedDays = computed(() => {
      // Nombre de jours travaillés
      return daysData.value.filter(
        (day) => day.present && day.timeBlocks.length > 0
      ).length;
    }),
    dailyAverage = computed(() => {
      // Moyenne journalière (jours passés uniquement)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pastDays = daysData.value.filter((day) => {
        if (!day.present || day.timeBlocks.length === 0) return false;

        const [d, m, y] = day.date.split("-").map(Number);
        const dayDate = new Date(y, m - 1, d);
        dayDate.setHours(0, 0, 0, 0);

        return dayDate < today;
      });

      if (pastDays.length === 0) {
        return convertTimeToMinutes(getCurrentWeekTotalEffective(data.value));
      }

      const pastDaysTotal = pastDays.reduce(
        (sum, day) => sum + day.totalMinutes,
        0
      );
      return Math.round(pastDaysTotal / pastDays.length);
    }),
    mostProductiveDay = computed(() => {
      // Jour le plus productif
      const presentDays = daysData.value.filter((day) => day.present);
      if (presentDays.length === 0) return null;

      return presentDays.reduce((max, day) =>
        day.totalMinutes > max.totalMinutes ? day : max
      );
    }),
    progressPercentage = computed(() => {
      // Progression vers l'objectif (basé sur total_paid)
      const objective = minutesObjective.value || 2100;
      if (objective === 0) return 0;
      const totalPaidMinutes = convertTimeToMinutes(getCurrentWeekTotalPaid(data.value));
      return Math.min(100, Math.round((totalPaidMinutes / objective) * 100));
    }),
    statusEmoji = computed(() => {
      // Emoji de statut
      if (progressPercentage.value >= 100) return "🎉";
      if (progressPercentage.value >= 80) return "🔥";
      if (progressPercentage.value >= 60) return "💪";
      if (progressPercentage.value >= 40) return "⚡";
      return "🚀";
    });

  const convertTimeToMinutes = (time: string): number => {
      // Convertir HH:MM en minutes
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    },
    getDayTotalMinutes = (times: string[]): number => {
      // Calculer le total des minutes pour un jour
      let total = 0;
      for (let i = 0; i < times.length; i += 2) {
        const duration =
          Math.max(
            timeToMinutes("08:30"),
            Math.min(
              timeToMinutes(
                times[i + 1] ??
                  new Date().toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
              ),
              timeToMinutes("18:30")
            )
          ) -
          Math.max(
            timeToMinutes("08:30"),
            Math.min(timeToMinutes(times[i]), timeToMinutes("18:30"))
          );
        total += duration;
      }
      return total;
    },
    getDayName = (date: string): string => {
      // Obtenir le nom du jour
      const [day, month, year] = date.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayNames = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ];
      return dayNames[dateObj.getDay()];
    };

  return {
    days,
    daysData,
    workedDays,
    dailyAverage,
    mostProductiveDay,
    progressPercentage,
    statusEmoji,
  };
}
