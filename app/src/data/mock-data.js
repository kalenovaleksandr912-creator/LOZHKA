export const today = {
  weekday: "Понедельник",
  date: "24 августа",
  summaryTitle: "Сегодня",
  summarySubtitle: "Короткая сводка дня",
};

export const carouselCards = [
  {
    action: "daily-photo",
    tone: "peach",
    label: "Фото дня",
    title: "Сфотографируйся с тем, что подняло настроение",
    text: "Саша ещё не добавил фото.",
    icon: "camera",
  },
  {
    action: "tomorrow",
    tone: "green",
    label: "Завтра",
    title: "09:00 врач, 2 задачи и паста на ужин",
    text: "Можно подготовить покупки сегодня вечером.",
    icon: "calendar-days",
  },
  {
    tone: "lavender",
    label: "Дни рождения",
    title: "Через 3 дня день рождения Анны",
    text: "Подарок можно продумать заранее.",
    icon: "heart",
  },
];

export const dailyPhoto = {
  partnerName: "Саша",
  prompt: "Сфотографируйся с тем, что сегодня подняло тебе настроение.",
  partnerPhotoUrl: "",
};

export const tasks = [
  {
    title: "Забрать заказ",
    details: "До 18:00 · Дом",
    assignee: "Александр",
    date: "Сегодня",
    owner: "me",
    completed: false,
    priorityToday: true,
  },
  {
    title: "Оплатить интернет",
    details: "Без точного времени · Быт",
    assignee: "Общее",
    date: "Сегодня",
    owner: "shared",
    completed: false,
  },
  {
    title: "Проверить продукты на завтра",
    details: "Связано с меню · Продукты",
    assignee: "Настя",
    date: "Сегодня",
    owner: "her",
    completed: false,
  },
  {
    title: "Записать размеры полки",
    details: "Выполнено утром",
    assignee: "Александр",
    date: "Выполнено",
    owner: "me",
    completed: true,
  },
];

export const todayEvents = [
  { time: "09:00", title: "Стоматолог", details: "30 минут на дорогу" },
  { time: "20:30", title: "Вечер без дел", details: "Оставить свободным" },
];

export const meals = [
  { icon: "sunrise", title: "Завтрак", details: "Омлет, кофе" },
  { icon: "utensils", title: "Ужин", details: "Курица, картофель, салат" },
];

export const shopping = [
  { title: "Молоко", completed: true },
  { title: "Яйца", completed: false },
  { title: "Хлеб", completed: false },
  { title: "Сыр для пасты", completed: false },
];

export const calendarWeek = [
  { weekday: "Пн", date: "24", count: "5" },
  { weekday: "Вт", date: "25", count: "3" },
  { weekday: "Ср", date: "26", count: "7", active: true },
  { weekday: "Чт", date: "27", count: "2" },
  { weekday: "Пт", date: "28", count: "4" },
  { weekday: "Сб", date: "29", count: "1" },
  { weekday: "Вс", date: "30", count: "0" },
];

export const agenda = [
  { kind: "event", time: "09:00", title: "Врач", details: "Обычное событие" },
  { kind: "task", time: "12:00", title: "Забрать заказ", details: "Задача с дедлайном" },
  { kind: "menu", time: "Ужин", title: "Паста с сыром", details: "Меню на дату" },
  { kind: "shopping", time: "Список", title: "Покупки: 4 позиции", details: "Молоко, яйца, хлеб, сыр" },
  { kind: "date", time: "Дата", title: "День рождения Анны", details: "Из раздела Люди" },
];

export const tomorrowAgenda = [
  { kind: "event", time: "09:00", title: "Врач", details: "Событие · напомнить утром" },
  { kind: "task", time: "12:00", title: "Позвонить в доставку", details: "Задача · Александр" },
  { kind: "shopping", time: "18:00", title: "Покупки к пасте", details: "4 позиции · список на завтра" },
  { kind: "menu", time: "20:00", title: "Паста с сыром", details: "Ужин · меню" },
];

export const moreGroups = [
  {
    label: "Быт",
    title: "Меню и покупки",
    items: [
      { icon: "utensils", tone: "warm", title: "Меню", details: "Блюда для выбора в календаре", targetPage: "menu" },
      { icon: "shopping-bag", tone: "green", title: "Покупки", details: "Продукты и остальные позиции", targetPage: "shopping" },
    ],
  },
  {
    label: "Мы",
    title: "Совместная история",
    items: [
      { icon: "bar-chart-3", tone: "lavender", title: "Статистика", details: "Все операции и динамика", targetPage: "stats" },
      { icon: "users", tone: "blue", title: "Люди", details: "Дни рождения и важные люди", targetPage: "people" },
    ],
  },
  {
    label: "Система",
    title: "Настройки",
    items: [
      { icon: "user", tone: "blue", title: "Личные данные", details: "Имя, аватар и роль", targetPage: "personal-data" },
      { icon: "bell", tone: "green", title: "Уведомления", details: "Задачи, покупки и календарь", targetPage: "notifications" },
      { icon: "heart", tone: "rose", title: "Наши даты", details: "Годовщины и личные события", targetPage: "our-dates" },
    ],
  },
];

export const statsOverview = [
  { icon: "activity", tone: "blue", label: "Всего операций", value: "126", details: "за август" },
  { icon: "check-square", tone: "green", label: "Задачи", value: "42", details: "18 закрыто" },
  { icon: "calendar", tone: "lavender", label: "События", value: "19", details: "7 впереди" },
  { icon: "shopping-bag", tone: "warm", label: "Покупки", value: "31", details: "14 продуктов" },
  { icon: "utensils", tone: "rose", label: "Блюда", value: "21", details: "9 ужинов" },
  { icon: "camera", tone: "neutral", label: "Фото дня", value: "13", details: "5 пропущено" },
];

export const statsBreakdown = [
  { label: "Задачи", count: 42, percent: 82, tone: "green" },
  { label: "Покупки", count: 31, percent: 64, tone: "warm" },
  { label: "Блюда", count: 21, percent: 48, tone: "rose" },
  { label: "События", count: 19, percent: 36, tone: "lavender" },
  { label: "Фото дня", count: 13, percent: 30, tone: "blue" },
];

export const statsPeople = [
  { name: "Александр", value: "53", details: "операции", tone: "blue" },
  { name: "Настя", value: "47", details: "операций", tone: "warm" },
  { name: "Общее", value: "26", details: "совместных", tone: "lavender" },
];

export const statsRecent = [
  { icon: "check-circle", title: "Закрыты задачи", details: "18 задач за август", value: "+18" },
  { icon: "utensils", title: "Запланированы ужины", details: "9 домашних ужинов", value: "+9" },
  { icon: "shopping-bag", title: "Добавлены покупки", details: "31 позиция в списках", value: "+31" },
];

export const people = [
  {
    initials: "Ан",
    name: "Анна",
    role: "Сестра Насти",
    birthday: "28 августа",
    nextEvent: "День рождения через 4 дня",
    note: "Любит керамику, кофе и небольшие домашние подарки.",
    tags: ["подарок", "позвонить", "семья"],
    tone: "rose",
  },
  {
    initials: "Ма",
    name: "Марина",
    role: "Мама Александра",
    birthday: "12 сентября",
    nextEvent: "Поздравить в сентябре",
    note: "Лучше написать утром и заранее выбрать цветы.",
    tags: ["цветы", "звонок", "важно"],
    tone: "warm",
  },
  {
    initials: "Иг",
    name: "Игорь",
    role: "Друг семьи",
    birthday: "3 октября",
    nextEvent: "Встреча без даты",
    note: "Можно позвать на ужин, когда появится свободная пятница.",
    tags: ["ужин", "друзья"],
    tone: "blue",
  },
  {
    initials: "Ол",
    name: "Оля",
    role: "Коллега Насти",
    birthday: "18 ноября",
    nextEvent: "Подарок позже",
    note: "Нравятся книги и практичные вещи для работы.",
    tags: ["книги", "работа"],
    tone: "lavender",
  },
];

export const menuCategories = [
  {
    key: "breakfast",
    title: "Завтраки",
    subtitle: "Быстрые блюда на утро",
    icon: "sunrise",
    tone: "warm",
    dishes: [
      { title: "Омлет и кофе", details: "15 минут · 4 ингредиента", tags: ["быстро", "обычное"] },
      { title: "Творог с ягодами", details: "5 минут · без готовки", tags: ["легко", "сладкое"] },
      { title: "Овсянка с бананом", details: "10 минут · можно заранее", tags: ["сытно", "дома"] },
    ],
  },
  {
    key: "lunch",
    title: "Обеды",
    subtitle: "Для дома и с собой",
    icon: "salad",
    tone: "green",
    dishes: [
      { title: "Салат с тунцом", details: "12 минут · без плиты", tags: ["легко", "с собой"] },
      { title: "Куриный суп", details: "40 минут · на 2 дня", tags: ["домашнее", "заготовка"] },
      { title: "Сэндвичи с сыром", details: "10 минут · удобно взять", tags: ["быстро", "дорога"] },
    ],
  },
  {
    key: "dinner",
    title: "Ужины",
    subtitle: "То, что можно поставить в календарь",
    icon: "utensils",
    tone: "blue",
    dishes: [
      { title: "Паста с сыром", details: "25 минут · на двоих", tags: ["быстро", "покупки"] },
      { title: "Курица, картофель, салат", details: "45 минут · плотный ужин", tags: ["домашнее", "духовка"] },
      { title: "Рис с овощами", details: "30 минут · без мяса", tags: ["легко", "овощи"] },
    ],
  },
  {
    key: "snacks",
    title: "Перекусы",
    subtitle: "Небольшие позиции между делами",
    icon: "apple",
    tone: "lavender",
    dishes: [
      { title: "Йогурт с гранолой", details: "3 минуты · сладкий перекус", tags: ["быстро", "холодное"] },
      { title: "Фрукты и орехи", details: "Без готовки · взять с собой", tags: ["дорога", "легко"] },
      { title: "Тост с сыром", details: "7 минут · горячий перекус", tags: ["сыр", "быстро"] },
    ],
  },
];

export const shoppingLists = [
  {
    key: "today",
    title: "Сегодня",
    subtitle: "6 позиций",
    items: [
      { title: "Молоко", details: "1 л · завтрак", category: "products", priority: "Надо сделать", owner: "Общее", completed: true },
      { title: "Яйца", details: "10 шт · омлет", category: "products", priority: "Срочно", owner: "Александр", completed: false },
      { title: "Хлеб", details: "Для завтрака", category: "products", priority: "Надо сделать", owner: "Настя", completed: false },
      { title: "Сыр для пасты", details: "На завтра", category: "products", priority: "Когда-нибудь", owner: "Общее", completed: false },
      { title: "Мешки для мусора", details: "Для кухни", category: "other", priority: "Надо сделать", owner: "Общее", completed: false },
      { title: "Шампунь", details: "Заканчивается", category: "other", priority: "Когда-нибудь", owner: "Настя", completed: false },
    ],
  },
  {
    key: "upcoming",
    title: "Предстоящие",
    subtitle: "5 позиций",
    items: [
      { title: "Ягоды", details: "25 августа · завтрак", category: "products", priority: "Надо сделать", owner: "Настя", completed: false },
      { title: "Тунец", details: "25 августа · салат", category: "products", priority: "Надо сделать", owner: "Общее", completed: false },
      { title: "Макароны", details: "Для пасты", category: "products", priority: "Срочно", owner: "Александр", completed: false },
      { title: "Батарейки", details: "На выходные", category: "other", priority: "Когда-нибудь", owner: "Александр", completed: false },
      { title: "Бумажные полотенца", details: "Для кухни", category: "other", priority: "Надо сделать", owner: "Общее", completed: false },
    ],
  },
  {
    key: "no-date",
    title: "Без даты",
    subtitle: "3 позиции",
    items: [
      { title: "Фольга", details: "Для кухни", category: "other", priority: "Когда-нибудь", owner: "Общее", completed: false },
      { title: "Губки", details: "Заканчиваются", category: "other", priority: "Надо сделать", owner: "Общее", completed: false },
      { title: "Чай", details: "В запас", category: "products", priority: "Когда-нибудь", owner: "Общее", completed: false },
    ],
  },
];
