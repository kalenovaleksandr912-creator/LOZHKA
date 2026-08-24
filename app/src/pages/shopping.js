import { shoppingLists } from "../data/mock-data.js?v=11";
import { escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=11";

const priorityClass = {
  Срочно: "urgent",
  "Надо сделать": "normal",
  "Когда-нибудь": "later",
};

const ownerClass = {
  Александр: "me",
  Настя: "her",
  Общее: "shared",
};

const categoryMeta = {
  products: { title: "Продукты", icon: "apple", tone: "products" },
  other: { title: "Остальное", icon: "package", tone: "other" },
};

function renderShoppingItem(item) {
  return `
    <button class="shopping-item category-${escapeHtml(item.category)} priority-${priorityClass[item.priority] ?? "normal"}" type="button">
      <span class="shopping-check${item.completed ? " is-done" : ""}">
        ${item.completed ? icon("check") : ""}
      </span>
      <span class="shopping-copy">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.details)}</small>
      </span>
      <span class="shopping-meta">
        <em class="owner-dot ${ownerClass[item.owner] ?? "shared"}">${escapeHtml(item.owner)}</em>
        <em>${escapeHtml(item.priority)}</em>
      </span>
    </button>
  `;
}

function renderCategoryBlock(categoryKey, items) {
  if (items.length === 0) return "";

  const meta = categoryMeta[categoryKey];

  return `
    <section class="shopping-category ${escapeHtml(meta.tone)}">
      <header>
        <span>${icon(meta.icon)}</span>
        <strong>${escapeHtml(meta.title)}</strong>
        <small>${items.length}</small>
      </header>
      <div class="shopping-list">
        ${items.map(renderShoppingItem).join("")}
      </div>
    </section>
  `;
}

function renderShoppingGroup(group, index) {
  const products = group.items.filter((item) => item.category === "products");
  const other = group.items.filter((item) => item.category === "other");

  return `
    <section class="shopping-group${index === 0 ? " is-primary" : ""}" data-shopping-group="${escapeHtml(group.key)}"${index === 0 ? "" : " hidden"}>
      ${sectionTitle({ eyebrow: group.title, title: group.subtitle })}
      ${renderCategoryBlock("products", products)}
      ${renderCategoryBlock("other", other)}
    </section>
  `;
}

export function renderShoppingPage() {
  return pageShell(
    "shopping",
    "Покупки",
    `
      <section class="secondary-hero shopping-hero">
        <button class="icon-button" type="button" aria-label="Назад в Ещё" data-target-page="more">
          ${icon("chevron-left")}
        </button>
        <div>
          <p>Списки</p>
          <h1>Покупки</h1>
        </div>
        <button class="add-button" type="button" aria-label="Добавить покупку">
          <span aria-hidden="true">+</span>
        </button>
      </section>

      <section class="shopping-overview">
        <article>
          <span>Сегодня</span>
          <strong>6</strong>
          <small>позиции</small>
        </article>
        <article>
          <span>Продукты</span>
          <strong>8</strong>
          <small>позиций</small>
        </article>
        <article>
          <span>Остальное</span>
          <strong>6</strong>
          <small>позиций</small>
        </article>
      </section>

      <div class="shopping-tabs" aria-label="Фильтры покупок">
        <button class="is-active" type="button" data-shopping-tab="today">Сегодня</button>
        <button type="button" data-shopping-tab="upcoming">Предстоящие</button>
        <button type="button" data-shopping-tab="no-date">Без даты</button>
      </div>

      ${shoppingLists.map(renderShoppingGroup).join("")}
    `,
  );
}
