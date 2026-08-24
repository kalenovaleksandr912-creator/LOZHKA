import { getSpaceId, getUserId } from "../lib/request-context.js";
import { logOperation } from "../lib/operations.js";
import { prisma } from "../lib/prisma.js";
import { addDays, parseDateOnly } from "../utils/date.js";

const categories = new Set(["PRODUCTS", "HOUSEHOLD", "HOME", "OTHER"]);

function enumOrDefault(value, allowed, fallback) {
  const normalized = String(value ?? fallback).toUpperCase();
  return allowed.has(normalized) ? normalized : fallback;
}

function buildShoppingWhere(spaceId, query) {
  const where = { spaceId, deletedAt: null };
  const scope = query.scope ? String(query.scope) : "today";
  const date = parseDateOnly(query.date);

  if (scope === "today") {
    where.shoppingDate = { gte: date, lt: addDays(date, 1) };
  }

  if (scope === "upcoming") {
    where.shoppingDate = { gte: addDays(date, 1) };
  }

  if (scope === "no-date") {
    where.shoppingDate = null;
  }

  if (query.category) {
    where.category = enumOrDefault(query.category, categories, "OTHER");
  }

  return where;
}

export async function shoppingRoutes(app) {
  app.get("/shopping", async (request) => {
    const spaceId = getSpaceId(request);

    return prisma.shoppingItem.findMany({
      where: buildShoppingWhere(spaceId, request.query ?? {}),
      orderBy: [{ status: "asc" }, { shoppingDate: "asc" }, { createdAt: "desc" }],
    });
  });

  app.post("/shopping", async (request, reply) => {
    const spaceId = getSpaceId(request);
    const userId = getUserId(request);
    const body = request.body ?? {};
    const title = body.title?.trim();

    if (!title) {
      const error = new Error("Shopping item title is required.");
      error.statusCode = 400;
      throw error;
    }

    const item = await prisma.shoppingItem.create({
      data: {
        spaceId,
        title,
        amount: body.amount?.trim() || null,
        note: body.note?.trim() || null,
        category: enumOrDefault(body.category, categories, "OTHER"),
        shoppingDate: body.shoppingDate ? parseDateOnly(body.shoppingDate) : null,
        createdById: userId,
      },
    });

    await logOperation({ spaceId, userId, type: "SHOPPING_CREATED", entityType: "ShoppingItem", entityId: item.id });

    reply.status(201);
    return item;
  });

  app.patch("/shopping/:id/complete", async (request) => {
    const spaceId = getSpaceId(request);
    const userId = getUserId(request);
    const completed = request.body?.completed ?? true;

    const existing = await prisma.shoppingItem.findFirst({
      where: { id: request.params.id, spaceId, deletedAt: null },
    });

    if (!existing) {
      const error = new Error("Shopping item not found.");
      error.statusCode = 404;
      throw error;
    }

    const item = await prisma.shoppingItem.update({
      where: { id: existing.id },
      data: {
        status: completed ? "DONE" : "ACTIVE",
        completedAt: completed ? new Date() : null,
      },
    });

    if (completed) {
      await logOperation({ spaceId, userId, type: "SHOPPING_COMPLETED", entityType: "ShoppingItem", entityId: item.id });
    }

    return item;
  });
}
