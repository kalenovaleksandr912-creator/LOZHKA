import { escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=21";

const notificationGroups = [
  {
    title: "Сегодня",
    items: [
      { key: "tasks", icon: "check-square", tone: "blue", title: "Задачи", details: "Новые и просроченные", checked: true },
      { key: "calendar", icon: "calendar", tone: "lavender", title: "Календарь", details: "События на день", checked: true },
      { key: "shopping", icon: "shopping-bag", tone: "green", title: "Покупки", details: "Общие списки", checked: true },
    ],
  },
  {
    title: "Личное",
    items: [
      { key: "dailyPhoto", icon: "camera", tone: "rose", title: "Фото дня", details: "Когда партнёр добавил фото", checked: true },
      { key: "menu", icon: "utensils", tone: "warm", title: "Меню", details: "Планы еды в календаре", checked: false },
    ],
  },
];

function renderNotificationToggle(item) {
  return `
    <label class="notification-row">
      <span class="row-icon ${escapeHtml(item.tone)}">${icon(item.icon)}</span>
      <span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.details)}</small>
      </span>
      <input class="switch-input" type="checkbox" data-notification-key="${escapeHtml(item.key)}"${item.checked ? " checked" : ""} />
    </label>
  `;
}

function renderNotificationGroup(group) {
  return `
    <section class="settings-stack">
      ${sectionTitle({ title: group.title })}
      ${group.items.map(renderNotificationToggle).join("")}
    </section>
  `;
}

export function renderNotificationsPage() {
  return pageShell(
    "notifications",
    "Уведомления",
    `
      <section class="secondary-hero settings-hero">
        <button class="icon-button" type="button" aria-label="Назад" data-target-page="today">
          ${icon("chevron-left")}
        </button>
        <div>
          <p>Профиль</p>
          <h1>Уведомления</h1>
        </div>
        <button class="icon-button" type="button" aria-label="Открыть профиль" data-profile-open>
          ${icon("user")}
        </button>
      </section>

      <section class="settings-panel reminder-panel">
        <div>
          <strong>Ежедневная сводка</strong>
          <small>Утром, до начала дня</small>
        </div>
        <input type="time" value="09:00" aria-label="Время ежедневной сводки" data-summary-time />
      </section>

      ${notificationGroups.map(renderNotificationGroup).join("")}

      <section class="settings-panel quiet-panel">
        <span class="row-icon neutral">${icon("moon")}</span>
        <div>
          <strong>Тихие часы</strong>
          <small>22:30 - 08:30</small>
        </div>
        <input class="switch-input" type="checkbox" checked aria-label="Тихие часы" data-quiet-hours />
      </section>
    `,
  );
}
