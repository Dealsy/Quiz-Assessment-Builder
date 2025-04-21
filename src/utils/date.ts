import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  isValid,
} from "date-fns";

type TimeUnit = {
  value: number;
  unit: string;
};

export const getTimeAgo = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) {
    return "unknown";
  }

  const now = new Date();
  const getTimeUnit = (): TimeUnit => {
    const seconds = differenceInSeconds(now, date);
    if (seconds < 60) return { value: 0, unit: "now" };

    const minutes = differenceInMinutes(now, date);
    if (minutes < 60) return { value: minutes, unit: "m" };

    const hours = differenceInHours(now, date);
    if (hours < 24) return { value: hours, unit: "h" };

    const days = differenceInDays(now, date);
    if (days < 30) return { value: days, unit: "d" };

    const months = differenceInMonths(now, date);
    if (months < 12) return { value: months, unit: "mo" };

    const years = differenceInYears(now, date);
    return { value: years, unit: "y" };
  };

  const { value, unit } = getTimeUnit();
  return unit === "now" ? "just now" : `${value}${unit} ago`;
};
