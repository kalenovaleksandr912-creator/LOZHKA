import cors from "@fastify/cors";
import Fastify from "fastify";
import { prisma } from "./lib/prisma.js";
import { attachRequestContext } from "./lib/request-context.js";
import { authRoutes } from "./routes/auth.js";
import { calendarRoutes } from "./routes/calendar.js";
import { menuRoutes } from "./routes/menu.js";
import { peopleRoutes } from "./routes/people.js";
import { shoppingRoutes } from "./routes/shopping.js";
import { statsRoutes } from "./routes/stats.js";
import { tasksRoutes } from "./routes/tasks.js";
import { todayRoutes } from "./routes/today.js";

export async function buildApp(options = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  await app.register(cors, {
    origin: process.env.FRONTEND_ORIGIN?.split(",") ?? true,
  });

  app.addHook("onRequest", attachRequestContext);

  app.get("/health", async () => ({
    ok: true,
    service: "lozhka-backend",
  }));

  await app.register(authRoutes, { prefix: "/api" });
  await app.register(todayRoutes, { prefix: "/api" });
  await app.register(tasksRoutes, { prefix: "/api" });
  await app.register(calendarRoutes, { prefix: "/api" });
  await app.register(menuRoutes, { prefix: "/api" });
  await app.register(shoppingRoutes, { prefix: "/api" });
  await app.register(peopleRoutes, { prefix: "/api" });
  await app.register(statsRoutes, { prefix: "/api" });

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    request.log.error({ error }, error.message);
    reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : error.message,
    });
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
