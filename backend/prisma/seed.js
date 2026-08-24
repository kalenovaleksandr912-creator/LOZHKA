import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const spaceId = "demo-space";
const alexId = "demo-alex";
const nastyaId = "demo-nastya";

function date(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  await prisma.space.deleteMany({ where: { id: spaceId } });

  const [alex, nastya] = await Promise.all([
    prisma.user.upsert({
      where: { email: "alex@example.local" },
      update: { name: "Александр", avatarInitials: "Ал" },
      create: {
        id: alexId,
        email: "alex@example.local",
        name: "Александр",
        avatarInitials: "Ал",
      },
    }),
    prisma.user.upsert({
      where: { email: "nastya@example.local" },
      update: { name: "Настя", avatarInitials: "На" },
      create: {
        id: nastyaId,
        email: "nastya@example.local",
        name: "Настя",
        avatarInitials: "На",
      },
    }),
  ]);

  await prisma.space.create({
    data: {
      id: spaceId,
      inviteCode: "KAM-DEMO",
      relationshipStartDate: date("2024-11-06"),
      weddingDate: date("2025-08-16"),
      memberships: {
        create: [
          { userId: alex.id, role: "OWNER", color: "#58aede" },
          { userId: nastya.id, role: "MEMBER", color: "#ff9f68" },
        ],
      },
    },
  });

  const [taskOrder, taskInternet, taskProducts, taskShelf] = await Promise.all([
    prisma.task.create({
      data: {
        spaceId,
        title: "Забрать заказ",
        details: "До 18:00 · Дом",
        category: "ERRAND",
        assigneeType: "USER",
        assigneeUserId: alex.id,
        deadline: date("2026-08-24"),
        createdById: nastya.id,
      },
    }),
    prisma.task.create({
      data: {
        spaceId,
        title: "Оплатить интернет",
        details: "Без точного времени · Быт",
        category: "HOME",
        assigneeType: "SHARED",
        deadline: date("2026-08-24"),
        createdById: alex.id,
      },
    }),
    prisma.task.create({
      data: {
        spaceId,
        title: "Проверить продукты на завтра",
        details: "Связано с меню · Продукты",
        category: "PRODUCTS",
        assigneeType: "USER",
        assigneeUserId: nastya.id,
        deadline: date("2026-08-24"),
        createdById: alex.id,
      },
    }),
    prisma.task.create({
      data: {
        spaceId,
        title: "Записать размеры полки",
        details: "Выполнено утром",
        category: "HOME",
        assigneeType: "USER",
        assigneeUserId: alex.id,
        status: "DONE",
        completedAt: new Date("2026-08-24T08:30:00.000Z"),
        completedById: alex.id,
        createdById: alex.id,
      },
    }),
  ]);

  const [eventDentist, eventFreeEvening, eventDoctor] = await Promise.all([
    prisma.event.create({
      data: {
        spaceId,
        title: "Стоматолог",
        date: date("2026-08-24"),
        time: "09:00",
        createdById: alex.id,
      },
    }),
    prisma.event.create({
      data: {
        spaceId,
        title: "Вечер без дел",
        date: date("2026-08-24"),
        time: "20:30",
        createdById: nastya.id,
      },
    }),
    prisma.event.create({
      data: {
        spaceId,
        title: "Врач",
        date: date("2026-08-25"),
        time: "09:00",
        createdById: nastya.id,
      },
    }),
  ]);

  const [omelet, pasta, chicken, salad] = await Promise.all([
    prisma.dish.create({
      data: {
        spaceId,
        title: "Омлет и кофе",
        mealType: "BREAKFAST",
        createdById: alex.id,
        ingredients: {
          create: [
            { name: "Яйца", amount: "3 шт" },
            { name: "Молоко", amount: "100 мл" },
            { name: "Кофе", amount: "2 порции" },
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        spaceId,
        title: "Паста с сыром",
        mealType: "DINNER",
        createdById: nastya.id,
        ingredients: {
          create: [
            { name: "Макароны", amount: "250 г" },
            { name: "Сыр", amount: "150 г" },
            { name: "Сливки", amount: "100 мл" },
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        spaceId,
        title: "Курица, картофель, салат",
        mealType: "DINNER",
        createdById: alex.id,
        ingredients: {
          create: [
            { name: "Курица", amount: "600 г" },
            { name: "Картофель", amount: "1 кг" },
            { name: "Зелень", amount: "1 пучок" },
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        spaceId,
        title: "Салат с тунцом",
        mealType: "LUNCH",
        createdById: nastya.id,
        ingredients: {
          create: [
            { name: "Тунец", amount: "1 банка" },
            { name: "Листья салата", amount: "1 упаковка" },
          ],
        },
      },
    }),
  ]);

  const [todayBreakfast, todayDinner, tomorrowDinner] = await Promise.all([
    prisma.menuPlanItem.create({
      data: {
        spaceId,
        dishId: omelet.id,
        date: date("2026-08-24"),
        mealType: "BREAKFAST",
        createdById: alex.id,
      },
    }),
    prisma.menuPlanItem.create({
      data: {
        spaceId,
        dishId: chicken.id,
        date: date("2026-08-24"),
        mealType: "DINNER",
        createdById: nastya.id,
      },
    }),
    prisma.menuPlanItem.create({
      data: {
        spaceId,
        dishId: pasta.id,
        date: date("2026-08-25"),
        mealType: "DINNER",
        createdById: alex.id,
      },
    }),
  ]);

  await prisma.shoppingItem.createMany({
    data: [
      {
        spaceId,
        title: "Молоко",
        amount: "1 л",
        category: "PRODUCTS",
        shoppingDate: date("2026-08-24"),
        status: "DONE",
        completedAt: new Date("2026-08-24T10:15:00.000Z"),
        source: "MENU",
        sourceMenuPlanId: todayBreakfast.id,
        createdById: alex.id,
      },
      {
        spaceId,
        title: "Яйца",
        amount: "10 шт",
        category: "PRODUCTS",
        shoppingDate: date("2026-08-24"),
        source: "MENU",
        sourceMenuPlanId: todayBreakfast.id,
        createdById: alex.id,
      },
      {
        spaceId,
        title: "Хлеб",
        category: "PRODUCTS",
        shoppingDate: date("2026-08-24"),
        createdById: nastya.id,
      },
      {
        spaceId,
        title: "Сыр для пасты",
        amount: "150 г",
        category: "PRODUCTS",
        shoppingDate: date("2026-08-24"),
        source: "MENU",
        sourceMenuPlanId: tomorrowDinner.id,
        createdById: alex.id,
      },
      {
        spaceId,
        title: "Мешки для мусора",
        category: "HOUSEHOLD",
        shoppingDate: date("2026-08-24"),
        createdById: nastya.id,
      },
      {
        spaceId,
        title: "Шампунь",
        category: "OTHER",
        createdById: nastya.id,
      },
    ],
  });

  const [anna, marina, igor] = await Promise.all([
    prisma.person.create({
      data: {
        spaceId,
        fullName: "Анна",
        birthday: date("1994-08-28"),
        note: "Любит керамику, кофе и небольшие домашние подарки.",
      },
    }),
    prisma.person.create({
      data: {
        spaceId,
        fullName: "Марина",
        birthday: date("1975-09-12"),
        note: "Лучше написать утром и заранее выбрать цветы.",
      },
    }),
    prisma.person.create({
      data: {
        spaceId,
        fullName: "Игорь",
        birthday: date("1992-10-03"),
        note: "Можно позвать на ужин, когда появится свободная пятница.",
      },
    }),
  ]);

  const relationshipDate = await prisma.importantDate.create({
    data: {
      spaceId,
      title: "Начало отношений",
      date: date("2024-11-06"),
      note: "Главная дата для статистики дней вместе.",
    },
  });

  const photoPrompt = await prisma.dailyPhotoPrompt.create({
    data: {
      spaceId,
      date: date("2026-08-24"),
      prompt: "Сфотографируйся с тем, что сегодня подняло тебе настроение.",
    },
  });

  await prisma.dailyPhoto.create({
    data: {
      promptId: photoPrompt.id,
      userId: alex.id,
      imageUrl: "https://example.local/demo-photo-alex.jpg",
      caption: "Демо-фото для проверки API.",
    },
  });

  await prisma.operationLog.createMany({
    data: [
      { spaceId, userId: nastya.id, type: "TASK_CREATED", entityType: "Task", entityId: taskOrder.id },
      { spaceId, userId: alex.id, type: "TASK_CREATED", entityType: "Task", entityId: taskInternet.id },
      { spaceId, userId: alex.id, type: "TASK_CREATED", entityType: "Task", entityId: taskProducts.id },
      { spaceId, userId: alex.id, type: "TASK_COMPLETED", entityType: "Task", entityId: taskShelf.id },
      { spaceId, userId: alex.id, type: "EVENT_CREATED", entityType: "Event", entityId: eventDentist.id },
      { spaceId, userId: nastya.id, type: "EVENT_CREATED", entityType: "Event", entityId: eventFreeEvening.id },
      { spaceId, userId: nastya.id, type: "EVENT_CREATED", entityType: "Event", entityId: eventDoctor.id },
      { spaceId, userId: alex.id, type: "DISH_CREATED", entityType: "Dish", entityId: omelet.id },
      { spaceId, userId: nastya.id, type: "DISH_CREATED", entityType: "Dish", entityId: pasta.id },
      { spaceId, userId: alex.id, type: "DISH_CREATED", entityType: "Dish", entityId: chicken.id },
      { spaceId, userId: nastya.id, type: "DISH_CREATED", entityType: "Dish", entityId: salad.id },
      { spaceId, userId: alex.id, type: "MENU_PLANNED", entityType: "MenuPlanItem", entityId: todayBreakfast.id },
      { spaceId, userId: nastya.id, type: "MENU_PLANNED", entityType: "MenuPlanItem", entityId: todayDinner.id },
      { spaceId, userId: alex.id, type: "MENU_PLANNED", entityType: "MenuPlanItem", entityId: tomorrowDinner.id },
      { spaceId, userId: alex.id, type: "PERSON_CREATED", entityType: "Person", entityId: anna.id },
      { spaceId, userId: nastya.id, type: "PERSON_CREATED", entityType: "Person", entityId: marina.id },
      { spaceId, userId: alex.id, type: "PERSON_CREATED", entityType: "Person", entityId: igor.id },
      { spaceId, userId: alex.id, type: "IMPORTANT_DATE_CREATED", entityType: "ImportantDate", entityId: relationshipDate.id },
      { spaceId, userId: alex.id, type: "DAILY_PHOTO_ADDED", entityType: "DailyPhotoPrompt", entityId: photoPrompt.id },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
