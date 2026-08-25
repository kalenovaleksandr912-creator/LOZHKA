import { escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=15";

const dateStats = [
  { value: "657", label: "дней вместе" },
  { value: "374", label: "дня в браке" },
];

const dates = [
  {
    icon: "heart",
    tone: "rose",
    title: "Начали встречаться",
    date: "7 ноября 2024",
    details: "Главная дата отношений",
  },
  {
    icon: "gem",
    tone: "lavender",
    title: "Свадьба",
    date: "15 августа 2025",
    details: "Годовщина и личные планы",
  },
  {
    icon: "home",
    tone: "green",
    title: "Первый общий дом",
    date: "1 сентября 2025",
    details: "Домашняя история",
  },
];

function renderDateCard(item) {
  return `
    <article class="date-card">
      <span class="row-icon ${escapeHtml(item.tone)}">${icon(item.icon)}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <time>${escapeHtml(item.date)}</time>
        <small>${escapeHtml(item.details)}</small>
      </div>
      <button class="icon-button" type="button" aria-label="Редактировать ${escapeHtml(item.title)}">
        ${icon("pencil")}
      </button>
    </article>
  `;
}

export function renderOurDatesPage() {
  return pageShell(
    "our-dates",
    "Наши даты",
    `
      <section class="secondary-hero settings-hero">
        <button class="icon-button" type="button" aria-label="Назад" data-target-page="today">
          ${icon("chevron-left")}
        </button>
        <div>
          <p>Профиль</p>
          <h1>Наши даты</h1>
        </div>
        <button class="icon-button" type="button" aria-label="Добавить дату">
          ${icon("plus")}
        </button>
      </section>

      <section class="date-summary">
        ${dateStats
          .map(
            (item) => `
              <article>
                <strong>${escapeHtml(item.value)}</strong>
                <span>${escapeHtml(item.label)}</span>
              </article>
            `,
          )
          .join("")}
      </section>

      <section class="settings-stack">
        ${sectionTitle({ eyebrow: "Важное", title: "Общие события" })}
        ${dates.map(renderDateCard).join("")}
      </section>
    `,
  );
}
