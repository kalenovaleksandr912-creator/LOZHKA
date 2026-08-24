import { prisma } from "./prisma.js";

export async function logOperation({ spaceId, userId, type, entityType, entityId }) {
  await prisma.operationLog.create({
    data: {
      spaceId,
      userId,
      type,
      entityType,
      entityId,
    },
  });
}
