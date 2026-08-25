import { statsBreakdown, statsOverview, statsPeople, statsRecent } from "../data/mock-data.js?v=21";
import { detailAttrs, escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=21";

function renderOverviewCard(item) {
  return `
    <button class="stat-card" type="button"${detailAttrs({
      kind: "stat",
      title: item.label,
      subtitle: `${item.value} · ${item.details}`,
      body: "Показатель собирает действия в задачах, календаре, покупках, меню и фото дня.",
      icon: item.icon,
      tone: item.tone,
    })}>
      <span class="row-icon ${escapeHtml(item.tone)}">${icon(item.icon)}</span>
      <div>
        <strong>${escapeHtml(item.value)}</strong>
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(item.details)}</small>
      </div>
    </button>
  `;
}

function renderBreakdownItem(item) {
  return `
    <button class="stats-bar-item tone-${escapeHtml(item.tone)}" type="button"${detailAttrs({
      kind: "stat",
      title: item.label,
      subtitle: `${item.count} операций`,
      body: `Доля в общей активности за месяц: ${item.percent}%.`,
      icon: "bar-chart-3",
      tone: item.tone,
    })}>
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.count)} операций</span>
      </div>
      <div class="stats-bar" aria-hidden="true">
        <i style="width: ${escapeHtml(item.percent)}%"></i>
      </div>
    </button>
  `;
}

function renderPersonStat(item) {
  return `
    <button class="person-stat tone-${escapeHtml(item.tone)}" type="button"${detailAttrs({
      kind: "stat",
      title: item.name,
      subtitle: `${item.value} ${item.details}`,
      body: "Показывает, кто чаще создавал или закрывал семейные операции.",
      icon: "user-round-check",
      tone: item.tone,
    })}>
      <strong>${escapeHtml(item.value)}</strong>
      <span>${escapeHtml(item.name)}</span>
      <small>${escapeHtml(item.details)}</small>
    </button>
  `;
}

function renderRecentItem(item) {
  return `
    <button class="stats-recent-item" type="button"${detailAttrs({
      kind: "stat",
      title: item.title,
      subtitle: item.value,
      body: item.details,
      icon: item.icon,
      tone: "blue",
    })}>
      <span>${icon(item.icon)}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.details)}</small>
      </div>
      <em>${escapeHtml(item.value)}</em>
    </button>
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
