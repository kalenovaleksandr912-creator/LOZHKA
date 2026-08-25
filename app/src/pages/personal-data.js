import { escapeHtml, icon, pageShell } from "../components/html.js?v=17";

const personalFields = [
  { key: "name", label: "Имя", value: "Александр", placeholder: "Как тебя показывать", icon: "user" },
  { key: "avatar", label: "Аватар", value: "Ал", placeholder: "1-2 буквы", icon: "badge" },
  { key: "partner", label: "Партнёр", value: "Саша", placeholder: "Имя партнёра", icon: "heart" },
  { key: "phone", label: "Телефон", value: "", placeholder: "+7 999 000-00-00", icon: "phone" },
  { key: "email", label: "Почта", value: "", placeholder: "name@example.com", icon: "mail" },
  { key: "birthday", label: "День рождения", value: "", placeholder: "12 мая", icon: "cake" },
  { key: "role", label: "Роль", value: "Мой профиль", placeholder: "Например: семья", icon: "sparkles" },
];

function renderProfileField(field) {
  return `
    <label class="settings-field">
      <span class="row-icon ${field.icon === "heart" ? "rose" : "blue"}">${icon(field.icon)}</span>
      <span>
        <small>${escapeHtml(field.label)}</small>
        <input type="text" value="${escapeHtml(field.value)}" placeholder="${escapeHtml(field.placeholder)}" data-personal-field="${escapeHtml(field.key)}" />
      </span>
    </label>
  `;
}

export function renderPersonalDataPage() {
  return pageShell(
    "personal-data",
    "Личные данные",
    `
      <section class="secondary-hero settings-hero">
        <button class="icon-button" type="button" aria-label="Назад" data-target-page="today">
          ${icon("chevron-left")}
        </button>
        <div>
          <p>Профиль</p>
          <h1>Личные данные</h1>
        </div>
        <button class="icon-button" type="button" aria-label="Открыть профиль" data-profile-open>
          ${icon("user")}
        </button>
      </section>

      <section class="settings-profile-card">
        <span class="profile-avatar">Ал</span>
        <div>
          <p>LOZHKA</p>
          <h2>Александр</h2>
          <small>Основной профиль пространства</small>
        </div>
      </section>

      <section class="settings-stack" aria-label="Личные поля">
        ${personalFields.map(renderProfileField).join("")}
      </section>

      <section class="settings-panel">
        <div>
          <strong>Цвет задач</strong>
          <small>Мои задачи отмечаются голубым маркером</small>
        </div>
        <span class="color-swatch blue"></span>
      </section>

      <button class="settings-submit" type="button" data-save-personal-data>Сохранить</button>
      <p class="settings-status" id="personalDataStatus" aria-live="polite"></p>
    `,
  );
}
