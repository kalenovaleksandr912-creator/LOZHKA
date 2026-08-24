import { getSpaceId, getUserId } from "../lib/request-context.js";
import { prisma } from "../lib/prisma.js";
import { addDays, formatDateOnly, isSameMonthDay, parseDateOnly } from "../utils/date.js";

function filterRecurringForDate(items, date, sourceField) {
  return items.filter((item) => item[sourceField] && isSameMonthDay(item[sourceField], date));
}

export async function todayRoutes(app) {
  app.get("/today", async (request) => {
    const spaceId = getSpaceId(request);
    const userId = getUserId(request);
    const date = parseDateOnly(request.query?.date);
    const nextDate = addDays(date, 1);

    const [tasks, events, menuPlanItems, shoppingItems, people, importantDates, dailyPhotoPrompt] = await Promise.all([
      prisma.task.findMany({
        where: { spaceId, deletedAt: null, deadline: { gte: date, lt: nextDate } },
        include: { assigneeUser: { select: { id: true, name: true, avatarInitials: true } } },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      }),
      prisma.event.findMany({
        where: { spaceId, deletedAt: null, date: { gte: date, lt: nextDate } },
        orderBy: [{ time: "asc" }, { createdAt: "desc" }],
      }),
      prisma.menuPlanItem.findMany({
        where: { spaceId, deletedAt: null, date: { gte: date, lt: nextDate } },
        include: { dish: { include: { ingredients: true } } },
        orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
      }),
      prisma.shoppingItem.findMany({
        where: { spaceId, deletedAt: null, shoppingDate: { gte: date, lt: nextDate } },
        orderBy: [{ status: "asc" }, { category: "asc" }, { createdAt: "desc" }],
      }),
      prisma.person.findMany({ where: { spaceId, deletedAt: null, birthday: { not: null } } }),
      prisma.importantDate.findMany({ where: { spaceId, deletedAt: null } }),
      prisma.dailyPhotoPrompt.findUnique({
        where: { spaceId_date: { spaceId, date } },
        include: {
          photos: {
            include: { user: { select: { id: true, name: true, avatarInitials: true } } },
          },
        },
      }),
    ]);

    return {
      date: formatDateOnly(date),
      tasks,
      events,
      menu: menuPlanItems,
      shopping: shoppingItems,
      birthdays: filterRecurringForDate(people, date, "birthday"),
      importantDates: filterRecurringForDate(importantDates, date, "date"),
      dailyPhoto: dailyPhotoPrompt
        ? {
            ...dailyPhotoPrompt,
            myPhoto: dailyPhotoPrompt.photos.find((photo) => photo.userId === userId) ?? null,
            partnerPhotos: dailyPhotoPrompt.photos.filter((photo) => photo.userId !== userId),
          }
        : null,
    };
  });
}
