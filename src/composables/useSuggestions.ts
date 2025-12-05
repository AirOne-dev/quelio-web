import { ref, computed, type Ref } from "vue";
import type { CustomBornesForSuggestions } from "../types";
import { useTimeCalculations } from "./useTimeCalculations";

export function useSuggestions(
  days: Ref<Record<string, string[]>>,
  daysLeft: Ref<string[] | null>,
  remainingMinutes: Ref<number>,
  saveLocalStorage: (label: string, data: any) => void,
  loadLocalStorage: (label: string) => any
) {
  const {
    timeToMinutes,
    minutesToTime,
    getDayTotal,
    formatDataDate,
    getCurrentWeekDates,
    withDefaultMaxBornes,
    withDefaultMinBornes,
    suggestStartHour,
    hasAlreadyLunchBreak,
    getBornesTime,
  } = useTimeCalculations();

  const customBornesForSuggestions = ref<CustomBornesForSuggestions>({}),
    selectedSuggestedBlock = ref<string | null>(null);

  const maxTimeLeft = computed((): Record<string, number> => {
      if (!daysLeft.value) {
        return {};
      }
      const now = new Date();
      const hourNow = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const today = formatDataDate(now);

      const result = daysLeft.value.reduce((acc, date) => {
        const customBornes = withDefaultMaxBornes(
          customBornesForSuggestions.value[date]
        );
        if (date === today && days.value[date]) {
          const hours = [...days.value[date]];
          if (hours.length % 2) {
            hours.push(hourNow);
          }
          const startHourAfterNow = suggestStartHour(
            date,
            hours,
            customBornesForSuggestions.value
          );
          hours.push(startHourAfterNow);
          if (
            timeToMinutes(startHourAfterNow) <
            timeToMinutes(customBornes.endMorning)
          ) {
            hours.push(
              ...[customBornes.endMorning, customBornes.startAfternoon]
            );
          }
          hours.push(
            minutesToTime(
              Math.min(
                timeToMinutes(startHourAfterNow) + remainingMinutes.value,
                timeToMinutes(customBornes.endAfternoon)
              )
            )
          );
          return { ...acc, [date]: timeToMinutes(getDayTotal(hours)) };
        }
        return {
          ...acc,
          [date]: timeToMinutes(getDayTotal(Object.values(customBornes))),
        };
      }, {} as Record<string, number>);
      return result;
    }),
    minTimeLeft = computed((): Record<string, number> => {
      if (!daysLeft.value) {
        return {};
      }
      const now = new Date();
      const hourNow = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const today = formatDataDate(now);

      const result = daysLeft.value.reduce((acc, date) => {
        const customBornes = withDefaultMinBornes(
          customBornesForSuggestions.value[date]
        );
        if (date === today && days.value[date]) {
          const hours = [...days.value[date]];
          if (hours.length % 2) {
            hours.push(hourNow);
          }
          const startHourAfterNow = suggestStartHour(
            date,
            hours,
            customBornesForSuggestions.value
          );
          hours.push(startHourAfterNow);
          if (
            timeToMinutes(startHourAfterNow) <
            timeToMinutes(customBornes.endMorning)
          ) {
            hours.push(
              ...[customBornes.endMorning, customBornes.startAfternoon]
            );
          }
          hours.push(
            minutesToTime(
              Math.min(
                timeToMinutes(startHourAfterNow) + remainingMinutes.value,
                timeToMinutes(customBornes.startAfternoon)
              )
            )
          );
          return { ...acc, [date]: timeToMinutes(getDayTotal(hours)) };
        }
        return {
          ...acc,
          [date]: timeToMinutes(getDayTotal(Object.values(customBornes))),
        };
      }, {} as Record<string, number>);
      return result;
    }),
    suggestedTimeBlocks = computed(
      (): Record<
        string,
        Array<{ start: string; end: string; duration: string }>
      > => {
        const lunchBreakDuration = 60;

        const now = new Date();
        const today = formatDataDate(now);
        const timeNow = now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const minutesNow = timeToMinutes(timeNow);
        const todayHours = days.value[today];
        const todayMinutes = timeToMinutes(getDayTotal(todayHours));

        if (!daysLeft.value) {
          return {};
        }

        const timeLeftByDayWithoutToday =
          remainingMinutes.value /
          (daysLeft.value.filter((date) => date !== today).length || 1);
        let timeLeftByDay =
          (remainingMinutes.value +
            (todayMinutes >= timeLeftByDayWithoutToday ? 0 : todayMinutes)) /
          daysLeft.value.length;

        const timeLeftwithCustomBornes =
          getTimeLeftwithCustomBornesConstraints(timeLeftByDay);

        const result = Object.keys(days.value).reduce((acc, date) => {
          if (!daysLeft.value?.includes(date)) {
            return { ...acc, [date]: [] };
          }
          const maxEndLunch = timeToMinutes(
            customBornesForSuggestions.value[date]?.startAfternoon ?? "14:00"
          );
          const minStartDay = timeToMinutes(
            customBornesForSuggestions.value[date]?.startMorning ?? "08:30"
          );
          const maxStartDay = timeToMinutes(
            customBornesForSuggestions.value[date]?.startMorning ?? "09:00"
          );
          const maxEndDay = timeToMinutes(
            customBornesForSuggestions.value[date]?.endAfternoon ?? "18:30"
          );
          const minEndDay = timeToMinutes(
            customBornesForSuggestions.value[date]?.endAfternoon ?? "16:30"
          );
          const minStartLunch = timeToMinutes(
            customBornesForSuggestions.value[date]?.endMorning ?? "12:00"
          );
          let minEndLunch = Math.max(
            minStartLunch + lunchBreakDuration,
            timeToMinutes(
              customBornesForSuggestions.value[date]?.startAfternoon ?? "13:00"
            )
          );
          const hours = days.value[date] ?? [];
          const totalMinutes = timeToMinutes(getDayTotal(hours));

          const timeLeft =
            date === today
              ? timeLeftwithCustomBornes[date] - totalMinutes
              : timeLeftwithCustomBornes[date];
          const betweenLunchBreak =
            minStartLunch < minutesNow && minutesNow < maxEndLunch;
          const withLunchTime =
            date !== today ||
            (!hasAlreadyLunchBreak(hours) && betweenLunchBreak);
          let start =
            date === today
              ? hours.length % 2
                ? timeToMinutes(hours[hours.length - 1])
                : withLunchTime
                ? Math.max(
                    timeToMinutes(hours[hours.length - 1]) + lunchBreakDuration,
                    minutesNow
                  )
                : minutesNow
              : minStartDay;
          let end = Math.min(
            start + timeLeft + (withLunchTime ? lunchBreakDuration : 0),
            maxEndDay
          );
          const differenceWithMinEnd = end - minEndDay;
          if (differenceWithMinEnd < 0) {
            end = minEndDay;
            if (date !== today || !hours.length) {
              start = Math.min(start - differenceWithMinEnd, maxStartDay);
              minEndLunch = Math.min(
                minEndLunch +
                  Math.max(
                    -differenceWithMinEnd - (maxStartDay - minStartDay),
                    0
                  ),
                maxEndLunch
              );
            } else if (start < maxEndLunch && start > minStartLunch) {
              const endLunch = Math.max(
                Math.min(minEndLunch + differenceWithMinEnd, maxEndLunch),
                start
              );
              if (withLunchTime && hours.length % 2 === 0) {
                minEndLunch = endLunch;
              } else {
                start = endLunch;
              }
            }
          }
          const suggestHours = (
            start < minStartLunch
              ? [start, minStartLunch, minEndLunch, end]
              : [start, end]
          ).map(minutesToTime);
          const blocks = [];
          for (let i = 0; i < suggestHours.length; i += 2) {
            if (suggestHours[i]) {
              const endTime =
                suggestHours[i + 1] ??
                new Date().toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              blocks.push({
                start: suggestHours[i],
                end: endTime,
                duration: "",
              });
            }
          }
          return { ...acc, [date]: blocks };
        }, {} as Record<string, Array<{ start: string; end: string; duration: string }>>);
        return result;
      }
    );

  const getTimeLeftwithCustomBornesConstraints = (
      timeLeft: number
    ): Record<string, number> => {
      let totalOverTime = 0;
      let totalLowerTime = 0;
      let timeLeftByDay: Record<string, number> =
        daysLeft.value?.reduce(
          (acc, date) => ({
            ...acc,
            [date]: timeLeft,
          }),
          {} as Record<string, number>
        ) ?? {};
      let overTimeDays: string[] = [];
      let lowerTimeDays: string[] = [];
      let index = 0;
      do {
        timeLeftByDay =
          daysLeft.value?.reduce(
            (acc, date) => ({
              ...acc,
              [date]: overTimeDays.includes(date)
                ? maxTimeLeft.value[date]
                : lowerTimeDays.includes(date)
                ? minTimeLeft.value[date]
                : timeLeftByDay[date] +
                  totalOverTime -
                  totalLowerTime /
                    (daysLeft.value!.length - overTimeDays.length),
            }),
            {} as Record<string, number>
          ) ?? {};
        totalOverTime = 0;
        totalLowerTime = 0;
        overTimeDays =
          daysLeft.value?.reduce((acc, date) => {
            if (timeLeftByDay[date] > maxTimeLeft.value[date]) {
              totalOverTime += timeLeftByDay[date] - maxTimeLeft.value[date];
              return [...acc, date];
            }
            if (timeLeftByDay[date] < minTimeLeft.value[date]) {
              totalLowerTime += minTimeLeft.value[date] - timeLeftByDay[date];
              return [...acc, date];
            }
            return acc;
          }, [] as string[]) ?? [];
        index++;
      } while (
        (totalOverTime > 0 || totalLowerTime > 0) &&
        index < 10 &&
        daysLeft.value!.length !== overTimeDays.length
      );
      return (
        daysLeft.value?.reduce(
          (acc, date) => ({
            ...acc,
            [date]: Math.min(
              Math.max(timeLeftByDay[date], minTimeLeft.value[date]),
              maxTimeLeft.value[date]
            ),
          }),
          {} as Record<string, number>
        ) ?? {}
      );
    },
    saveNewSuggestionBorne = (
      date: string,
      time: string,
      section: "startMorning" | "endMorning" | "startAfternoon" | "endAfternoon"
    ) => {
      customBornesForSuggestions.value = {
        ...customBornesForSuggestions.value,
        [date]: customBornesForSuggestions.value[date]
          ? { ...customBornesForSuggestions.value[date], [section]: time }
          : { [section]: time },
      };
      saveLocalStorage(
        "custom_bornes_for_suggestions",
        customBornesForSuggestions.value
      );
    },
    getCustomBorneForSuggestions = () => {
      const customBornes =
        loadLocalStorage("custom_bornes_for_suggestions") ?? {};
      for (const [date] of Object.entries(customBornes)) {
        if (!getCurrentWeekDates().includes(date)) {
          delete customBornes[date];
        }
      }
      customBornesForSuggestions.value = customBornes;
      saveLocalStorage("custom_bornes_for_suggestions", customBornes);
    },
    startResizeSuggestion = (
      event: MouseEvent,
      date: string,
      idx: number,
      handle: "start" | "end"
    ) => {
      const block = suggestedTimeBlocks.value[date][idx];
      const initBlockHandle = block[handle];
      const startX = event.clientX;
      const timeLineSize =
        (event.target as HTMLElement).closest(".timeline-container")
          ?.clientWidth ?? 0;
      const timeLineDuration = timeToMinutes("19:00") - timeToMinutes("08:00");
      const { typeHandler, minPosition, maxPosition } = getBornesTime(
        date,
        timeToMinutes(initBlockHandle),
        days.value,
        formatDataDate
      );

      const onMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX;
        const diffMinutes = (dx / timeLineSize) * timeLineDuration;
        block[handle] = minutesToTime(
          Math.min(
            Math.max(minPosition, timeToMinutes(initBlockHandle) + diffMinutes),
            maxPosition
          )
        );
        if (typeHandler) {
          saveNewSuggestionBorne(date, block[handle], typeHandler);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

  return {
    customBornesForSuggestions,
    selectedSuggestedBlock,
    maxTimeLeft,
    minTimeLeft,
    suggestedTimeBlocks,
    saveNewSuggestionBorne,
    getCustomBorneForSuggestions,
    startResizeSuggestion,
  };
}
