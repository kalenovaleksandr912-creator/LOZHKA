import { people } from "../data/mock-data.js?v=20";
import { escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=20";

function renderPersonCard(person) {
  return `
    <article class="person-card tone-${escapeHtml(person.tone)}">
      <header>
        <span class="person-avatar">${escapeHtml(person.initials)}</span>
        <div>
          <strong>${escapeHtml(person.name)}</strong>
          <small>${escapeHtml(person.role)}</small>
        </div>
      </header>

      <div class="person-date">
        ${icon("cake")}
        <span>
          <strong>${escapeHtml(person.birthday)}</strong>
          <small>${escapeHtml(person.nextEvent)}</small>
        </span>
      </div>

      <p>${escapeHtml(person.note)}</p>

      <div class="person-tags">
        ${person.tags.map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}
      </div>
    </article>
  `;
}

export function renderPeoplePage() {
  return pageShell(
    "people",
    "Люди",
    `
      <section class="secondary-hero people-hero">
        <button class="icon-button" type="button" aria-label="Назад в Ещё" data-target-page="more">
          ${icon("chevron-left")}
        </button>
        <div>
          <p>Важные люди</p>
          <h1>Люди</h1>
        </div>
        <button class="icon-button" type="button" aria-label="Открыть статистику" data-target-page="stats">
          ${icon("bar-chart-3")}
        </button>
      </section>

      <section class="people-summary">
        <article>
          <span>Всего</span>
          <strong>4</strong>
          <small>карточки</small>
        </article>
        <article>
          <span>Ближайшее</span>
          <strong>28 авг</strong>
          <small>день рождения</small>
        </article>
      </section>

      <section class="people-list">
        ${sectionTitle({ eyebrow: "Карточки", title: "Люди рядом" })}
        ${people.map(renderPersonCard).join("")}
      </section>
    `,
  );
}
