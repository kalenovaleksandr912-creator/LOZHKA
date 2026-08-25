import { tasks as mockTasks } from "../data/mock-data.js?v=21";
import { escapeHtml, pageShell, sectionTitle } from "../components/html.js?v=21";
import { toViewTasks } from "../lib/task-view.js?v=21";

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

export function getVisibleTasks(tasks, filters = {}) {
  const ownerFilter = filters.owner ?? "all";
  const dateFilter = filters.date ?? "today";

  return tasks.filter((task) => {
    const ownerMatches = ownerFilter === "all" || task.owner === ownerFilter;
    const dateMatches =
      dateFilter === "all" ||
      (dateFilter === "today" && !task.completed && task.date === "Сегодня") ||
      (dateFilter === "upcoming" && !task.completed && task.date !== "Сегодня" && task.date !== "Без срока") ||
      (dateFilter === "no-date" && !task.completed && task.date === "Без срока") ||
      (dateFilter === "completed" && task.completed);

    return ownerMatches && dateMatches;
  });
}

export function getTaskBoardTitle(filters = {}) {
  const titleByDate = {
    today: "Сегодня",
    upcoming: "Предстоящие",
    "no-date": "Без срока",
    completed: "Выполненные",
    all: "Все задачи",
  };

  return titleByDate[filters.date ?? "today"] ?? "Сегодня и ближайшее";
}

export function renderTasksBoard(tasks, title = "Сегодня") {
  if (tasks.length === 0) {
    return `
      ${sectionTitle({ title })}
      <article class="task-card">
        <div class="task-check">
          <span>
            <strong>Задач пока нет</strong>
            <small>Попробуй другой фильтр или создай новую через +</small>
          </span>
        </div>
      </article>
    `;
  }

  return `
    ${sectionTitle({ title })}
    ${tasks.map(renderTaskCard).join("")}
  `;
}

export function renderTasksPage(taskList = initialTasks) {
  const initialFilters = { owner: "all", date: "today" };
  const visibleTasks = getVisibleTasks(taskList, initialFilters);

  return pageShell(
    "tasks",
    "Задачи",
    `
      <section class="page-hero">
        <div>
          <p>Рабочий список</p>
          <h1>Задачи</h1>
        </div>
        <button class="add-button" type="button" aria-label="Создать задачу" data-add-view="task">
          <span aria-hidden="true">+</span>
        </button>
      </section>

      <div class="summary-strip" id="taskSummaryStrip" aria-label="Сводка задач">
        ${renderTaskSummary(taskList)}
      </div>

      <section class="filter-block" aria-label="Фильтры задач">
        <div class="chip-row">
          <button class="chip is-active" type="button" data-task-owner-filter="all">Все</button>
          <button class="chip" type="button" data-task-owner-filter="me">Александр</button>
          <button class="chip" type="button" data-task-owner-filter="her">Настя</button>
          <button class="chip" type="button" data-task-owner-filter="shared">Общие</button>
        </div>
        <div class="chip-row compact">
          <button class="chip is-soft-active" type="button" data-task-date-filter="today">Сегодня</button>
          <button class="chip" type="button" data-task-date-filter="upcoming">Предстоящие</button>
          <button class="chip" type="button" data-task-date-filter="no-date">Без срока</button>
          <button class="chip" type="button" data-task-date-filter="completed">Выполненные</button>
        </div>
      </section>

      <section class="task-board" id="tasksBoard" aria-labelledby="activeTasksTitle">
        ${renderTasksBoard(visibleTasks, getTaskBoardTitle(initialFilters))}
      </section>
    `,
  );
}

export function renderTaskViews(tasks, visibleTasks = tasks, title = "Сегодня") {
  const summary = document.getElementById("taskSummaryStrip");
  const board = document.getElementById("tasksBoard");

  if (summary) {
    summary.innerHTML = renderTaskSummary(tasks);
  }

  if (board) {
    board.innerHTML = renderTasksBoard(visibleTasks, title);
  }
}
