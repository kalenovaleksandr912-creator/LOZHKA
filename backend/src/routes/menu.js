import { getSpaceId, getUserId } from "../lib/request-context.js";
import { logOperation } from "../lib/operations.js";
import { prisma } from "../lib/prisma.js";
import { parseDateOnly } from "../utils/date.js";

const mealTypes = new Set(["BREAKFAST", "LUNCH", "DINNER", "DESSERT", "SNACK"]);

function mealTypeOrDefault(value, fallback = "DINNER") {
  const normalized = String(value ?? fallback).toUpperCase();
  return mealTypes.has(normalized) ? normalized : fallback;
}

function normalizeIngredients(ingredients) {
  if (!Array.isArray(ingredients)) return [];

  return ingredients
    .map((item) => ({
      name: item?.name?.trim(),
      amount: item?.amount?.trim() || null,
    }))
    .filter((item) => item.name);
}

export async function menuRoutes(app) {
  app.get("/menu", async (request) => {
    const spaceId = getSpaceId(request);
    const mealType = request.query?.mealType ? mealTypeOrDefault(request.query.mealType) : undefined;

    const dishes = await prisma.dish.findMany({
      where: {
        spaceId,
        deletedAt: null,
        ...(mealType ? { mealType } : {}),
      },
      include: { ingredients: true },
      orderBy: [{ mealType: "asc" }, { title: "asc" }],
    });

    return { dishes };
  });

  app.post("/menu/dishes", async (request, reply) => {
    const spaceId = getSpaceId(request);
    const userId = getUserId(request);
    const body = request.body ?? {};
    const title = body.title?.trim();

    if (!title) {
      const error = new Error("Dish title is required.");
      error.statusCode = 400;
      throw error;
    }

    const dish = await prisma.dish.create({
      data: {
        spaceId,
        title,
        mealType: mealTypeOrDefault(body.mealType),
        createdById: userId,
        ingredients: {
          create: normalizeIngredients(body.ingredients),
        },
      },
      include: { ingredients: true },
    });

    await logOperation({ spaceId, userId, type: "DISH_CREATED", entityType: "Dish", entityId: dish.id });

    reply.status(201);
    return dish;
  });

  app.post("/menu/plans", async (request, reply) => {
    const spaceId = getSpaceId(request);
    const userId = getUserId(request);
    const body = request.body ?? {};

    if (!body.dishId || !body.date) {
      const error = new Error("dishId and date are required.");
      error.statusCode = 400;
      throw error;
    }

    const dish = await prisma.dish.findFirst({
      where: { id: body.dishId, spaceId, deletedAt: null },
    });

    if (!dish) {
      const error = new Error("Dish not found.");
      error.statusCode = 404;
      throw error;
    }

    const plan = await prisma.menuPlanItem.create({
      data: {
        spaceId,
        dishId: dish.id,
        date: parseDateOnly(body.date),
        mealType: mealTypeOrDefault(body.mealType, dish.mealType),
        createdById: userId,
      },
      include: { dish: { include: { ingredients: true } } },
    });

    await logOperation({ spaceId, userId, type: "MENU_PLANNED", entityType: "MenuPlanItem", entityId: plan.id });

    reply.status(201);
    return plan;
  });
}
