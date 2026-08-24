import { getSpaceId } from "../lib/request-context.js";
import { prisma } from "../lib/prisma.js";
import { addDays, formatDateOnly, isSameMonthDay, parseDateOnly } from "../utils/date.js";

function enumerateDays(start, end) {
  const days = [];

  for (let day = new Date(start); day < end; day = addDays(day, 1)) {
    days.push(new Date(day));
  }

  return days;
}

function recurringItems(sourceItems, days, type, titleFactory) {
  return sourceItems.flatMap((item) =>
    days
      .filter((day) => item.date && isSameMonthDay(item.date, day))
      .map((day) => ({
        id: `${type}:${item.id}:${formatDateOnly(day)}`,
        sourceId: item.id,
        type,
        date: formatDateOnly(day),
        title: titleFactory(item),
        details: item.note ?? null,
      })),
  );
}

export async function calendarRoutes(app) {
  app.get("/calendar", async (request) => {
    const spaceId = getSpaceId(request);
    const from = parseDateOnly(request.query?.from);
    const to = request.query?.to ? parseDateOnly(request.query.to) : addDays(from, 7);
    const days = enumerateDays(from, to);

    const [tasks, events, menuPlanItems, shoppingItems, people, importantDates] = await Promise.all([
      prisma.task.findMany({
        where: { spaceId, deletedAt: null, deadline: { gte: from, lt: to } },
        include: { assigneeUser: { select: { id: true, name: true } } },
      }),
      prisma.event.findMany({
        where: { spaceId, deletedAt: null, date: { gte: from, lt: to } },
      }),
      prisma.menuPlanItem.findMany({
        where: { spaceId, deletedAt: null, date: { gte: from, lt: to } },
        include: { dish: true },
      }),
      prisma.shoppingItem.findMany({
        where: { spaceId, deletedAt: null, shoppingDate: { gte: from, lt: to } },
      }),
      prisma.person.findMany({
        where: { spaceId, deletedAt: null, birthday: { not: null } },
      }),
      prisma.importantDate.findMany({
        where: { spaceId, deletedAt: null },
      }),
    ]);

    return {
      from: formatDateOnly(from),
      to: formatDateOnly(to),
      items: [
        ...events.map((event) => ({
          id: `event:${event.id}`,
          sourceId: event.id,
          type: "event",
          date: formatDateOnly(event.date),
          time: event.time,
          title: event.title,
        })),
        ...tasks.map((task) => ({
          id: `task:${task.id}`,
          sourceId: task.id,
          type: "task",
          date: formatDateOnly(task.deadline),
          title: task.title,
          status: task.status,
          assignee: task.assigneeUser?.name ?? task.assigneeType,
        })),
        ...menuPlanItems.map((item) => ({
          id: `menu:${item.id}`,
          sourceId: item.id,
          type: "menu",
          date: formatDateOnly(item.date),
          mealType: item.mealType,
          title: item.dish.title,
        })),
        ...shoppingItems.map((item) => ({
          id: `shopping:${item.id}`,
          sourceId: item.id,
          type: "shopping",
          date: formatDateOnly(item.shoppingDate),
          title: item.title,
          status: item.status,
          category: item.category,
        })),
        ...recurringItems(
          people.map((person) => ({ ...person, date: person.birthday })),
          days,
          "birthday",
          (person) => `День рождения: ${person.fullName}`,
        ),
        ...recurringItems(importantDates, days, "important-date", (date) => date.title),
      ].sort((left, right) => left.date.localeCompare(right.date)),
    };
  });
}
