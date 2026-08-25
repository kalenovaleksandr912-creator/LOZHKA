import { tasks as mockTasks } from "../data/mock-data.js?v=19";
import { escapeHtml, pageShell, sectionTitle } from "../components/html.js?v=19";
import { toViewTasks } from "../lib/task-view.js?v=19";

const ownerClass = {
  me: "assignee-me",
  her: "assignee-her",
  shared: "assignee-shared",
};

const initialTasks = toViewTasks(mockTasks);

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
        <input type="checkbox"${task.completed ? " checked" : ""}${task.id ? ` data-task-complete data-task-id="${escapeHtml(task.id)}"` : ""} />
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

function renderTaskSummary(tasks) {
  const activeCount = tasks.filter((task) => !task.completed).length;
  const todayCount = tasks.filter((task) => !task.completed && task.date === "Сегодня").length;
  const sharedCount = tasks.filter((task) => !task.completed && task.owner === "shared").length;

  return `
    <article><strong>${activeCount}</strong><span>активных</span></article>
    <article><strong>${todayCount}</strong><span>сегодня</span></article>
    <article><strong>${sharedCount}</strong><span>общие</span></article>
  `;
}

export function renderTasksBoard(tasks) {
  if (tasks.length === 0) {
    return `
      ${sectionTitle({ title: "Сегодня и ближайшее" })}
      <article class="task-card">
        <div class="task-check">
          <span>
            <strong>Задач пока нет</strong>
            <small>Создай первую через кнопку +</small>
          </span>
        </div>
      </article>
    `;
  }

  return `
    ${sectionTitle({ title: "Сегодня и ближайшее" })}
    ${tasks.map(renderTaskCard).join("")}
  `;
}

export function renderTasksPage(taskList = initialTasks) {
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

      <div class="summary-strip" id="taskSummaryStrip" aria-label="Сводка задач">
        ${renderTaskSummary(taskList)}
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

      <section class="task-board" id="tasksBoard" aria-labelledby="activeTasksTitle">
        ${renderTasksBoard(taskList)}
      </section>
    `,
  );
}

export function renderTaskViews(tasks) {
  const summary = document.getElementById("taskSummaryStrip");
  const board = document.getElementById("tasksBoard");

  if (summary) {
    summary.innerHTML = renderTaskSummary(tasks);
  }

  if (board) {
    board.innerHTML = renderTasksBoard(tasks);
  }
}
