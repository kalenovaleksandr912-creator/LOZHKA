import { moreGroups } from "../data/mock-data.js?v=12";
import { escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=12";

function renderMoreRow(item) {
  const targetPage = item.targetPage ? ` data-target-page="${escapeHtml(item.targetPage)}"` : "";
  const staticClass = item.targetPage ? "" : " is-static";

  return `
    <button class="more-row${staticClass}" type="button"${targetPage}>
      <span class="row-icon ${escapeHtml(item.tone)}">${icon(item.icon)}</span>
      <span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.details)}</small>
      </span>
      ${item.targetPage ? icon("chevron-right") : ""}
    </button>
  `;
}

export function renderMorePage() {
  return pageShell(
    "more",
    "Ещё",
    `
      <section class="page-hero">
        <div>
          <p>Разделы</p>
          <h1>Ещё</h1>
        </div>
      </section>

      ${moreGroups
        .map(
          (group) => `
            <section class="more-group">
              ${sectionTitle({ eyebrow: group.label, title: group.title })}
              ${group.items.map(renderMoreRow).join("")}
            </section>
          `,
        )
        .join("")}
    `,
  );
}
