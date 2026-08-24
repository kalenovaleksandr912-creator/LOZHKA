import { menuCategories } from "../data/mock-data.js?v=13";
import { escapeHtml, icon, pageShell, sectionTitle } from "../components/html.js?v=13";

function renderDish(dish) {
  return `
    <article class="dish-card">
      <div>
        <strong>${escapeHtml(dish.title)}</strong>
        <small>${escapeHtml(dish.details)}</small>
        <span class="dish-tags">
          ${dish.tags.map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}
        </span>
      </div>
      <button class="dish-action" type="button" aria-label="Выбрать ${escapeHtml(dish.title)} в календарь">
        ${icon("calendar-plus")}
      </button>
    </article>
  `;
}

function renderMenuCategory(category) {
  return `
    <section class="menu-category category-${escapeHtml(category.key)}">
      <header>
        <span class="row-icon ${escapeHtml(category.tone)}">${icon(category.icon)}</span>
        <div>
          <p>${escapeHtml(category.subtitle)}</p>
          <h3>${escapeHtml(category.title)}</h3>
        </div>
        <strong>${category.dishes.length}</strong>
      </header>
      <div class="dish-list">
        ${category.dishes.map(renderDish).join("")}
      </div>
    </section>
  `;
}

export function renderMenuPage() {
  return pageShell(
    "menu",
    "Меню",
    `
      <section class="secondary-hero menu-hero">
        <button class="icon-button" type="button" aria-label="Назад в Ещё" data-target-page="more">
          ${icon("chevron-left")}
        </button>
        <div>
          <p>Библиотека блюд</p>
          <h1>Меню</h1>
        </div>
        <button class="icon-button" type="button" aria-label="Открыть покупки" data-target-page="shopping">
          ${icon("shopping-bag")}
        </button>
      </section>

      <section class="menu-summary">
        <div>
          <span>Всего</span>
          <strong>12 блюд</strong>
        </div>
        <div>
          <span>Для календаря</span>
          <strong>4 типа</strong>
        </div>
      </section>

      <section class="menu-library">
        ${sectionTitle({ eyebrow: "Выбор блюда", title: "Добавить в день из календаря" })}
        ${menuCategories.map(renderMenuCategory).join("")}
      </section>
    `,
  );
}
