import { getSpaceId } from "../lib/request-context.js";
import { prisma } from "../lib/prisma.js";

function daysSince(date) {
  if (!date) return null;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / dayMs) + 1);
}

export async function statsRoutes(app) {
  app.get("/stats", async (request) => {
    const spaceId = getSpaceId(request);

    const [
      space,
      tasksTotal,
      tasksDone,
      eventsTotal,
      dishesTotal,
      menuTotal,
      shoppingTotal,
      shoppingDone,
      peopleTotal,
      importantDatesTotal,
      dailyPhotosTotal,
      operationsTotal,
      operationsByType,
      memberStats,
    ] = await Promise.all([
      prisma.space.findUnique({ where: { id: spaceId } }),
      prisma.task.count({ where: { spaceId, deletedAt: null } }),
      prisma.task.count({ where: { spaceId, deletedAt: null, status: "DONE" } }),
      prisma.event.count({ where: { spaceId, deletedAt: null } }),
      prisma.dish.count({ where: { spaceId, deletedAt: null } }),
      prisma.menuPlanItem.count({ where: { spaceId, deletedAt: null } }),
      prisma.shoppingItem.count({ where: { spaceId, deletedAt: null } }),
      prisma.shoppingItem.count({ where: { spaceId, deletedAt: null, status: "DONE" } }),
      prisma.person.count({ where: { spaceId, deletedAt: null } }),
      prisma.importantDate.count({ where: { spaceId, deletedAt: null } }),
      prisma.dailyPhoto.count({ where: { prompt: { spaceId } } }),
      prisma.operationLog.count({ where: { spaceId } }),
      prisma.operationLog.groupBy({
        by: ["type"],
        where: { spaceId },
        _count: { _all: true },
      }),
      prisma.operationLog.groupBy({
        by: ["userId"],
        where: { spaceId },
        _count: { _all: true },
      }),
    ]);

    return {
      daysTogether: daysSince(space?.relationshipStartDate),
      daysMarried: daysSince(space?.weddingDate),
      operationsTotal,
      totals: {
        tasks: tasksTotal,
        tasksDone,
        events: eventsTotal,
        dishes: dishesTotal,
        menuPlans: menuTotal,
        shopping: shoppingTotal,
        shoppingDone,
        people: peopleTotal,
        importantDates: importantDatesTotal,
        dailyPhotos: dailyPhotosTotal,
      },
      operationsByType: operationsByType.map((item) => ({
        type: item.type,
        count: item._count._all,
      })),
      operationsByUser: memberStats.map((item) => ({
        userId: item.userId,
        count: item._count._all,
      })),
    };
  });
}
