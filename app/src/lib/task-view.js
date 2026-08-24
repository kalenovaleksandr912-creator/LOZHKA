export const DEFAULT_TASK_DATE = "2026-08-24";

const userIdToOwner = {
  "demo-alex": "me",
  "demo-nastya": "her",
};

const userNameFallback = {
  "demo-alex": "Александр",
  "demo-nastya": "Настя",
};

function formatDateLabel(value, completed) {
  if (completed) return "Выполнено";
  if (!value) return "Без срока";

  const dateOnly = String(value).slice(0, 10);
  if (dateOnly === DEFAULT_TASK_DATE) return "Сегодня";

  const [, month, day] = dateOnly.split("-");
  return `${day}.${month}`;
}

function getAssignee(task) {
  if (task.assignee) return task.assignee;
  if (task.assigneeType === "SHARED") return "Общее";
  if (task.assigneeType === "UNASSIGNED") return "Не назначено";
  if (task.assigneeUser?.name) return task.assigneeUser.name;
  return userNameFallback[task.assigneeUserId] ?? "Не назначено";
}

function getOwner(task) {
  if (task.owner) return task.owner;
  if (task.assigneeType === "SHARED") return "shared";
  if (task.assigneeType === "USER") return userIdToOwner[task.assigneeUserId] ?? "me";
  return "shared";
}

export function toViewTask(task) {
  const completed = task.completed ?? task.status === "DONE";
  const deadline = task.deadline ?? null;
  const date = task.date ?? formatDateLabel(deadline, completed);

  return {
    id: task.id ?? "",
    title: task.title,
    details: task.details || (deadline ? "Задача с дедлайном" : "Без срока"),
    assignee: getAssignee(task),
    date,
    owner: getOwner(task),
    completed,
    priorityToday: task.priorityToday ?? (!completed && date === "Сегодня"),
  };
}

export function toViewTasks(items) {
  return items.map(toViewTask);
}
