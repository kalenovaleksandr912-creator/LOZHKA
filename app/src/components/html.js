export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function icon(name) {
  return `<i data-lucide="${escapeHtml(name)}" aria-hidden="true"></i>`;
}

export function htmlAttrs(attributes = {}) {
  return Object.entries(attributes)
    .map(([name, value]) => {
      if (value === true) return ` ${name}`;
      if (value === false || value === null || value === undefined || value === "") return "";
      return ` ${name}="${escapeHtml(value)}"`;
    })
    .join("");
}

export function pageShell(name, label, content, isActive = false) {
  return `
    <section class="app-page${isActive ? " is-active" : ""}" data-page="${escapeHtml(name)}" aria-label="${escapeHtml(label)}"${isActive ? "" : " hidden"}>
      ${content}
    </section>
  `;
}

export function detailAttrs({ kind, title, subtitle, body, icon: iconName, tone, primaryAction, targetPage } = {}) {
  return htmlAttrs({
    "data-detail-kind": kind,
    "data-detail-title": title,
    "data-detail-subtitle": subtitle,
    "data-detail-body": body,
    "data-detail-icon": iconName,
    "data-detail-tone": tone,
    "data-detail-primary-action": primaryAction,
    "data-detail-target-page": targetPage,
  });
}

export function sectionTitle({ eyebrow, title, action, actionLabel, targetPage, calendarView, shoppingTab, detail, attrs = {} }) {
  const actionAttrs = htmlAttrs({
    "aria-label": actionLabel ?? action,
    "data-target-page": targetPage,
    "data-calendar-shortcut": calendarView,
    "data-shopping-shortcut": shoppingTab,
    ...attrs,
  });

  return `
    <div class="section-title">
      <div>
        ${eyebrow ? `<p>${escapeHtml(eyebrow)}</p>` : ""}
        <h3>${escapeHtml(title)}</h3>
      </div>
      ${action ? `<button type="button"${actionAttrs}${detail ? detailAttrs(detail) : ""}>${escapeHtml(action)}</button>` : ""}
    </div>
  `;
}

export function agendaCard(item) {
  return `
    <button class="agenda-card ${escapeHtml(item.kind)}-kind" type="button"${detailAttrs({
      kind: item.kind,
      title: item.title,
      subtitle: item.time,
      body: item.details,
      icon: item.icon,
      tone: item.kind,
    })}>
      <time>${escapeHtml(item.time)}</time>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.details)}</small>
      </div>
    </button>
  `;
}
