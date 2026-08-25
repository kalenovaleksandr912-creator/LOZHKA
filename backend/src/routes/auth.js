import { randomBytes, randomInt } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { parseDateOnly } from "../utils/date.js";

const contactTypes = new Set(["EMAIL", "PHONE"]);
const sessionDays = 30;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function unauthorized(message = "Unauthorized.") {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
}

function normalizeContactType(value) {
  const type = String(value ?? "phone").toUpperCase();
  return contactTypes.has(type) ? type : "PHONE";
}

function normalizeContact(type, value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    throw badRequest("Contact is required.");
  }

  if (type === "EMAIL") {
    const email = raw.toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw badRequest("Email is invalid.");
    }

    return email;
  }

  const phone = raw.replace(/[^\d+]/g, "");

  if (phone.replace(/\D/g, "").length < 10) {
    throw badRequest("Phone is invalid.");
  }

  return phone;
}

function normalizeInviteCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

function cleanNullableString(value) {
  return String(value ?? "").trim() || null;
}

function objectOrNull(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value;
}

function makeAuthCode() {
  return String(randomInt(100000, 1000000));
}

function makeSessionToken() {
  return randomBytes(32).toString("base64url");
}

function expiresIn(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function sessionExpiresAt() {
  return new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
}

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase("ru-RU");
  }

  return (parts[0]?.slice(0, 2) || "ЛО").toLocaleUpperCase("ru-RU");
}

async function createInviteCode() {
  for (let index = 0; index < 10; index += 1) {
    const inviteCode = `LOZHKA-${randomInt(1000, 10000)}`;
    const existing = await prisma.space.findUnique({ where: { inviteCode } });

    if (!existing) {
      return inviteCode;
    }
  }

  throw new Error("Could not generate invite code.");
}

function authCodeWhere(body) {
  const contactType = normalizeContactType(body?.method ?? body?.contactType);
  const contact = normalizeContact(contactType, body?.contact);

  return {
    contactType,
    contact,
  };
}

function userWhere(contactType, contact) {
  return contactType === "EMAIL" ? { email: contact } : { phone: contact };
}

function userContactData(contactType, contact) {
  return contactType === "EMAIL" ? { email: contact } : { phone: contact };
}

async function findVerifiedAuthCode({ authCodeId, contactType, contact }) {
  const code = await prisma.authCode.findFirst({
    where: {
      id: authCodeId,
      contactType,
      contact,
      verifiedAt: { not: null },
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!code) {
    throw unauthorized("Code is not verified or has expired.");
  }

  return code;
}

async function createSession(userId, spaceId) {
  return prisma.session.create({
    data: {
      token: makeSessionToken(),
      userId,
      spaceId,
      expiresAt: sessionExpiresAt(),
    },
  });
}

async function getSessionPayload(session) {
  const [user, space, memberships, spaceMembers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarInitials: true,
        avatarPhoto: true,
        partnerName: true,
        profileSettings: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    session.spaceId
      ? prisma.space.findUnique({
          where: { id: session.spaceId },
          select: {
            id: true,
            name: true,
            inviteCode: true,
            partnerNameHint: true,
            themePreference: true,
            dailySummaryTime: true,
            notificationSettings: true,
            relationshipStartDate: true,
            weddingDate: true,
            createdAt: true,
          },
        })
      : null,
    prisma.spaceMember.findMany({
      where: { userId: session.userId },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            inviteCode: true,
            partnerNameHint: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
    session.spaceId
      ? prisma.spaceMember.findMany({
          where: { spaceId: session.spaceId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarInitials: true,
                avatarPhoto: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        })
      : [],
  ]);

  return {
    token: session.token,
    expiresAt: session.expiresAt,
    user,
    space,
    memberships,
    spaceMembers,
  };
}

export async function authRoutes(app) {
  app.post("/auth/request-code", async (request) => {
    const { contactType, contact } = authCodeWhere(request.body);
    const inviteCode = normalizeInviteCode(request.body?.inviteCode);

    if (inviteCode) {
      const space = await prisma.space.findUnique({ where: { inviteCode } });

      if (!space) {
        throw notFound("Invite code was not found.");
      }
    }

    await prisma.authCode.updateMany({
      where: {
        contactType,
        contact,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    const code = await prisma.authCode.create({
      data: {
        contactType,
        contact,
        code: makeAuthCode(),
        expiresAt: expiresIn(15),
      },
    });

    return {
      ok: true,
      contactType,
      contact,
      expiresAt: code.expiresAt,
      debugCode: code.code,
    };
  });

  app.post("/auth/verify-code", async (request) => {
    const { contactType, contact } = authCodeWhere(request.body);
    const codeValue = String(request.body?.code ?? "").trim();

    if (!codeValue) {
      throw badRequest("Code is required.");
    }

    const code = await prisma.authCode.findFirst({
      where: {
        contactType,
        contact,
        code: codeValue,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!code) {
      throw unauthorized("Code is invalid or has expired.");
    }

    const verifiedCode = await prisma.authCode.update({
      where: { id: code.id },
      data: { verifiedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: userWhere(contactType, contact),
      select: {
        id: true,
        name: true,
        avatarInitials: true,
        avatarPhoto: true,
        partnerName: true,
        profileSettings: true,
        memberships: {
          take: 1,
          orderBy: { joinedAt: "asc" },
          include: {
            space: {
              select: {
                id: true,
                name: true,
                inviteCode: true,
                partnerNameHint: true,
                themePreference: true,
                dailySummaryTime: true,
                notificationSettings: true,
                relationshipStartDate: true,
                weddingDate: true,
              },
            },
          },
        },
      },
    });

    return {
      ok: true,
      authCodeId: verifiedCode.id,
      existingUser: user,
    };
  });

  app.post("/auth/complete", async (request) => {
    const body = request.body ?? {};
    const { contactType, contact } = authCodeWhere(body);
    const authCodeId = String(body.authCodeId ?? "").trim();
    const name = String(body.name ?? "").trim();
    const partnerName = String(body.partnerName ?? "").trim() || null;
    const avatarInitials = String(body.avatarInitials ?? initialsFromName(name)).trim().slice(0, 2) || initialsFromName(name);
    const avatarPhoto = String(body.avatarPhoto ?? "").trim() || null;
    const profileSettings = objectOrNull(body.profileSettings);
    const spaceName = String(body.spaceName ?? "LOZHKA").trim() || "LOZHKA";
    const inviteCode = normalizeInviteCode(body.inviteCode);
    const themePreference = String(body.themePreference ?? "").trim() || null;
    const dailySummaryTime = String(body.dailySummaryTime ?? "").trim() || null;
    const notificationSettings = objectOrNull(body.notificationSettings);
    const relationshipStartDate = body.relationshipStartDate ? parseDateOnly(body.relationshipStartDate) : null;

    if (!authCodeId) {
      throw badRequest("authCodeId is required.");
    }

    if (!name) {
      throw badRequest("Name is required.");
    }

    const authCode = await findVerifiedAuthCode({ authCodeId, contactType, contact });

    const user = await prisma.user.upsert({
      where: userWhere(contactType, contact),
      update: {
        ...userContactData(contactType, contact),
        name,
        avatarInitials,
        avatarPhoto,
        partnerName,
        ...(profileSettings ? { profileSettings } : {}),
        lastLoginAt: new Date(),
      },
      create: {
        ...userContactData(contactType, contact),
        name,
        avatarInitials,
        avatarPhoto,
        partnerName,
        ...(profileSettings ? { profileSettings } : {}),
        lastLoginAt: new Date(),
      },
    });

    let space = null;

    if (inviteCode) {
      space = await prisma.space.findUnique({ where: { inviteCode } });
    } else {
      const membership = await prisma.spaceMember.findFirst({
        where: { userId: user.id },
        include: { space: true },
        orderBy: { joinedAt: "asc" },
      });

      space = membership?.space ?? null;
    }

    if (!space && !inviteCode) {
      space = await prisma.space.create({
        data: {
          name: spaceName,
          inviteCode: await createInviteCode(),
          partnerNameHint: partnerName,
          themePreference,
          dailySummaryTime,
          ...(notificationSettings ? { notificationSettings } : {}),
          relationshipStartDate,
        },
      });
    } else if (space && !inviteCode) {
      space = await prisma.space.update({
        where: { id: space.id },
        data: {
          name: spaceName,
          partnerNameHint: partnerName,
          themePreference,
          dailySummaryTime,
          ...(notificationSettings ? { notificationSettings } : {}),
          relationshipStartDate,
        },
      });
    }

    if (!space) {
      throw notFound("Invite code was not found.");
    }

    await prisma.spaceMember.upsert({
      where: { spaceId_userId: { spaceId: space.id, userId: user.id } },
      update: {},
      create: {
        spaceId: space.id,
        userId: user.id,
        role: inviteCode ? "MEMBER" : "OWNER",
        color: inviteCode ? "#ff9f68" : "#58aede",
      },
    });

    await prisma.authCode.update({
      where: { id: authCode.id },
      data: { consumedAt: new Date() },
    });

    const session = await createSession(user.id, space.id);

    return getSessionPayload(session);
  });

  app.patch("/auth/me", async (request) => {
    if (!request.auth?.sessionId) {
      throw unauthorized();
    }

    const body = request.body ?? {};
    const userPatch = objectOrNull(body.user) ?? {};
    const spacePatch = objectOrNull(body.space) ?? {};
    const userData = {};
    const spaceData = {};

    if (Object.hasOwn(userPatch, "name")) {
      const name = cleanNullableString(userPatch.name);

      if (!name) {
        throw badRequest("Name cannot be empty.");
      }

      userData.name = name;
    }

    if (Object.hasOwn(userPatch, "partnerName")) {
      userData.partnerName = cleanNullableString(userPatch.partnerName);
    }

    if (Object.hasOwn(userPatch, "email")) {
      const email = cleanNullableString(userPatch.email);
      userData.email = email ? normalizeContact("EMAIL", email) : null;
    }

    if (Object.hasOwn(userPatch, "phone")) {
      const phone = cleanNullableString(userPatch.phone);
      userData.phone = phone ? normalizeContact("PHONE", phone) : null;
    }

    if (Object.hasOwn(userPatch, "avatarInitials")) {
      userData.avatarInitials = cleanNullableString(userPatch.avatarInitials);
    }

    if (Object.hasOwn(userPatch, "avatarPhoto")) {
      userData.avatarPhoto = cleanNullableString(userPatch.avatarPhoto);
    }

    if (Object.hasOwn(userPatch, "profileSettings")) {
      const profileSettings = objectOrNull(userPatch.profileSettings);

      if (profileSettings) {
        userData.profileSettings = profileSettings;
      }
    }

    if (Object.hasOwn(spacePatch, "name")) {
      const name = cleanNullableString(spacePatch.name);

      if (!name) {
        throw badRequest("Space name cannot be empty.");
      }

      spaceData.name = name;
    }

    if (Object.hasOwn(spacePatch, "partnerNameHint")) {
      spaceData.partnerNameHint = cleanNullableString(spacePatch.partnerNameHint);
    }

    if (Object.hasOwn(spacePatch, "themePreference")) {
      spaceData.themePreference = cleanNullableString(spacePatch.themePreference);
    }

    if (Object.hasOwn(spacePatch, "dailySummaryTime")) {
      spaceData.dailySummaryTime = cleanNullableString(spacePatch.dailySummaryTime);
    }

    if (Object.hasOwn(spacePatch, "notificationSettings")) {
      const notificationSettings = objectOrNull(spacePatch.notificationSettings);

      if (notificationSettings) {
        spaceData.notificationSettings = notificationSettings;
      }
    }

    if (Object.hasOwn(spacePatch, "relationshipStartDate")) {
      spaceData.relationshipStartDate = spacePatch.relationshipStartDate ? parseDateOnly(spacePatch.relationshipStartDate) : null;
    }

    if (Object.hasOwn(spacePatch, "weddingDate")) {
      spaceData.weddingDate = spacePatch.weddingDate ? parseDateOnly(spacePatch.weddingDate) : null;
    }

    const nextEmail = Object.hasOwn(userData, "email") ? userData.email : request.auth.user.email;
    const nextPhone = Object.hasOwn(userData, "phone") ? userData.phone : request.auth.user.phone;

    if (!nextEmail && !nextPhone) {
      throw badRequest("At least one contact is required.");
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: request.auth.userId },
        data: userData,
      });
    }

    if (request.auth.spaceId && Object.keys(spaceData).length > 0) {
      await prisma.space.update({
        where: { id: request.auth.spaceId },
        data: spaceData,
      });
    }

    const session = await prisma.session.findUnique({
      where: { id: request.auth.sessionId },
    });

    return getSessionPayload(session);
  });

  app.get("/auth/me", async (request) => {
    if (!request.auth?.sessionId) {
      throw unauthorized();
    }

    const session = await prisma.session.findUnique({
      where: { id: request.auth.sessionId },
    });

    if (!session || session.expiresAt <= new Date()) {
      throw unauthorized();
    }

    return getSessionPayload(session);
  });

  app.post("/auth/logout", async (request, reply) => {
    if (request.auth?.sessionId) {
      await prisma.session.update({
        where: { id: request.auth.sessionId },
        data: { expiresAt: new Date() },
      });
    }

    reply.status(204);
    return null;
  });
}
