import type {
  TimeBlock,
  BornesTime,
  DefaultBornes,
  CustomBornes,
  CustomBornesForSuggestions,
} from "../types";

export const useTimeCalculations = () => {
  const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    },
    minutesToTime = (minutes: number): string => {
      minutes = Math.ceil(minutes);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
    },
    calculateDuration = (start: string, end: string): string => {
      const startMinutes = timeToMinutes(start);
      const endMinutes = timeToMinutes(end);
      const duration = endMinutes - startMinutes;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h${minutes.toString().padStart(2, "0")}`;
    },
    getTimeBlocks = (times: string[]): TimeBlock[] => {
      const blocks: TimeBlock[] = [];
      for (let i = 0; i < times.length; i += 2) {
        if (times[i]) {
          const end =
            times[i + 1] ??
            new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });
          blocks.push({
            start: times[i],
            end,
            duration: calculateDuration(times[i], end),
          });
        }
      }
      return blocks;
    },
    getDayTotal = (times: string[] | undefined): string => {
      if (!times || times.length === 0) {
        return "00:00";
      }
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
      return minutesToTime(total);
    },
    hasAlreadyLunchBreak = (hours: string[]): boolean => {
      for (let i = 0; i < hours.length; i += 2) {
        const start = timeToMinutes(hours[i]);
        const end = timeToMinutes(
          hours[i + 1] ??
            new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
        );
        return (
          start <= timeToMinutes("14:00") &&
          end >= timeToMinutes("12:00") &&
          end - start >= 60
        );
      }
      return false;
    },
    getBlockStyle = (block: TimeBlock) => {
      const offset = timeToMinutes("08:00");

      const startMinutes = timeToMinutes(block.start) - offset;
      const endMinutes = timeToMinutes(block.end) - offset;
      const totalMinutes = timeToMinutes("19:00") - offset;

      const realStartPercent = (startMinutes / totalMinutes) * 100;
      const realWidthPercent =
        ((endMinutes - startMinutes) / totalMinutes) * 100;

      return {
        left: `${realStartPercent}%`,
        width: `${realWidthPercent}%`,
      };
    },
    formatDataDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    getCurrentWeekDates = (): string[] => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        weekDates.push(formatDataDate(currentDay));
      }
      return weekDates;
    },
    isPastDateOrWeekend = (date: string): boolean => {
      const today = new Date();
      const todayObj = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const [day, month, year] = date.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      return (
        dateObj < todayObj || dateObj.getDay() === 0 || dateObj.getDay() === 6
      );
    },
    withDefaultMaxBornes = (customBornesDate?: CustomBornes): DefaultBornes => {
      return {
        startMorning: customBornesDate?.startMorning ?? "08:30",
        endMorning: customBornesDate?.endMorning ?? "12:00",
        startAfternoon: customBornesDate?.startAfternoon ?? "13:00",
        endAfternoon: customBornesDate?.endAfternoon ?? "18:30",
      };
    },
    withDefaultMinBornes = (customBornesDate?: CustomBornes): DefaultBornes => {
      return {
        startMorning: customBornesDate?.startMorning ?? "09:00",
        endMorning: customBornesDate?.endMorning ?? "12:00",
        startAfternoon: customBornesDate?.startAfternoon ?? "14:00",
        endAfternoon: customBornesDate?.endAfternoon ?? "16:30",
      };
    },
    suggestStartHour = (
      date: string,
      hours: string[],
      customBornesForSuggestions: CustomBornesForSuggestions
    ): string => {
      const customBornes = withDefaultMaxBornes(
        customBornesForSuggestions[date]
      );
      if (hours.length === 0) {
        return customBornes.startMorning;
      }

      const hourNow = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const lastHour = hours.length % 2 ? hourNow : hours[hours.length - 1];
      if (timeToMinutes(hourNow) <= timeToMinutes(customBornes.endMorning)) {
        return hourNow;
      } else if (
        timeToMinutes(hourNow) <= timeToMinutes(customBornes.startAfternoon)
      ) {
        if (
          hours.length % 2 &&
          timeToMinutes(hourNow) >= timeToMinutes("13:00")
        ) {
          return hourNow;
        }
        return minutesToTime(
          Math.max(
            timeToMinutes(customBornes.startAfternoon),
            Math.min(timeToMinutes(lastHour) + 60, timeToMinutes("14:00"))
          )
        );
      } else {
        return minutesToTime(
          Math.min(
            timeToMinutes(customBornes.endAfternoon),
            timeToMinutes(hourNow)
          )
        );
      }
    },
    getBornesTime = (
      date: string,
      time: number,
      days: Record<string, string[]>,
      _formatDataDateFn: (date: Date) => string
    ): BornesTime => {
      const minutesNow = timeToMinutes(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      const lastHour = days[date]?.length
        ? days[date].length % 2
          ? minutesNow
          : timeToMinutes(days[date][days[date].length - 1])
        : 0;

      if (time >= timeToMinutes("08:30") && time <= timeToMinutes("9:00")) {
        return {
          typeHandler: "startMorning",
          minPosition: timeToMinutes("08:30"),
          maxPosition: timeToMinutes("09:00"),
        };
      }
      if (
        time >= Math.max(timeToMinutes("12:00"), lastHour) &&
        time <= timeToMinutes("13:00")
      ) {
        return {
          typeHandler: "endMorning",
          minPosition: Math.max(timeToMinutes("12:00"), lastHour),
          maxPosition: timeToMinutes("13:00"),
        };
      }
      if (time >= timeToMinutes("13:00") && time <= timeToMinutes("14:00")) {
        return {
          typeHandler: "startAfternoon",
          minPosition: timeToMinutes("13:00"),
          maxPosition: timeToMinutes("14:00"),
        };
      }
      if (
        time >= Math.max(timeToMinutes("16:30"), lastHour) &&
        time <= timeToMinutes("18:30")
      ) {
        return {
          typeHandler: "endAfternoon",
          minPosition: Math.max(timeToMinutes("16:30"), lastHour),
          maxPosition: timeToMinutes("18:30"),
        };
      }
      return {
        typeHandler: undefined,
        minPosition: time,
        maxPosition: time,
      };
    };

  return {
    timeToMinutes,
    minutesToTime,
    calculateDuration,
    getTimeBlocks,
    getDayTotal,
    hasAlreadyLunchBreak,
    getBlockStyle,
    formatDataDate,
    getCurrentWeekDates,
    isPastDateOrWeekend,
    withDefaultMaxBornes,
    withDefaultMinBornes,
    suggestStartHour,
    getBornesTime,
  };
};
