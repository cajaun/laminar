import type { RangeType } from "@/components/morphing-chart/data/chart-data";

const MINUTES_PER_HOUR = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTH_NAMES_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function getProgress(index: number, pointCount: number) {
  return Math.max(0, Math.min(1, index / Math.max(1, pointCount - 1)));
}

function getDateAtProgress(start: number, duration: number, progress: number) {
  return new Date(start + duration * progress);
}

function getTodayStart() {
  const today = new Date();

  // Use the device's calendar day for the relative chart labels. Using UTC
  // getters would roll the sample timeline forward after local evening.
  return Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
}

function formatTime(date: Date) {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes(),
  ).padStart(2, "0")}`;
}

function formatMonthDay(date: Date) {
  return `${MONTH_NAMES_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function formatMonthDayHour(date: Date) {
  return `${formatMonthDay(date)} ${String(date.getUTCHours()).padStart(
    2,
    "0",
  )}`;
}

function isSameUtcDay(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

export function getCursorLabel(
  range: RangeType,
  index: number,
  pointCount: number,
) {
  const progress = getProgress(index, pointCount);
  const todayStart = getTodayStart();

  if (range === "1H") {
    const totalMinutes = 3 * MINUTES_PER_HOUR + 5 + Math.round(progress * 60);
    const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR) % 24;
    const minutes = totalMinutes % MINUTES_PER_HOUR;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  }

  if (range === "1D") {
    const start = todayStart - (1 * MINUTES_PER_HOUR + 25) * 60 * 1000;
    const end = todayStart + (11 * MINUTES_PER_HOUR + 25) * 60 * 1000;
    const date = getDateAtProgress(start, end - start, progress);

    // The first sample retains yesterday's date; after midnight the cursor
    // switches to the new day's time-only labels.
    return index === 0
      ? `${formatMonthDay(date)} ${formatTime(date)}`
      : formatTime(date);
  }

  if (range === "1W") {
    const start = todayStart - 7 * DAY_MS + 21 * 60 * 60 * 1000;
    const end = todayStart + 20 * 60 * 60 * 1000;
    const date = getDateAtProgress(start, end - start, progress);
    const today = new Date(todayStart);

    // Keep date/hour context through yesterday's final hour, then switch to
    // compact hour-only labels exactly when the current day begins.
    return isSameUtcDay(date, today)
      ? String(date.getUTCHours()).padStart(2, "0")
      : formatMonthDayHour(date);
  }

  if (range === "1M") {
    const start = todayStart - 30 * DAY_MS + 14 * 60 * 60 * 1000;
    const end = todayStart + 20 * 60 * 60 * 1000;
    const date = getDateAtProgress(start, end - start, progress);

    // Month labels retain both calendar date and hour, e.g. Aug 31 19 and
    // Sep 05 20, so the exact recent position remains visible.
    return formatMonthDayHour(date);
  }

  const start = todayStart - 365 * DAY_MS;
  const date = getDateAtProgress(start, 365 * DAY_MS, progress);

  // Current-year dates are compact (Jul 30); the older year identifies the
  // month and year (July 2025) so the two calendar years remain distinct.
  return date.getUTCFullYear() < new Date().getUTCFullYear()
    ? `${MONTH_NAMES_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`
    : formatMonthDay(date);
}

export function formatPercent(value: number) {
  return value === 0 ? "0%" : `${Math.abs(value).toFixed(2)}%`;
}
