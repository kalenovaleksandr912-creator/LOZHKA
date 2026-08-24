import { statsBreakdown, statsOverview, statsPeople, statsRecent } from "../data/mock-data.js?v=11";
import { escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=11";

function renderOverviewCard(item) {
  return `
    <article class="stat-card">
      <span class="row-icon ${escapeHtml(item.tone)}">${icon(item.icon)}</span>
      <div>
        <strong>${escapeHtml(item.value)}</strong>
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(item.details)}</small>
      </div>
    </article>
  `;
}

function renderBreakdownItem(item) {
  return `
    <article class="stats-bar-item tone-${escapeHtml(item.tone)}">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.count)} операций</span>
      </div>
      <div class="stats-bar" aria-hidden="true">
        <i style="width: ${escapeHtml(item.percent)}%"></i>
      </div>
    </article>
  `;
}

function renderPersonStat(item) {
  return `
    <article class="person-stat tone-${escapeHtml(item.tone)}">
      <strong>${escapeHtml(item.value)}</strong>
      <span>${escapeHtml(item.name)}</span>
      <small>${escapeHtml(item.details)}</small>
    </article>
  `;
}

function renderRecentItem(item) {
  return `
    <article class="stats-recent-item">
      <span>${icon(item.icon)}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.details)}</small>
      </div>
      <em>${escapeHtml(item.value)}</em>
    </article>
  `;
}

export function renderStatsPage() {
  return pageShell(
    "stats",
    "Статистика",
    `
      <section class="secondary-hero stats-hero">
        <button class="icon-button" type="button" aria-label="Назад в Ещё" data-target-page="more">
          ${icon("chevron-left")}
        </button>
        <div>
          <p>Операции</p>
          <h1>Статистика</h1>
        </div>
        <button class="icon-button" type="button" aria-label="Открыть людей" data-target-page="people">
          ${icon("users")}
        </button>
      </section>

      <section class="stats-total">
        <div>
          <span>Август</span>
          <strong>126 операций</strong>
          <p>Задачи, события, покупки, блюда, фото дня и совместные действия.</p>
        </div>
        ${icon("trending-up")}
      </section>

      <section class="stats-overview" aria-label="Сводка операций">
        ${statsOverview.map(renderOverviewCard).join("")}
      </section>

      <section class="stats-section">
        ${sectionTitle({ eyebrow: "Разбивка", title: "По типам операций" })}
        ${statsBreakdown.map(renderBreakdownItem).join("")}
      </section>

      <section class="stats-section">
        ${sectionTitle({ eyebrow: "Участие", title: "Кто добавлял" })}
        <div class="people-stats">
          ${statsPeople.map(renderPersonStat).join("")}
        </div>
      </section>

      <section class="stats-section">
        ${sectionTitle({ eyebrow: "Итоги", title: "Последние изменения" })}
        ${statsRecent.map(renderRecentItem).join("")}
      </section>
    `,
  );
}
