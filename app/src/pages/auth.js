import { icon, pageShell } from "../components/html.js?v=22";

const authSteps = [
  { key: "start", label: "Вход" },
  { key: "code", label: "Код" },
  { key: "profile", label: "Профиль" },
  { key: "setup", label: "Настройка" },
  { key: "invite", label: "Партнёр" },
];

function renderProgress() {
  return `
    <div class="auth-progress" aria-label="Этапы входа">
      ${authSteps
        .map(
          (step, index) => `
            <span class="${index === 0 ? "is-active" : ""}" data-auth-dot="${step.key}">
              <small>${step.label}</small>
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderMethodSwitch() {
  return `
    <div class="auth-methods" role="group" aria-label="Способ входа">
      <button class="is-active" type="button" data-auth-method-choice="phone" aria-pressed="true">
        ${icon("phone")}
        <span>Телефон</span>
      </button>
      <button type="button" data-auth-method-choice="email" aria-pressed="false">
        ${icon("mail")}
        <span>Почта</span>
      </button>
    </div>
  `;
}

export function renderAuthPage() {
  return pageShell(
    "auth",
    "Регистрация и вход",
    `
      <section class="auth-shell">
        <header class="auth-top">
          <div class="auth-brand">
            <span>${icon("heart")}</span>
            <div>
              <p>LOZHKA</p>
              <h1>Вход и пара</h1>
            </div>
          </div>
          <button class="icon-button" type="button" aria-label="Закрыть вход" data-auth-close hidden>
            ${icon("x")}
          </button>
        </header>

        ${renderProgress()}

        <section class="auth-screen is-active" data-auth-screen="start">
          <article class="auth-card auth-hero-card">
            <span class="row-icon rose">${icon("key-round")}</span>
            <div>
              <p>Аккаунт</p>
              <h2>Войти или создать пространство</h2>
              <small>Один код, без пароля.</small>
            </div>
          </article>

          <form class="auth-card auth-form" data-auth-form="contact">
            ${renderMethodSwitch()}
            <label class="auth-field">
              <span data-auth-contact-label>Телефон</span>
              <input name="contact" type="tel" inputmode="tel" placeholder="+7 999 000-00-00" autocomplete="tel" data-auth-contact-input required />
            </label>
            <button class="auth-submit" type="submit">Получить код</button>
          </form>

          <button class="auth-link-card" type="button" data-auth-step="join">
            <span class="row-icon blue">${icon("users")}</span>
            <span>
              <strong>У меня есть код партнёра</strong>
              <small>Подключиться к уже созданному пространству</small>
            </span>
            ${icon("chevron-right")}
          </button>

          <button class="auth-ghost" type="button" data-auth-demo>Посмотреть демо</button>
          <p class="auth-status" id="authStatus" aria-live="polite"></p>
        </section>

        <section class="auth-screen" data-auth-screen="join" hidden>
          <article class="auth-card auth-hero-card">
            <span class="row-icon blue">${icon("users")}</span>
            <div>
              <p>Партнёр</p>
              <h2>Ввести приглашение</h2>
              <small>Код даёт тот, кто создал пространство.</small>
            </div>
          </article>

          <form class="auth-card auth-form" data-auth-form="join">
            <label class="auth-field">
              <span>Код партнёра</span>
              <input name="inviteCode" type="text" placeholder="LOZHKA-4279" autocomplete="one-time-code" data-auth-join-code required />
            </label>
            ${renderMethodSwitch()}
            <label class="auth-field">
              <span data-auth-contact-label>Телефон</span>
              <input name="contact" type="tel" inputmode="tel" placeholder="+7 999 000-00-00" autocomplete="tel" data-auth-contact-input required />
            </label>
            <button class="auth-submit" type="submit">Продолжить</button>
          </form>

          <button class="auth-ghost" type="button" data-auth-step="start">Назад</button>
          <p class="auth-status" aria-live="polite"></p>
        </section>

        <section class="auth-screen" data-auth-screen="code" hidden>
          <article class="auth-card auth-hero-card">
            <span class="row-icon green">${icon("shield-check")}</span>
            <div>
              <p>Проверка</p>
              <h2>Введите код</h2>
              <small>Мы отправили его на <span data-auth-contact-preview>указанный контакт</span>.</small>
            </div>
          </article>

          <form class="auth-card auth-form" data-auth-form="code">
            <label class="auth-field">
              <span>Код из сообщения</span>
              <input name="code" type="text" inputmode="numeric" maxlength="6" placeholder="123456" autocomplete="one-time-code" required />
            </label>
            <button class="auth-submit" type="submit">Подтвердить</button>
          </form>

          <div class="auth-inline-actions">
            <button type="button" data-auth-resend>Отправить ещё раз</button>
            <button type="button" data-auth-step="start">Изменить контакт</button>
          </div>
          <p class="auth-status" aria-live="polite"></p>
        </section>

        <section class="auth-screen" data-auth-screen="profile" hidden>
          <article class="auth-card auth-hero-card">
            <span class="row-icon warm">${icon("user")}</span>
            <div>
              <p>Личные данные</p>
              <h2>Как тебя показывать</h2>
              <small>Эти данные увидит партнёр.</small>
            </div>
          </article>

          <form class="auth-card auth-form" data-auth-form="profile">
            <label class="auth-field">
              <span>Имя</span>
              <input name="name" type="text" value="Александр" data-auth-profile-name required />
            </label>
            <section class="auth-photo-card">
              <span class="profile-avatar" data-auth-avatar-preview>Ал</span>
              <div>
                <strong>Фото профиля</strong>
                <small>Можно добавить сейчас или позже в личных данных.</small>
              </div>
              <label class="auth-photo-upload">
                ${icon("image-plus")}
                <span>Загрузить</span>
                <input type="file" accept="image/*" data-auth-avatar-input />
              </label>
            </section>
            <label class="auth-field">
              <span>Имя партнёра</span>
              <input name="partner" type="text" value="Саша" data-auth-profile-partner required />
            </label>
            <button class="auth-submit" type="submit">Дальше</button>
          </form>

          <p class="auth-status" aria-live="polite"></p>
        </section>

        <section class="auth-screen" data-auth-screen="setup" hidden>
          <article class="auth-card auth-hero-card">
            <span class="row-icon lavender">${icon("settings")}</span>
            <div>
              <p>Первичная настройка</p>
              <h2>Настроить пространство</h2>
              <small>Минимум, чтобы начать пользоваться.</small>
            </div>
          </article>

          <form class="auth-card auth-form" data-auth-form="setup">
            <label class="auth-field">
              <span>Название пространства</span>
              <input name="spaceName" type="text" value="LOZHKA" data-auth-space-name required />
            </label>
            <label class="auth-field">
              <span>Главная дата</span>
              <input name="startDate" type="date" value="2024-11-07" />
            </label>
            <div class="auth-grid">
              <label class="auth-field">
                <span>Тема</span>
                <select name="theme">
                  <option value="dark">Тёмная</option>
                  <option value="rose">Розовая</option>
                </select>
              </label>
              <label class="auth-field">
                <span>Сводка</span>
                <input name="summaryTime" type="time" value="09:00" />
              </label>
            </div>
            <button class="auth-submit" type="submit">Сохранить</button>
          </form>

          <p class="auth-status" aria-live="polite"></p>
        </section>

        <section class="auth-screen" data-auth-screen="invite" hidden>
          <article class="auth-card invite-card">
            <span class="row-icon rose">${icon("send")}</span>
            <div>
              <p>Приглашение</p>
              <h2>Код для партнёра</h2>
              <small>Партнёр вводит его на своём телефоне.</small>
            </div>
            <strong data-auth-invite-code>LOZHKA-4279</strong>
            <button class="auth-submit" type="button" data-auth-copy-code>Скопировать код</button>
          </article>

          <article class="auth-card auth-checklist">
            <div>
              <span>${icon("check")}</span>
              <p>Аккаунт создан</p>
            </div>
            <div>
              <span>${icon("check")}</span>
              <p>Пространство настроено</p>
            </div>
            <div>
              <span>${icon("check")}</span>
              <p>Код партнёра готов</p>
            </div>
          </article>

          <button class="auth-submit" type="button" data-auth-finish>Перейти в приложение</button>
          <p class="auth-status" aria-live="polite"></p>
        </section>
      </section>
    `,
  );
}
