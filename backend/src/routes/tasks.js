import { getSpaceId, getUserId } from "../lib/request-context.js";
import { logOperation } from "../lib/operations.js";
import { prisma } from "../lib/prisma.js";
import { addDays, parseDateOnly } from "../utils/date.js";

const taskInclude = {
  assigneeUser: { select: { id: true, name: true, avatarInitials: true } },
  createdBy: { select: { id: true, name: true } },
  completedBy: { select: { id: true, name: true } },
};

const categories = new Set(["HOME", "PRODUCTS", "HEALTH", "ERRAND", "OTHER"]);
const assigneeTypes = new Set(["USER", "SHARED", "UNASSIGNED"]);

function assertTitle(body) {
  const title = body?.title?.trim();

  if (!title) {
    const error = new Error("Task title is required.");
    error.statusCode = 400;
    throw error;
  }

  return title;
}

function enumOrDefault(value, allowed, fallback) {
  const normalized = String(value ?? fallback).toUpperCase();
  return allowed.has(normalized) ? normalized : fallback;
}

function buildTaskWhere(spaceId, query) {
  const where = { spaceId, deletedAt: null };
  const view = query.view ? String(query.view) : null;

  if (query.status) {
    where.status = String(query.status).toUpperCase() === "DONE" ? "DONE" : "ACTIVE";
  }

  if (view === "completed") {
    where.status = "DONE";
  }

  if (view === "today") {
    const date = parseDateOnly(query.date);
    where.deadline = { gte: date, lt: addDays(date, 1) };
  }

  if (view === "upcoming") {
    const date = parseDateOnly(query.date);
    where.deadline = { gte: addDays(date, 1) };
    where.status = "ACTIVE";
  }

  if (view === "no-date") {
    where.deadline = null;
    where.status = "ACTIVE";
  }

  return where;
}

export async function tasksRoutes(app) {
  app.get("/tasks", async (request) => {
    const spaceId = getSpaceId(request);

    return prisma.task.findMany({
      where: buildTaskWhere(spaceId, request.query ?? {}),
      include: taskInclude,
      orderBy: [{ status: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
    });
  });

  app.post("/tasks", async (request, reply) => {
    const spaceId = getSpaceId(request);
    const userId = getUserId(request);
    const body = request.body ?? {};
    const title = assertTitle(body);
    const assigneeType = enumOrDefault(body.assigneeType, assigneeTypes, "UNASSIGNED");

    const task = await prisma.task.create({
      data: {
        spaceId,
        title,
        details: body.details?.trim() || null,
        category: enumOrDefault(body.category, categories, "OTHER"),
        assigneeType,
        assigneeUserId: assigneeType === "USER" ? body.assigneeUserId || null : null,
        deadline: body.deadline ? parseDateOnly(body.deadline) : null,
        createdById: userId,
      },
      include: taskInclude,
    });

    await logOperation({ spaceId, userId, type: "TASK_CREATED", entityType: "Task", entityId: task.id });

    reply.status(201);
    return task;
  });

  app.patch("/tasks/:id/complete", async (request) => {
    const spaceId = getSpaceId(request);
    const userId = getUserId(request);
    const completed = request.body?.completed ?? true;

    const existing = await prisma.task.findFirst({
      where: { id: request.params.id, spaceId, deletedAt: null },
    });

    if (!existing) {
      const error = new Error("Task not found.");
      error.statusCode = 404;
      throw error;
    }

    const task = await prisma.task.update({
      where: { id: existing.id },
      data: {
        status: completed ? "DONE" : "ACTIVE",
        completedAt: completed ? new Date() : null,
        completedById: completed ? userId : null,
      },
      include: taskInclude,
    });

    if (completed) {
      await logOperation({ spaceId, userId, type: "TASK_COMPLETED", entityType: "Task", entityId: task.id });
    }

    return task;
  });
}
