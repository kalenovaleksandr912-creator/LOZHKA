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

export function pageShell(name, label, content, isActive = false) {
  return `
    <section class="app-page${isActive ? " is-active" : ""}" data-page="${escapeHtml(name)}" aria-label="${escapeHtml(label)}"${isActive ? "" : " hidden"}>
      ${content}
    </section>
  `;
}

export function sectionTitle({ eyebrow, title, action, actionLabel }) {
  return `
    <div class="section-title">
      <div>
        ${eyebrow ? `<p>${escapeHtml(eyebrow)}</p>` : ""}
        <h3>${escapeHtml(title)}</h3>
      </div>
      ${action ? `<a href="#" aria-label="${escapeHtml(actionLabel ?? action)}">${escapeHtml(action)}</a>` : ""}
    </div>
  `;
}

export function agendaCard(item) {
  return `
    <article class="agenda-card ${escapeHtml(item.kind)}-kind">
      <time>${escapeHtml(item.time)}</time>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.details)}</small>
      </div>
    </article>
  `;
}
