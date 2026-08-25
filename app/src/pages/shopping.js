import { shoppingLists } from "../data/mock-data.js?v=21";
import { detailAttrs, escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=21";

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
    <button class="shopping-item category-${escapeHtml(item.category)} priority-${priorityClass[item.priority] ?? "normal"}" type="button" data-shopping-item${detailAttrs({
      kind: "shopping",
      title: item.title,
      subtitle: item.details,
      body: `${categoryMeta[item.category]?.title ?? "Покупка"} · ${item.owner} · ${item.priority}`,
      icon: item.category === "products" ? "apple" : "package",
      tone: item.category,
    })}>
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

export function renderShoppingOverview(lists = shoppingLists) {
  const allItems = lists.flatMap((group) => group.items);
  const todayItems = lists.find((group) => group.key === "today")?.items ?? [];
  const productCount = allItems.filter((item) => item.category === "products").length;
  const otherCount = allItems.filter((item) => item.category === "other").length;

  return `
    <article>
      <span>Сегодня</span>
      <strong>${todayItems.length}</strong>
      <small>позиции</small>
    </article>
    <article>
      <span>Продукты</span>
      <strong>${productCount}</strong>
      <small>позиций</small>
    </article>
    <article>
      <span>Остальное</span>
      <strong>${otherCount}</strong>
      <small>позиций</small>
    </article>
  `;
}

export function renderShoppingGroups(lists = shoppingLists) {
  return lists.map(renderShoppingGroup).join("");
}

export function renderShoppingViews(lists = shoppingLists) {
  const overview = document.getElementById("shoppingOverview");
  const groupsRoot = document.getElementById("shoppingGroupsRoot");

  if (overview) {
    overview.innerHTML = renderShoppingOverview(lists);
  }

  if (groupsRoot) {
    groupsRoot.innerHTML = renderShoppingGroups(lists);
  }
}

export function renderShoppingPage(lists = shoppingLists) {
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
        <button class="add-button" type="button" aria-label="Добавить покупку" data-add-view="purchase">
          <span aria-hidden="true">+</span>
        </button>
      </section>

      <section class="shopping-overview" id="shoppingOverview">
        ${renderShoppingOverview(lists)}
      </section>

      <div class="shopping-tabs" aria-label="Фильтры покупок">
        <button class="is-active" type="button" data-shopping-tab="today">Сегодня</button>
        <button type="button" data-shopping-tab="upcoming">Предстоящие</button>
        <button type="button" data-shopping-tab="no-date">Без даты</button>
      </div>

      <div id="shoppingGroupsRoot">
        ${renderShoppingGroups(lists)}
      </div>
    `,
  );
}
