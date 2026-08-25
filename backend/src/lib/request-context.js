import { prisma } from "./prisma.js";

function bearerToken(request) {
  const header = request.headers.authorization;
  if (!header) return null;

  const [scheme, token] = String(header).split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

export async function attachRequestContext(request) {
  const token = bearerToken(request);

  if (!token) return;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: true,
      space: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) return;

  request.auth = {
    token,
    sessionId: session.id,
    userId: session.userId,
    spaceId: session.spaceId,
    user: session.user,
    space: session.space,
  };

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });
}

export function getSpaceId(request) {
  return request.auth?.spaceId ?? request.headers["x-space-id"] ?? process.env.DEFAULT_SPACE_ID ?? "demo-space";
}

export function getUserId(request) {
  return request.auth?.userId ?? request.headers["x-user-id"] ?? process.env.DEFAULT_USER_ID ?? "demo-alex";
}
