import { icon } from "./html.js?v=13";

export function renderBottomNav() {
  const items = [
    { page: "today", label: "Сегодня", icon: "home", active: true },
    { page: "tasks", label: "Задачи", icon: "check-square" },
    { page: "calendar", label: "Календарь", icon: "calendar" },
    { page: "more", label: "Ещё", icon: "grid-2x2" },
  ];

  return `
    <nav class="bottom-nav" aria-label="Основная навигация">
      ${items
        .map(
          (item) => `
            <button class="nav-item${item.active ? " is-active" : ""}" type="button" data-page="${item.page}" aria-label="${item.label}"${item.active ? ' aria-current="page"' : ""}>
              ${icon(item.icon)}
              <span>${item.label}</span>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}

export function renderQuickSheet() {
  const actions = [
    { id: "task", icon: "check-square", label: "Новая задача" },
    { id: "event", icon: "calendar-plus", label: "Новое событие" },
    { id: "purchase", icon: "shopping-bag", label: "Покупка" },
  ];

  return `
    <div class="sheet-backdrop" id="sheetBackdrop" hidden></div>
    <section class="quick-sheet" id="quickSheet" aria-labelledby="quickSheetTitle" hidden>
      <div class="sheet-handle" aria-hidden="true"></div>
      <div class="sheet-title">
        <button class="icon-button sheet-back-button" id="backQuickAdd" type="button" aria-label="Назад" hidden>
          ${icon("chevron-left")}
        </button>
        <h2 id="quickSheetTitle">Добавить</h2>
        <button class="icon-button" id="closeQuickAdd" type="button" aria-label="Закрыть">
          ${icon("x")}
        </button>
      </div>

      <div class="quick-sheet-view is-active" data-sheet-view="menu">
        <div class="quick-actions">
          ${actions
            .map(
              (action) => `
                <button type="button" data-quick-action="${action.id}">
                  ${icon(action.icon)}
                  <span>${action.label}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      </div>

      <form class="quick-sheet-view quick-form" data-sheet-view="task" hidden>
        <label class="field">
          <span>Название</span>
          <input name="title" type="text" placeholder="Например: забрать заказ" required />
        </label>
        <div class="field-grid">
          <label class="field">
            <span>Исполнитель</span>
            <select name="assignee">
              <option>Александр</option>
              <option>Настя</option>
              <option>Оба</option>
              <option>Не назначено</option>
            </select>
          </label>
          <label class="field">
            <span>Приоритет</span>
            <select name="priority">
              <option>Срочно</option>
              <option selected>Надо сделать</option>
              <option>Когда-нибудь</option>
            </select>
          </label>
        </div>
        <label class="field">
          <span>Дедлайн</span>
          <input name="deadline" type="date" value="2026-08-24" />
        </label>
        <button class="form-submit" type="submit">Создать задачу</button>
        <p class="form-status" aria-live="polite"></p>
      </form>

      <form class="quick-sheet-view quick-form" data-sheet-view="event" hidden>
        <label class="field">
          <span>Название</span>
          <input name="title" type="text" placeholder="Например: врач" required />
        </label>
        <div class="field-grid">
          <label class="field">
            <span>Дата</span>
            <input name="date" type="date" value="2026-08-24" />
          </label>
          <label class="field">
            <span>Время</span>
            <input name="time" type="time" value="09:00" />
          </label>
        </div>
        <button class="form-submit" type="submit">Создать событие</button>
        <p class="form-status" aria-live="polite"></p>
      </form>

      <form class="quick-sheet-view quick-form" data-sheet-view="purchase" hidden>
        <label class="field">
          <span>Что купить</span>
          <input name="title" type="text" placeholder="Например: молоко" required />
        </label>
        <div class="field-grid">
          <label class="field">
            <span>Количество</span>
            <input name="amount" type="text" placeholder="1 шт" />
          </label>
          <label class="field">
            <span>Приоритет</span>
            <select name="priority">
              <option>Срочно</option>
              <option selected>Надо сделать</option>
              <option>Когда-нибудь</option>
            </select>
          </label>
        </div>
        <label class="field">
          <span>Дата</span>
          <input name="date" type="date" value="2026-08-24" />
        </label>
        <label class="field">
          <span>Примечание</span>
          <textarea name="note" rows="2" placeholder="Необязательно"></textarea>
        </label>
        <button class="form-submit" type="submit">Добавить покупку</button>
        <p class="form-status" aria-live="polite"></p>
      </form>

    </section>
  `;
}

export function renderProfileCard() {
  return `
    <div class="profile-backdrop" id="profileBackdrop" data-profile-close hidden></div>
    <section class="profile-sheet" id="profileSheet" aria-labelledby="profileTitle" hidden>
      <div class="sheet-handle" aria-hidden="true"></div>
      <div class="sheet-title">
        <h2 id="profileTitle">Профиль</h2>
        <button class="icon-button" type="button" data-profile-close aria-label="Закрыть профиль">
          ${icon("x")}
        </button>
      </div>

      <article class="profile-card">
        <div class="profile-main">
          <span class="profile-avatar">Ал</span>
          <div>
            <p>LOZHKA</p>
            <h3>Александр</h3>
            <span>В паре с Сашей</span>
          </div>
        </div>

        <div class="profile-stats" aria-label="Сводка профиля">
          <span><strong>657</strong><small>дней вместе</small></span>
          <span><strong>3</strong><small>активные задачи</small></span>
          <span><strong>1</strong><small>фото сегодня</small></span>
        </div>
      </article>

      <div class="profile-actions">
        <button type="button">
          <span class="row-icon blue">${icon("user")}</span>
          <span>
            <strong>Личные данные</strong>
            <small>Имя, аватар и роль</small>
          </span>
          ${icon("chevron-right")}
        </button>
        <button type="button">
          <span class="row-icon rose">${icon("heart")}</span>
          <span>
            <strong>Наши даты</strong>
            <small>Годовщины и важные события</small>
          </span>
          ${icon("chevron-right")}
        </button>
        <button type="button">
          <span class="row-icon green">${icon("bell")}</span>
          <span>
            <strong>Уведомления</strong>
            <small>Задачи, покупки и календарь</small>
          </span>
          ${icon("chevron-right")}
        </button>
      </div>
    </section>
  `;
}
