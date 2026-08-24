import { getSpaceId, getUserId } from "../lib/request-context.js";
import { logOperation } from "../lib/operations.js";
import { prisma } from "../lib/prisma.js";
import { parseDateOnly } from "../utils/date.js";

export async function peopleRoutes(app) {
  app.get("/people", async (request) => {
    const spaceId = getSpaceId(request);

    return prisma.person.findMany({
      where: { spaceId, deletedAt: null },
      orderBy: [{ birthday: "asc" }, { fullName: "asc" }],
    });
  });

  app.post("/people", async (request, reply) => {
    const spaceId = getSpaceId(request);
    const userId = getUserId(request);
    const body = request.body ?? {};
    const fullName = body.fullName?.trim();

    if (!fullName) {
      const error = new Error("Person fullName is required.");
      error.statusCode = 400;
      throw error;
    }

    const person = await prisma.person.create({
      data: {
        spaceId,
        fullName,
        birthday: body.birthday ? parseDateOnly(body.birthday) : null,
        note: body.note?.trim() || null,
      },
    });

    await logOperation({ spaceId, userId, type: "PERSON_CREATED", entityType: "Person", entityId: person.id });

    reply.status(201);
    return person;
  });
}
