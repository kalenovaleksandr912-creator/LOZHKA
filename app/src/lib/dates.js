const weekdayShortNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const dayMonthFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
});

function capitalize(value) {
  return value ? value[0].toLocaleUpperCase("ru-RU") + value.slice(1) : "";
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date, days) {
  const nextDate = startOfDay(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function addMonths(date, months) {
  const nextDate = startOfDay(date);
  nextDate.setMonth(nextDate.getMonth() + months, 1);
  return nextDate;
}

export function toIsoDate(date = new Date()) {
  const localDate = startOfDay(date);
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}`;
}

export function parseIsoDate(value) {
  const [year, month, day] = String(value || "")
    .slice(0, 10)
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export const TODAY = startOfDay();
export const TODAY_ISO = toIsoDate(TODAY);
export const TOMORROW = addDays(TODAY, 1);
export const TOMORROW_ISO = toIsoDate(TOMORROW);

export function formatDayMonth(date) {
  return dayMonthFormatter.format(date);
}

export function formatWeekdayLong(date) {
  return capitalize(weekdayFormatter.format(date));
}

export function formatWeekdayShort(date) {
  return weekdayShortNames[date.getDay()];
}

export function formatMonthYear(date) {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export function getWeekStart(date = TODAY) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(date, mondayOffset);
}

export function buildCalendarWeek(date = TODAY, countResolver = () => 0) {
  const weekStart = getWeekStart(date);
  const activeIso = toIsoDate(date);

  return Array.from({ length: 7 }, (_, index) => {
    const dayDate = addDays(weekStart, index);
    const iso = toIsoDate(dayDate);

    return {
      iso,
      weekday: formatWeekdayShort(dayDate),
      date: String(dayDate.getDate()),
      label: `${formatWeekdayShort(dayDate)} ${formatDayMonth(dayDate)}`,
      count: String(countResolver(dayDate)),
      active: iso === activeIso,
    };
  });
}

export function buildMonthCells(date = TODAY, countResolver = () => 0) {
  const selectedMonth = date.getMonth();
  const monthStart = new Date(date.getFullYear(), selectedMonth, 1);
  const gridStart = getWeekStart(monthStart);
  const todayIso = TODAY_ISO;
  const activeIso = toIsoDate(date);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = addDays(gridStart, index);
    const iso = toIsoDate(cellDate);
    const count = countResolver(cellDate);

    return {
      iso,
      date: String(cellDate.getDate()),
      label: formatDayMonth(cellDate),
      count,
      muted: cellDate.getMonth() !== selectedMonth,
      today: iso === todayIso,
      active: iso === activeIso,
    };
  });
}
