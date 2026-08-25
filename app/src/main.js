import { renderBottomNav, renderProfileCard, renderQuickSheet } from "./components/layout.js?v=18";
import { renderAuthPage } from "./pages/auth.js?v=18";
import { renderCalendarPage } from "./pages/calendar.js?v=18";
import { renderMenuPage } from "./pages/menu.js?v=18";
import { renderMorePage } from "./pages/more.js?v=18";
import { renderNotificationsPage } from "./pages/notifications.js?v=18";
import { renderOurDatesPage } from "./pages/our-dates.js?v=18";
import { renderPeoplePage } from "./pages/people.js?v=18";
import { renderPersonalDataPage } from "./pages/personal-data.js?v=18";
import { renderShoppingPage } from "./pages/shopping.js?v=18";
import { renderStatsPage } from "./pages/stats.js?v=18";
import { renderTaskViews, renderTasksPage } from "./pages/tasks.js?v=18";
import { renderTodayPage, renderTodayTasksContent } from "./pages/today.js?v=18";
import { createTask, fetchTasks, updateTaskCompletion } from "./lib/api.js?v=18";
import { DEFAULT_TASK_DATE, toViewTasks } from "./lib/task-view.js?v=18";

const app = document.getElementById("app");

app.innerHTML = `
  ${renderAuthPage()}
  ${renderTodayPage()}
  ${renderTasksPage()}
  ${renderCalendarPage()}
  ${renderMorePage()}
  ${renderMenuPage()}
  ${renderShoppingPage()}
  ${renderStatsPage()}
  ${renderPeoplePage()}
  ${renderPersonalDataPage()}
  ${renderOurDatesPage()}
  ${renderNotificationsPage()}
  ${renderBottomNav()}
  ${renderQuickSheet()}
  ${renderProfileCard()}
`;

const navItems = Array.from(document.querySelectorAll(".nav-item"));
const pages = Array.from(document.querySelectorAll(".app-page"));
const bottomNav = document.querySelector(".bottom-nav");
const addButtons = Array.from(document.querySelectorAll(".add-button"));
const quickSheet = document.getElementById("quickSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const closeQuickAdd = document.getElementById("closeQuickAdd");
const backQuickAdd = document.getElementById("backQuickAdd");
const quickSheetTitle = document.getElementById("quickSheetTitle");
const quickActionButtons = Array.from(document.querySelectorAll("[data-quick-action]"));
const quickSheetViews = Array.from(document.querySelectorAll("[data-sheet-view]"));
const quickForms = Array.from(document.querySelectorAll(".quick-form"));
const carouselTrack = document.getElementById("carouselTrack");
const dots = Array.from(document.querySelectorAll("#carouselDots span"));
const calendarViewButtons = Array.from(document.querySelectorAll(".segment-control [data-calendar-view]"));
const calendarViews = Array.from(document.querySelectorAll(".calendar-view"));
const calendarModeLabel = document.getElementById("calendarModeLabel");
const shoppingTabButtons = Array.from(document.querySelectorAll("[data-shopping-tab]"));
const shoppingGroups = Array.from(document.querySelectorAll("[data-shopping-group]"));
const dailyPhotoOverlay = document.getElementById("dailyPhotoOverlay");
const dailyPhotoInput = document.getElementById("dailyPhotoInput");
const openCameraButton = document.querySelector("[data-open-camera]");
const photoCloseButtons = Array.from(document.querySelectorAll("[data-photo-close]"));
const profileSheet = document.getElementById("profileSheet");
const profileBackdrop = document.getElementById("profileBackdrop");
const profileOpenButtons = Array.from(document.querySelectorAll("[data-profile-open]"));
const profileCloseButtons = Array.from(document.querySelectorAll("[data-profile-close]"));
const themeButtons = Array.from(document.querySelectorAll("[data-theme-choice]"));
let lastSheetTrigger = document.getElementById("openQuickAdd");
let lastProfileTrigger = null;
let taskState = [];
const secondaryPages = new Set(["menu", "shopping", "stats", "people", "personal-data", "our-dates", "notifications"]);
const authPages = new Set(["auth"]);
const themeStorageKey = "lozhka-theme";
const authStorageKey = "lozhka-auth-state";
const personalStorageKey = "lozhka-personal-data";
const notificationsStorageKey = "lozhka-notifications";
const availableThemes = new Set(["dark", "rose"]);
const authStepOrder = ["start", "code", "profile", "setup", "invite"];

const calendarViewLabels = {
  month: "Месяц",
  week: "Неделя",
  day: "День",
  list: "Список",
};

const quickSheetLabels = {
  menu: "Добавить",
  task: "Новая задача",
  event: "Новое событие",
  purchase: "Покупка",
  dish: "Блюдо",
};

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getSavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(themeStorageKey);
    return availableThemes.has(savedTheme) ? savedTheme : "dark";
  } catch {
    return "dark";
  }
}

function applyTheme(themeName) {
  const theme = availableThemes.has(themeName) ? themeName : "dark";

  document.documentElement.dataset.theme = theme;

  themeButtons.forEach((button) => {
    const isActive = button.dataset.themeChoice === theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Theme switching still works for the current session if storage is blocked.
  }
}

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Local preferences remain interactive even if storage is unavailable.
    return false;
  }
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase("ru-RU");
  }

  return (parts[0]?.slice(0, 2) || "Ал").toLocaleUpperCase("ru-RU");
}

function setAvatarVisual(element, photoUrl, initials) {
  const hasPhoto = Boolean(photoUrl);

  element.classList.toggle("has-photo", hasPhoto);
  element.style.backgroundImage = hasPhoto ? `url("${photoUrl}")` : "";
  element.textContent = hasPhoto ? "" : initials;
}

function applyAvatarVisuals(data) {
  const name = data.name || "Александр";
  const initials = data.avatar || getInitials(name);
  const photoUrl = data.avatarPhoto || "";

  document.querySelectorAll(".avatar-button, .profile-avatar").forEach((item) => {
    setAvatarVisual(item, photoUrl, initials);
  });
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const image = new Image();

      image.addEventListener("load", () => {
        const maxSize = 720;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });

      image.addEventListener("error", reject);
      image.src = reader.result;
    });

    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function createInviteCode() {
  return `LOZHKA-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getAuthState() {
  return readJson(authStorageKey, {
    method: "phone",
    mode: "create",
  });
}

function saveAuthState(patch) {
  const state = {
    ...getAuthState(),
    ...patch,
  };

  writeJson(authStorageKey, state);
  return state;
}

function ensureInviteCode() {
  const state = getAuthState();
  if (state.inviteCode) {
    return state.inviteCode;
  }

  const inviteCode = createInviteCode();
  saveAuthState({ inviteCode });
  return inviteCode;
}

function setAuthStatus(text, screenName) {
  if (!text) {
    document.querySelectorAll(".auth-status").forEach((status) => {
      status.textContent = "";
    });
    return;
  }

  const activeScreen = screenName
    ? document.querySelector(`[data-auth-screen="${screenName}"]`)
    : document.querySelector(".auth-screen.is-active");
  const status = activeScreen?.querySelector(".auth-status") ?? document.getElementById("authStatus");

  if (status) {
    status.textContent = text;
  }
}

function updateAuthUi() {
  const state = getAuthState();
  const method = state.method === "email" ? "email" : "phone";
  const label = method === "email" ? "Почта" : "Телефон";
  const placeholder = method === "email" ? "name@example.com" : "+7 999 000-00-00";
  const inputType = method === "email" ? "email" : "tel";
  const inputMode = method === "email" ? "email" : "tel";

  document.querySelectorAll("[data-auth-method-choice]").forEach((button) => {
    const isActive = button.dataset.authMethodChoice === method;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll("[data-auth-contact-label]").forEach((item) => {
    item.textContent = label;
  });

  document.querySelectorAll("[data-auth-contact-input]").forEach((field) => {
    field.type = inputType;
    field.inputMode = inputMode;
    field.placeholder = placeholder;

    if (state.contact) {
      field.value = state.contact;
    }
  });

  document.querySelectorAll("[data-auth-contact-preview]").forEach((item) => {
    item.textContent = state.contact || "указанный контакт";
  });

  document.querySelectorAll("[data-auth-invite-code]").forEach((item) => {
    item.textContent = ensureInviteCode();
  });

  document.querySelectorAll("[data-auth-close]").forEach((button) => {
    button.hidden = !state.completed;
  });

  const personalData = readJson(personalStorageKey, {});
  const profileName = document.querySelector("[data-auth-profile-name]");
  const profilePartner = document.querySelector("[data-auth-profile-partner]");

  if (profileName && personalData.name) {
    profileName.value = personalData.name;
  }

  if (profilePartner && personalData.partner) {
    profilePartner.value = personalData.partner;
  }

  document.querySelectorAll("[data-auth-avatar-preview]").forEach((item) => {
    setAvatarVisual(item, personalData.avatarPhoto || state.avatarPhoto || "", getInitials(profileName?.value || personalData.name || state.name));
  });
}

function showAuthStep(stepName) {
  const targetStep = authStepOrder.includes(stepName) || stepName === "join" ? stepName : "start";
  const progressStep = targetStep === "join" ? "start" : targetStep;
  const targetIndex = authStepOrder.indexOf(progressStep);

  document.querySelectorAll("[data-auth-screen]").forEach((screen) => {
    const isActive = screen.dataset.authScreen === targetStep;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
  });

  document.querySelectorAll("[data-auth-dot]").forEach((dot) => {
    const dotIndex = authStepOrder.indexOf(dot.dataset.authDot);
    dot.classList.toggle("is-active", dot.dataset.authDot === progressStep);
    dot.classList.toggle("is-done", targetIndex > dotIndex && dotIndex >= 0);
  });

  updateAuthUi();
  refreshIcons();
  window.scrollTo(0, 0);
}

function completeAuth(mode = "ready") {
  saveAuthState({
    authenticated: true,
    completed: true,
    completedAt: new Date().toISOString(),
    mode,
  });

  applyPersonalData();
  applyNotificationSettings();
  showPage("today");
}

function handleContactSubmit(form) {
  const formData = new FormData(form);
  const contact = String(formData.get("contact") ?? "").trim();

  if (!contact) {
    setAuthStatus("Укажи телефон или почту.", "start");
    return;
  }

  saveAuthState({
    mode: "create",
    contact,
    codeSent: true,
  });

  setAuthStatus("");
  showAuthStep("code");
}

function handleJoinSubmit(form) {
  const formData = new FormData(form);
  const contact = String(formData.get("contact") ?? "").trim();
  const partnerCode = String(formData.get("inviteCode") ?? "").trim().toUpperCase();

  if (!partnerCode || !contact) {
    setAuthStatus("Нужен код партнёра и контакт для входа.", "join");
    return;
  }

  saveAuthState({
    mode: "join",
    contact,
    partnerCode,
    codeSent: true,
  });

  setAuthStatus("");
  showAuthStep("code");
}

function handleCodeSubmit(form) {
  const formData = new FormData(form);
  const code = String(formData.get("code") ?? "").trim();

  if (code.length < 4) {
    setAuthStatus("Код должен быть не короче 4 цифр.", "code");
    return;
  }

  saveAuthState({ verified: true });
  setAuthStatus("");
  showAuthStep("profile");
}

function handleProfileSubmit(form) {
  const formData = new FormData(form);
  const name = String(formData.get("name") ?? "").trim();
  const partner = String(formData.get("partner") ?? "").trim();

  if (!name || !partner) {
    setAuthStatus("Заполни имя и имя партнёра.", "profile");
    return;
  }

  const authState = getAuthState();
  const contactField = authState.method === "email" ? "email" : "phone";
  const contactPatch = authState.contact ? { [contactField]: authState.contact } : {};
  const personalData = readJson(personalStorageKey, {});
  const avatar = getInitials(name);

  writeJson(personalStorageKey, {
    ...personalData,
    ...contactPatch,
    name,
    avatar,
    partner,
  });

  saveAuthState({ name, avatar, avatarPhoto: personalData.avatarPhoto || "", partner });
  applyPersonalData();
  setAuthStatus("");
  showAuthStep("setup");
}

function handleSetupSubmit(form) {
  const formData = new FormData(form);
  const spaceName = String(formData.get("spaceName") ?? "").trim() || "LOZHKA";
  const startDate = String(formData.get("startDate") ?? "").trim();
  const themePreference = String(formData.get("theme") ?? "dark");
  const summaryTime = String(formData.get("summaryTime") ?? "09:00");
  const state = saveAuthState({
    spaceName,
    startDate,
    themePreference,
    summaryTime,
    inviteCode: getAuthState().inviteCode || createInviteCode(),
  });

  writeJson(notificationsStorageKey, {
    ...getNotificationSettings(),
    summaryTime,
  });
  applyTheme(themePreference);
  applyNotificationSettings();

  if (state.mode === "join") {
    completeAuth("join");
    return;
  }

  showAuthStep("invite");
}

function handleAuthFormSubmit(form) {
  const formName = form.dataset.authForm;

  if (formName === "contact") {
    handleContactSubmit(form);
    return;
  }

  if (formName === "join") {
    handleJoinSubmit(form);
    return;
  }

  if (formName === "code") {
    handleCodeSubmit(form);
    return;
  }

  if (formName === "profile") {
    handleProfileSubmit(form);
    return;
  }

  if (formName === "setup") {
    handleSetupSubmit(form);
  }
}

function applyPersonalData() {
  const data = readJson(personalStorageKey, {});
  const name = data.name || "Александр";
  const partner = data.partner || "Саша";

  document.querySelectorAll("[data-personal-field]").forEach((field) => {
    const value = data[field.dataset.personalField];
    if (typeof value === "string") {
      field.value = value;
    }
  });

  applyAvatarVisuals(data);

  document.querySelectorAll(".profile-main h3, .settings-profile-card h2").forEach((item) => {
    item.textContent = name;
  });

  document.querySelectorAll(".profile-main > div > span").forEach((item) => {
    item.textContent = `Партнёр: ${partner}`;
  });
}

function savePersonalData() {
  const data = readJson(personalStorageKey, {});

  document.querySelectorAll("[data-personal-field]").forEach((field) => {
    data[field.dataset.personalField] = field.value.trim();
  });

  data.avatar = getInitials(data.name || "Александр");
  writeJson(personalStorageKey, data);
  applyPersonalData();
  updateAuthUi();

  const status = document.getElementById("personalDataStatus");
  if (status) {
    status.textContent = "Сохранено на этом устройстве.";
  }
}

async function saveAvatarPhoto(input) {
  const file = input.files?.[0];
  if (!file) return;

  const status = document.getElementById("personalDataStatus");

  try {
    const avatarPhoto = await readImageAsDataUrl(file);
    const personalData = readJson(personalStorageKey, {});
    const nextPersonalData = {
      ...personalData,
      avatar: getInitials(personalData.name || "Александр"),
      avatarPhoto,
    };

    const didSave = writeJson(personalStorageKey, nextPersonalData);
    saveAuthState({ avatarPhoto });
    applyPersonalData();
    updateAuthUi();

    const saveMessage = didSave ? "Фото сохранено на этом устройстве." : "Не удалось сохранить фото на этом устройстве.";

    if (status) {
      status.textContent = saveMessage;
    }

    setAuthStatus(didSave ? "Фото добавлено." : "Не удалось сохранить фото.", "profile");
  } catch (error) {
    console.error(error);

    if (status) {
      status.textContent = "Не получилось прочитать фото.";
    }

    setAuthStatus("Не получилось прочитать фото.", "profile");
  } finally {
    input.value = "";
  }
}

function removeAvatarPhoto() {
  const personalData = readJson(personalStorageKey, {});
  const nextPersonalData = {
    ...personalData,
    avatar: getInitials(personalData.name || "Александр"),
  };

  delete nextPersonalData.avatarPhoto;
  writeJson(personalStorageKey, nextPersonalData);
  saveAuthState({ avatarPhoto: "" });
  applyPersonalData();
  updateAuthUi();

  const status = document.getElementById("personalDataStatus");
  if (status) {
    status.textContent = "Фото удалено. Показываются инициалы из имени.";
  }
}

function getNotificationSettings() {
  return readJson(notificationsStorageKey, {});
}

function applyNotificationSettings() {
  const settings = getNotificationSettings();

  document.querySelectorAll("[data-notification-key]").forEach((field) => {
    if (typeof settings[field.dataset.notificationKey] === "boolean") {
      field.checked = settings[field.dataset.notificationKey];
    }
  });

  const quietHours = document.querySelector("[data-quiet-hours]");
  if (quietHours && typeof settings.quietHours === "boolean") {
    quietHours.checked = settings.quietHours;
  }

  const summaryTime = document.querySelector("[data-summary-time]");
  if (summaryTime && typeof settings.summaryTime === "string") {
    summaryTime.value = settings.summaryTime;
  }
}

function saveNotificationSettings() {
  const settings = getNotificationSettings();

  document.querySelectorAll("[data-notification-key]").forEach((field) => {
    settings[field.dataset.notificationKey] = field.checked;
  });

  const quietHours = document.querySelector("[data-quiet-hours]");
  if (quietHours) {
    settings.quietHours = quietHours.checked;
  }

  const summaryTime = document.querySelector("[data-summary-time]");
  if (summaryTime) {
    settings.summaryTime = summaryTime.value;
  }

  writeJson(notificationsStorageKey, settings);
}

function updateDots() {
  if (!carouselTrack || dots.length === 0) return;
  const cardWidth = carouselTrack.scrollWidth / dots.length;
  const index = Math.min(dots.length - 1, Math.max(0, Math.round(carouselTrack.scrollLeft / cardWidth)));

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

function setSheetOpen(isOpen) {
  quickSheet.hidden = !isOpen;
  sheetBackdrop.hidden = !isOpen;
  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    showQuickSheetView("menu");
    closeQuickAdd.focus();
  } else if (lastSheetTrigger) {
    lastSheetTrigger.focus();
  }
}

function setDailyPhotoOpen(isOpen) {
  if (!dailyPhotoOverlay) return;

  dailyPhotoOverlay.hidden = !isOpen;
  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    dailyPhotoOverlay.querySelector("[data-photo-close]")?.focus();
  } else {
    document.querySelector('[data-card-action="daily-photo"]')?.focus();
  }
}

function setProfileOpen(isOpen) {
  if (!profileSheet || !profileBackdrop) return;

  profileSheet.hidden = !isOpen;
  profileBackdrop.hidden = !isOpen;
  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    profileSheet.querySelector("[data-profile-close]")?.focus();
  } else if (lastProfileTrigger && !lastProfileTrigger.closest("[hidden]")) {
    lastProfileTrigger.focus();
  }
}

function showQuickSheetView(viewName) {
  quickSheetViews.forEach((view) => {
    const isActive = view.dataset.sheetView === viewName;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
  });

  if (quickSheetTitle) {
    quickSheetTitle.textContent = quickSheetLabels[viewName] ?? quickSheetLabels.menu;
  }

  if (backQuickAdd) {
    backQuickAdd.hidden = viewName === "menu";
  }

  quickForms.forEach((form) => {
    const status = form.querySelector(".form-status");
    if (status) {
      status.textContent = "";
    }
  });
}

function showPage(pageName) {
  pages.forEach((page) => {
    const isActive = page.dataset.page === pageName;
    page.hidden = !isActive;
    page.classList.toggle("is-active", isActive);
  });

  const currentNavPage = secondaryPages.has(pageName) ? "more" : pageName;

  if (bottomNav) {
    bottomNav.hidden = authPages.has(pageName);
  }

  navItems.forEach((item) => {
    const isActive = item.dataset.page === currentNavPage;
    item.classList.toggle("is-active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  window.scrollTo(0, 0);
}

function showCalendarView(viewName) {
  calendarViews.forEach((view) => {
    const isActive = view.dataset.calendarView === viewName;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
  });

  calendarViewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.calendarView === viewName);
  });

  if (calendarModeLabel) {
    calendarModeLabel.textContent = calendarViewLabels[viewName] ?? "Календарь";
  }
}

function showShoppingTab(tabName) {
  shoppingGroups.forEach((group) => {
    const isActive = group.dataset.shoppingGroup === tabName;
    group.hidden = !isActive;
    group.classList.toggle("is-active", isActive);
  });

  shoppingTabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.shoppingTab === tabName);
  });
}

function renderDynamicTaskViews() {
  const todayTasksSection = document.getElementById("todayTasksSection");

  if (todayTasksSection) {
    todayTasksSection.innerHTML = renderTodayTasksContent(taskState);
  }

  renderTaskViews(taskState);
  refreshIcons();
}

async function loadTasks() {
  const apiTasks = await fetchTasks();
  taskState = toViewTasks(apiTasks);
  renderDynamicTaskViews();
}

function getTaskAssigneePayload(assignee) {
  if (assignee === "Александр") {
    return { assigneeType: "USER", assigneeUserId: "demo-alex" };
  }

  if (assignee === "Настя") {
    return { assigneeType: "USER", assigneeUserId: "demo-nastya" };
  }

  if (assignee === "Оба") {
    return { assigneeType: "SHARED" };
  }

  return { assigneeType: "UNASSIGNED" };
}

async function handleTaskSubmit(form) {
  const status = form.querySelector(".form-status");
  const submitButton = form.querySelector('[type="submit"]');
  const formData = new FormData(form);
  const title = String(formData.get("title") ?? "").trim();
  const priority = String(formData.get("priority") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();
  const assignee = String(formData.get("assignee") ?? "").trim();

  if (!title) return;

  if (status) {
    status.textContent = "Сохраняю...";
  }

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    await createTask({
      title,
      details: priority || null,
      category: "OTHER",
      deadline: deadline || null,
      ...getTaskAssigneePayload(assignee),
    });

    await loadTasks();
    form.reset();

    const deadlineField = form.querySelector('input[name="deadline"]');
    if (deadlineField) {
      deadlineField.value = DEFAULT_TASK_DATE;
    }

    if (status) {
      status.textContent = "Готово. Задача сохранена.";
    }

    window.setTimeout(() => setSheetOpen(false), 450);
  } catch (error) {
    console.error(error);
    if (status) {
      status.textContent = "Не получилось сохранить. Проверь сервер.";
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

carouselTrack?.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateDots);
});

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    lastSheetTrigger = button;
    setSheetOpen(true);
  });
});

profileOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    lastProfileTrigger = button;
    setProfileOpen(true);
  });
});
profileCloseButtons.forEach((button) => {
  button.addEventListener("click", () => setProfileOpen(false));
});
themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.themeChoice);
  });
});
closeQuickAdd?.addEventListener("click", () => setSheetOpen(false));
sheetBackdrop?.addEventListener("click", () => setSheetOpen(false));
backQuickAdd?.addEventListener("click", () => showQuickSheetView("menu"));
document.addEventListener("click", (event) => {
  const dailyPhotoCard = event.target.closest?.('[data-card-action="daily-photo"]');
  const tomorrowCard = event.target.closest?.('[data-card-action="tomorrow"]');
  const targetPageControl = event.target.closest?.("[data-target-page]");

  if (targetPageControl) {
    showPage(targetPageControl.dataset.targetPage);

    if (targetPageControl.dataset.targetPage === "auth") {
      showAuthStep("start");
    }

    if (profileSheet?.contains(targetPageControl)) {
      setProfileOpen(false);
    }
  }

  if (dailyPhotoCard) {
    setDailyPhotoOpen(true);
  }

  if (tomorrowCard) {
    showPage("calendar");
    showCalendarView("day");
  }
});

document.addEventListener("submit", (event) => {
  const authForm = event.target.closest?.("[data-auth-form]");

  if (!authForm) return;

  event.preventDefault();
  handleAuthFormSubmit(authForm);
});

document.addEventListener("click", async (event) => {
  const authMethodButton = event.target.closest?.("[data-auth-method-choice]");
  const authStepButton = event.target.closest?.("[data-auth-step]");
  const authResendButton = event.target.closest?.("[data-auth-resend]");
  const authCopyButton = event.target.closest?.("[data-auth-copy-code]");
  const authFinishButton = event.target.closest?.("[data-auth-finish]");
  const authDemoButton = event.target.closest?.("[data-auth-demo]");
  const authCloseButton = event.target.closest?.("[data-auth-close]");

  if (authMethodButton) {
    saveAuthState({ method: authMethodButton.dataset.authMethodChoice });
    updateAuthUi();
  }

  if (authStepButton) {
    const nextStep = authStepButton.dataset.authStep;
    saveAuthState({ mode: nextStep === "join" ? "join" : "create" });
    setAuthStatus("");
    showAuthStep(nextStep);
  }

  if (authResendButton) {
    saveAuthState({ codeSent: true });
    setAuthStatus("Код отправлен ещё раз.", "code");
  }

  if (authCopyButton) {
    const inviteCode = ensureInviteCode();

    try {
      await window.navigator.clipboard.writeText(inviteCode);
      setAuthStatus("Код скопирован.", "invite");
    } catch {
      setAuthStatus(`Код: ${inviteCode}`, "invite");
    }
  }

  if (authFinishButton) {
    completeAuth("create");
  }

  if (authDemoButton) {
    saveAuthState({
      authenticated: true,
      completed: true,
      mode: "demo",
      contact: "demo@lozhka.local",
      inviteCode: ensureInviteCode(),
    });
    showPage("today");
  }

  if (authCloseButton) {
    showPage("today");
  }
});
photoCloseButtons.forEach((button) => {
  button.addEventListener("click", () => setDailyPhotoOpen(false));
});
openCameraButton?.addEventListener("click", () => dailyPhotoInput?.click());
dailyPhotoInput?.addEventListener("change", () => {
  const file = dailyPhotoInput.files?.[0];
  if (!file || !openCameraButton) return;

  const previewUrl = URL.createObjectURL(file);
  openCameraButton.classList.add("has-photo");
  openCameraButton.style.backgroundImage = `url("${previewUrl}")`;

  const title = openCameraButton.querySelector("h3");
  const text = openCameraButton.querySelector("p");

  if (title) title.textContent = "Фото выбрано";
  if (text) text.textContent = "В прототипе оно показано как предпросмотр.";
});

quickActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showQuickSheetView(button.dataset.quickAction);
    const firstField = quickSheet.querySelector(`[data-sheet-view="${button.dataset.quickAction}"] input, [data-sheet-view="${button.dataset.quickAction}"] select, [data-sheet-view="${button.dataset.quickAction}"] textarea`);
    firstField?.focus();
  });
});

quickForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (form.dataset.sheetView === "task") {
      await handleTaskSubmit(form);
      return;
    }

    const status = form.querySelector(".form-status");

    if (status) {
      status.textContent = "Готово. В прототипе это пока не сохраняется в данные.";
    }
  });
});

document.addEventListener("change", async (event) => {
  const avatarInput = event.target.closest?.("[data-avatar-photo-input], [data-auth-avatar-input]");
  if (avatarInput) {
    await saveAvatarPhoto(avatarInput);
    return;
  }

  if (event.target.closest?.("[data-notification-key], [data-quiet-hours], [data-summary-time]")) {
    saveNotificationSettings();
  }

  const checkbox = event.target.closest?.("[data-task-complete]");
  if (!checkbox) return;

  const taskId = checkbox.dataset.taskId;
  if (!taskId) return;

  checkbox.disabled = true;

  try {
    await updateTaskCompletion(taskId, checkbox.checked);
    await loadTasks();
  } catch (error) {
    console.error(error);
    checkbox.checked = !checkbox.checked;
    checkbox.disabled = false;
    window.alert("Не получилось обновить задачу. Проверь подключение к серверу.");
  }
});

document.addEventListener("click", (event) => {
  const savePersonalButton = event.target.closest?.("[data-save-personal-data]");
  if (savePersonalButton) {
    savePersonalData();
  }

  const removeAvatarButton = event.target.closest?.("[data-avatar-photo-remove]");
  if (removeAvatarButton) {
    removeAvatarPhoto();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !quickSheet.hidden) {
    setSheetOpen(false);
  }

  if (event.key === "Escape" && dailyPhotoOverlay && !dailyPhotoOverlay.hidden) {
    setDailyPhotoOpen(false);
  }

  if (event.key === "Escape" && profileSheet && !profileSheet.hidden) {
    setProfileOpen(false);
  }
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    showPage(item.dataset.page);
  });
});

calendarViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showCalendarView(button.dataset.calendarView);
  });
});

shoppingTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showShoppingTab(button.dataset.shoppingTab);
  });
});

window.addEventListener("load", () => {
  applyTheme(getSavedTheme());
  applyPersonalData();
  applyNotificationSettings();
  updateAuthUi();
  refreshIcons();
  updateDots();
  showCalendarView("week");
  showShoppingTab("today");
  showPage(getAuthState().completed ? "today" : "auth");
  loadTasks().catch((error) => {
    console.warn("Tasks API is unavailable, mock tasks stay visible.", error);
  });
});
