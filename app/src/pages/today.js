import { carouselCards, dailyPhoto, meals, shopping, tasks as mockTasks, today, todayEvents } from "../data/mock-data.js?v=21";
import { agendaCard, detailAttrs, escapeHtml, icon, pageShell } from "../components/html.js?v=21";
import { toViewTasks } from "../lib/task-view.js?v=21";

function todaySectionHeader({ id, title, subtitle, action, actionLabel, targetPage }) {
  const actionControl = targetPage
    ? `<button type="button" data-target-page="${escapeHtml(targetPage)}" aria-label="${escapeHtml(actionLabel ?? action)}">${escapeHtml(action)}</button>`
    : `<button type="button" aria-label="${escapeHtml(actionLabel ?? action)}"${detailAttrs({
        kind: "section",
        title: action,
        body: "Этот сценарий будет уточнён после финального ревью прототипа.",
        icon: "sparkles",
        tone: "blue",
      })}>${escapeHtml(action)}</button>`;

  return `
    <div class="today-section-heading">
      <div>
        <h2 id="${escapeHtml(id)}">${escapeHtml(title)}</h2>
        <p>${escapeHtml(subtitle)}</p>
      </div>
      ${action ? actionControl : ""}
    </div>
  `;
}

function renderCarousel() {
  return `
    <section class="daily-carousel" aria-label="Главные карточки дня">
      <div class="carousel-track" id="carouselTrack">
        ${carouselCards
          .map((card) => {
            const tag = card.action ? "button" : "article";
            const type = card.action ? ' type="button"' : "";
            const action = card.action ? ` data-card-action="${escapeHtml(card.action)}"` : "";

            return `
              <${tag} class="spotlight-card card-${escapeHtml(card.tone)}"${type}${action}>
                <div class="spotlight-copy">
                  <span>${escapeHtml(card.label)}</span>
                  <h2>${escapeHtml(card.title)}</h2>
                  <p>${escapeHtml(card.text)}</p>
                </div>
                <div class="spotlight-art" aria-hidden="true">
                  ${icon(card.icon)}
                </div>
              </${tag}>
            `;
          })
          .join("")}
      </div>

      <div class="carousel-dots" id="carouselDots" aria-hidden="true">
        ${carouselCards.map((_, index) => `<span${index === 0 ? ' class="is-active"' : ""}></span>`).join("")}
      </div>
    </section>
  `;
}

function renderDailyPhotoOverlay() {
  const hasPartnerPhoto = Boolean(dailyPhoto.partnerPhotoUrl);
  const partnerStyle = hasPartnerPhoto ? ` style="background-image: url('${escapeHtml(dailyPhoto.partnerPhotoUrl)}')"` : "";

  return `
    <section class="photo-overlay" id="dailyPhotoOverlay" aria-labelledby="dailyPhotoTitle" hidden>
      <div class="photo-overlay-backdrop" data-photo-close></div>
      <div class="photo-expanded">
        <div class="photo-expanded-title">
          <div>
            <p>Фото дня</p>
            <h2 id="dailyPhotoTitle">Сегодняшнее задание</h2>
          </div>
          <button class="icon-button" type="button" data-photo-close aria-label="Закрыть фото дня">
            ${icon("x")}
          </button>
        </div>

        <div class="photo-story-track" aria-label="Фото дня">
          <article class="photo-story-card partner-card ${hasPartnerPhoto ? "has-photo" : "no-photo"}"${partnerStyle}>
            <div class="photo-story-copy">
              <span>Задание</span>
              <h3>${escapeHtml(dailyPhoto.prompt)}</h3>
              <p>${hasPartnerPhoto ? `${escapeHtml(dailyPhoto.partnerName)} уже добавил фото.` : `${escapeHtml(dailyPhoto.partnerName)} ещё не добавил фото.`}</p>
            </div>
          </article>

          <button class="photo-story-card camera-card" type="button" data-open-camera>
            <div class="photo-story-copy">
              <span>Моё фото</span>
              <h3>Сделать фото</h3>
              <p>Свайпни сюда и нажми, чтобы открыть камеру.</p>
            </div>
            <div class="camera-mark" aria-hidden="true">
              ${icon("camera")}
            </div>
          </button>
        </div>

        <input class="camera-input" id="dailyPhotoInput" type="file" accept="image/*" capture="user" hidden />
      </div>
    </section>
  `;
}

const initialTasks = toViewTasks(mockTasks);

export function renderTodayTasksContent(tasks) {
  const activeTasks = tasks.filter((task) => !task.completed && task.date === "Сегодня");
  const activeCount = activeTasks.length;

  return `
    ${todaySectionHeader({ id: "tasksTitle", title: "Задачи", subtitle: `${activeCount} активные`, action: "Все", actionLabel: "Открыть задачи", targetPage: "tasks" })}
    ${
      activeTasks.length
        ? activeTasks
            .map(
              (task) => `
                <label class="task-row">
                  <input type="checkbox"${task.id ? ` data-task-complete data-task-id="${escapeHtml(task.id)}"` : ""} />
                  <span>
                    <strong>${escapeHtml(task.title)}</strong>
                    <small>${escapeHtml(task.assignee)} · ${escapeHtml(task.details)}</small>
                  </span>
                </label>
              `,
            )
            .join("")
        : `
          <article class="task-row">
            <span></span>
            <span>
              <strong>На сегодня всё чисто</strong>
              <small>Новая задача появится здесь после сохранения.</small>
            </span>
          </article>
        `
    }
  `;
}

function renderTodayTasks(tasks = initialTasks) {
  return `
    <section class="feed-section" id="todayTasksSection" aria-labelledby="tasksTitle">
      ${renderTodayTasksContent(tasks)}
    </section>
  `;
}

function renderEvents() {
  return `
    <section class="feed-section" id="todayEventsSection" aria-labelledby="eventsTitle">
      ${renderTodayEventsContent(todayEvents)}
    </section>
  `;
}

export function renderTodayEventsContent(events) {
  return `
    ${todaySectionHeader({ id: "eventsTitle", title: "События", subtitle: `${events.length} в календаре`, action: "Неделя", actionLabel: "Открыть календарь", targetPage: "calendar" })}
    ${events.map((event) => agendaCard({ ...event, kind: "event" })).join("")}
  `;
}

function renderMeals() {
  return `
    <section class="feed-section menu-section" aria-labelledby="menuTitle">
      ${todaySectionHeader({ id: "menuTitle", title: "Сегодня едим", subtitle: "Ужин уже запланирован", action: "План", actionLabel: "Открыть меню", targetPage: "menu" })}
      ${meals
        .map(
          (meal) => `
            <div class="meal-row">
              ${icon(meal.icon)}
              <span>
                <strong>${escapeHtml(meal.title)}</strong>
                <small>${escapeHtml(meal.details)}</small>
              </span>
            </div>
          `,
        )
        .join("")}
    </section>
  `;
}

function renderShopping() {
  return `
    <section class="feed-section shopping-section" id="todayShoppingSection" aria-labelledby="shoppingTitle">
      ${renderTodayShoppingContent(shopping)}
    </section>
  `;
}

export function renderTodayShoppingContent(items) {
  return `
    ${todaySectionHeader({ id: "shoppingTitle", title: "Покупки", subtitle: `${items.length} позиции`, action: "Список", actionLabel: "Открыть покупки", targetPage: "shopping" })}
    ${items
      .map(
        (item) => `
          <label class="shopping-row">
            <input type="checkbox"${item.completed ? " checked" : ""} />
            <span>${escapeHtml(item.title)}</span>
          </label>
        `,
      )
      .join("")}
  `;
}

export function renderTodayPage() {
  return pageShell(
    "today",
    "Сегодня",
    `
      <header class="today-topbar" aria-label="Дата и быстрые действия">
        <div>
          <p>${escapeHtml(today.weekday)}</p>
          <h1>${escapeHtml(today.date)}</h1>
        </div>
        <div class="today-actions">
          <button class="add-button" id="openQuickAdd" type="button" aria-label="Быстро добавить">
            <span aria-hidden="true">+</span>
          </button>
          <button class="avatar-button" type="button" data-profile-open aria-label="Профиль Александр">Ал</button>
        </div>
      </header>

      ${renderCarousel()}
      ${renderDailyPhotoOverlay()}

      <section class="today-feed" aria-label="Информация на сегодня">
        ${renderTodayTasks()}
        ${renderEvents()}
        ${renderMeals()}
        ${renderShopping()}
        <section class="feed-section us-section" aria-labelledby="usTitle">
          ${todaySectionHeader({ id: "usTitle", title: "Мы", subtitle: "657 дней вместе", action: "Открыть", actionLabel: "Открыть раздел Мы", targetPage: "more" })}
          <div class="soft-note">
            ${icon("sparkles")}
            <span>За август закрыто 18 задач и запланировано 9 домашних ужинов.</span>
          </div>
        </section>
      </section>
    `,
    true,
  );
}
