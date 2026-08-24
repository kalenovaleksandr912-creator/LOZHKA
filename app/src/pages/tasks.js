import { tasks } from "../data/mock-data.js?v=11";
import { escapeHtml, pageShell, sectionTitle } from "../components/html.js?v=11";

const ownerClass = {
  me: "assignee-me",
  her: "assignee-her",
  shared: "assignee-shared",
};

function renderTaskCard(task) {
  const classes = [
    "task-card",
    ownerClass[task.owner] ?? "",
    task.priorityToday ? "priority-today" : "",
    task.completed ? "muted-card" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <article class="${classes}">
      <label class="task-check">
        <input type="checkbox"${task.completed ? " checked" : ""} />
        <span>
          <strong>${escapeHtml(task.title)}</strong>
          <small>${escapeHtml(task.details)}</small>
        </span>
      </label>
      <div class="meta-row">
        <span>${escapeHtml(task.assignee)}</span>
        <span>${escapeHtml(task.date)}</span>
      </div>
    </article>
  `;
}

export function renderTasksPage() {
  return pageShell(
    "tasks",
    "Задачи",
    `
      <section class="page-hero">
        <div>
          <p>Рабочий список</p>
          <h1>Задачи</h1>
        </div>
        <button class="add-button" type="button" aria-label="Создать задачу">
          <span aria-hidden="true">+</span>
        </button>
      </section>

      <div class="summary-strip" aria-label="Сводка задач">
        <article><strong>7</strong><span>активных</span></article>
        <article><strong>3</strong><span>сегодня</span></article>
        <article><strong>2</strong><span>общие</span></article>
      </div>

      <section class="filter-block" aria-label="Фильтры задач">
        <div class="chip-row">
          <button class="chip is-active" type="button">Все</button>
          <button class="chip" type="button">Александр</button>
          <button class="chip" type="button">Настя</button>
          <button class="chip" type="button">Общие</button>
        </div>
        <div class="chip-row compact">
          <button class="chip is-soft-active" type="button">Сегодня</button>
          <button class="chip" type="button">Предстоящие</button>
          <button class="chip" type="button">Без срока</button>
          <button class="chip" type="button">Выполненные</button>
        </div>
      </section>

      <section class="task-board" aria-labelledby="activeTasksTitle">
        ${sectionTitle({ title: "Сегодня и ближайшее" })}
        ${tasks.map(renderTaskCard).join("")}
      </section>
    `,
  );
}
