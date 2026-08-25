import { agenda, tomorrowAgenda } from "../data/mock-data.js?v=22";
import { agendaCard, escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=22";
import { TODAY, TOMORROW, addDays, buildCalendarWeek, buildMonthCells, formatDayMonth, formatMonthYear, formatWeekdayLong } from "../lib/dates.js?v=22";

function getCalendarCount(date) {
  const dayOffset = Math.round((date.getTime() - TODAY.getTime()) / 86400000);
  const knownCounts = {
    "-1": 3,
    0: 7,
    1: 3,
    2: 2,
    3: 4,
    4: 1,
  };

  if (String(dayOffset) in knownCounts) {
    return knownCounts[String(dayOffset)];
  }

  return [0, 1, 2, 0, 1, 3, 0][date.getDate() % 7];
}

function renderWeek() {
  const weekDays = buildCalendarWeek(TODAY, getCalendarCount);

  return `
    <section class="calendar-view is-active" data-calendar-view="week" aria-labelledby="weekTitle">
      <section class="week-strip" aria-label="Дни недели">
        ${weekDays
          .map(
            (day) => `
              <button class="${day.active ? "is-active" : ""}" type="button" data-calendar-day="${escapeHtml(day.iso)}" data-calendar-day-label="${escapeHtml(day.label)}" data-calendar-day-count="${escapeHtml(day.count)}">
                <span>${escapeHtml(day.weekday)}</span>
                <strong>${escapeHtml(day.date)}</strong>
                <small>${escapeHtml(day.count)}</small>
              </button>
            `,
          )
          .join("")}
      </section>

      <section class="calendar-day" aria-labelledby="weekTitle">
        ${sectionTitle({ eyebrow: formatWeekdayLong(TODAY), title: formatDayMonth(TODAY), action: "День", actionLabel: "Открыть день", calendarView: "day" })}
        ${agenda.map(agendaCard).join("")}
      </section>
    </section>
  `;
}

function renderMonthGrid() {
  const cells = buildMonthCells(TODAY, getCalendarCount);

  return cells
    .map((cell) => {
      const dots = Math.min(cell.count, 3);
      const classes = [cell.muted ? "is-muted" : "", cell.today ? "is-today" : "", cell.active ? "is-active" : "", cell.count ? "has-items" : ""]
        .filter(Boolean)
        .join(" ");
      return `
        <button class="${classes}" type="button" data-calendar-day="${escapeHtml(cell.iso)}" data-calendar-day-label="${escapeHtml(cell.label)}" data-calendar-day-count="${escapeHtml(cell.count)}">
          <strong>${escapeHtml(cell.date)}</strong>
          ${dots ? `<span>${Array.from({ length: dots }, () => "<i></i>").join("")}</span>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderMonth() {
  const todayCount = getCalendarCount(TODAY);

  return `
    <section class="calendar-view" data-calendar-view="month" aria-labelledby="monthTitle" hidden>
      ${sectionTitle({ eyebrow: "Месяц", title: formatMonthYear(TODAY), action: "Дальше", actionLabel: "Следующий месяц", attrs: { "data-calendar-next-month": true } })}
      <div class="month-weekdays" aria-hidden="true">
        <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
      </div>
      <div class="month-grid" aria-label="${escapeHtml(formatMonthYear(TODAY))}">
        ${renderMonthGrid()}
      </div>
      <div class="month-preview">
        <div>
          <strong>${escapeHtml(formatDayMonth(TODAY))}</strong>
          <span>${todayCount} объектов: врач, задача, ужин, покупки и ближайшая дата.</span>
        </div>
      </div>
    </section>
  `;
}

function renderDay() {
  return `
    <section class="calendar-view" data-calendar-view="day" data-calendar-date="tomorrow" aria-labelledby="dayTitle" hidden>
      <div class="day-focus">
        <div>
          <p>${escapeHtml(formatWeekdayLong(TOMORROW))}</p>
          <h2 id="dayTitle">${escapeHtml(formatDayMonth(TOMORROW))}</h2>
          <span>Завтрашние планы</span>
        </div>
        ${icon("calendar-days")}
      </div>

      <section class="calendar-day day-timeline" aria-label="День ${escapeHtml(formatDayMonth(TOMORROW))}">
        ${tomorrowAgenda.map(agendaCard).join("")}
      </section>
    </section>
  `;
}

function renderList() {
  const laterDate = addDays(TODAY, 3);
  const groups = [
    {
      title: `${formatDayMonth(TODAY)}, сегодня`,
      items: [
        { kind: "task", time: "18:00", title: "Забрать заказ", details: "Задача · Александр" },
        { kind: "menu", time: "Ужин", title: "Курица, картофель, салат", details: "Меню" },
      ],
    },
    {
      title: `${formatDayMonth(TOMORROW)}, завтра`,
      items: [
        { kind: "event", time: "09:00", title: "Врач", details: "Событие" },
        { kind: "shopping", time: "Список", title: "Покупки к пасте", details: "4 позиции" },
      ],
    },
    {
      title: formatDayMonth(laterDate),
      items: [{ kind: "date", time: "Дата", title: "День рождения Анны", details: "Из раздела Люди" }],
    },
  ];

  return `
    <section class="calendar-view" data-calendar-view="list" aria-labelledby="listTitle" hidden>
      ${sectionTitle({ eyebrow: "Ближайшее", title: "Список событий" })}
      <section class="calendar-list-group local-calendar-events" id="calendarLocalEvents" hidden></section>
      ${groups
        .map(
          (group) => `
            <section class="calendar-list-group">
              <h4>${escapeHtml(group.title)}</h4>
              ${group.items.map(agendaCard).join("")}
            </section>
          `,
        )
        .join("")}
    </section>
  `;
}

export function renderCalendarPage() {
  return pageShell(
    "calendar",
    "Календарь",
    `
      <section class="page-hero">
        <div>
          <p id="calendarModeLabel">Неделя</p>
          <h1>Календарь</h1>
        </div>
        <button class="add-button" type="button" aria-label="Добавить в календарь" data-add-view="event">
          <span aria-hidden="true">+</span>
        </button>
      </section>

      <div class="segment-control" aria-label="Вид календаря">
        <button type="button" data-calendar-view="month">Месяц</button>
        <button class="is-active" type="button" data-calendar-view="week">Неделя</button>
        <button type="button" data-calendar-view="day">День</button>
        <button type="button" data-calendar-view="list">Список</button>
      </div>

      ${renderMonth()}
      ${renderWeek()}
      ${renderDay()}
      ${renderList()}
    `,
  );
}
