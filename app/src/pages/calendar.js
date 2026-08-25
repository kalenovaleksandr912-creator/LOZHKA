import { agenda, calendarWeek, tomorrowAgenda } from "../data/mock-data.js?v=16";
import { agendaCard, escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=16";

function renderWeek() {
  return `
    <section class="calendar-view is-active" data-calendar-view="week" aria-labelledby="weekTitle">
      <section class="week-strip" aria-label="Дни недели">
        ${calendarWeek
          .map(
            (day) => `
              <button class="${day.active ? "is-active" : ""}" type="button">
                <span>${escapeHtml(day.weekday)}</span>
                <strong>${escapeHtml(day.date)}</strong>
                <small>${escapeHtml(day.count)}</small>
              </button>
            `,
          )
          .join("")}
      </section>

      <section class="calendar-day" aria-labelledby="weekTitle">
        ${sectionTitle({ eyebrow: "Среда", title: "26 августа", action: "День", actionLabel: "Открыть день" })}
        ${agenda.map(agendaCard).join("")}
      </section>
    </section>
  `;
}

function renderMonthGrid() {
  const cells = [
    ["27", "muted"], ["28", "muted"], ["29", "muted"], ["30", "muted"], ["31", "muted"], ["1"], ["2"],
    ["3"], ["4"], ["5"], ["6"], ["7"], ["8"], ["9"],
    ["10"], ["11"], ["12"], ["13"], ["14"], ["15"], ["16"],
    ["17"], ["18"], ["19"], ["20"], ["21"], ["22"], ["23"],
    ["24", "today", 3], ["25", "", 2], ["26", "active", 3], ["27", "", 1], ["28", "", 2], ["29"], ["30"],
    ["31"], ["1", "muted"], ["2", "muted"], ["3", "muted"], ["4", "muted"], ["5", "muted"], ["6", "muted"],
  ];

  return cells
    .map(([date, state = "", dots = 0]) => {
      const classes = [state === "muted" ? "is-muted" : "", state === "today" ? "is-today has-items" : "", state === "active" ? "is-active has-items" : "", dots ? "has-items" : ""]
        .filter(Boolean)
        .join(" ");
      return `
        <button class="${classes}" type="button">
          <strong>${escapeHtml(date)}</strong>
          ${dots ? `<span>${Array.from({ length: dots }, () => "<i></i>").join("")}</span>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderMonth() {
  return `
    <section class="calendar-view" data-calendar-view="month" aria-labelledby="monthTitle" hidden>
      ${sectionTitle({ eyebrow: "Месяц", title: "Август 2026", action: "Дальше", actionLabel: "Следующий месяц" })}
      <div class="month-weekdays" aria-hidden="true">
        <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
      </div>
      <div class="month-grid" aria-label="Август 2026">
        ${renderMonthGrid()}
      </div>
      <div class="month-preview">
        <div>
          <strong>26 августа</strong>
          <span>7 объектов: врач, задача, ужин, покупки и ближайшая дата.</span>
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
          <p>Вторник</p>
          <h2 id="dayTitle">25 августа</h2>
          <span>Завтрашние планы</span>
        </div>
        ${icon("calendar-days")}
      </div>

      <section class="calendar-day day-timeline" aria-label="День 25 августа">
        ${tomorrowAgenda.map(agendaCard).join("")}
      </section>
    </section>
  `;
}

function renderList() {
  const groups = [
    {
      title: "24 августа, сегодня",
      items: [
        { kind: "task", time: "18:00", title: "Забрать заказ", details: "Задача · Александр" },
        { kind: "menu", time: "Ужин", title: "Курица, картофель, салат", details: "Меню" },
      ],
    },
    {
      title: "25 августа, завтра",
      items: [
        { kind: "event", time: "09:00", title: "Врач", details: "Событие" },
        { kind: "shopping", time: "Список", title: "Покупки к пасте", details: "4 позиции" },
      ],
    },
    {
      title: "28 августа",
      items: [{ kind: "date", time: "Дата", title: "День рождения Анны", details: "Из раздела Люди" }],
    },
  ];

  return `
    <section class="calendar-view" data-calendar-view="list" aria-labelledby="listTitle" hidden>
      ${sectionTitle({ eyebrow: "Ближайшее", title: "Список событий" })}
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
        <button class="add-button" type="button" aria-label="Добавить в календарь">
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
