import { renderBottomNav, renderQuickSheet } from "./components/layout.js?v=12";
import { renderCalendarPage } from "./pages/calendar.js?v=12";
import { renderMenuPage } from "./pages/menu.js?v=12";
import { renderMorePage } from "./pages/more.js?v=12";
import { renderPeoplePage } from "./pages/people.js?v=12";
import { renderShoppingPage } from "./pages/shopping.js?v=12";
import { renderStatsPage } from "./pages/stats.js?v=12";
import { renderTaskViews, renderTasksPage } from "./pages/tasks.js?v=12";
import { renderTodayPage, renderTodayTasksContent } from "./pages/today.js?v=12";
import { createTask, fetchTasks, updateTaskCompletion } from "./lib/api.js?v=12";
import { DEFAULT_TASK_DATE, toViewTasks } from "./lib/task-view.js?v=12";

const app = document.getElementById("app");

app.innerHTML = `
  ${renderTodayPage()}
  ${renderTasksPage()}
  ${renderCalendarPage()}
  ${renderMorePage()}
  ${renderMenuPage()}
  ${renderShoppingPage()}
  ${renderStatsPage()}
  ${renderPeoplePage()}
  ${renderBottomNav()}
  ${renderQuickSheet()}
`;

const navItems = Array.from(document.querySelectorAll(".nav-item"));
const pages = Array.from(document.querySelectorAll(".app-page"));
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
let lastSheetTrigger = document.getElementById("openQuickAdd");
let taskState = [];
const secondaryPages = new Set(["menu", "shopping", "stats", "people"]);

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

closeQuickAdd?.addEventListener("click", () => setSheetOpen(false));
sheetBackdrop?.addEventListener("click", () => setSheetOpen(false));
backQuickAdd?.addEventListener("click", () => showQuickSheetView("menu"));
document.addEventListener("click", (event) => {
  const dailyPhotoCard = event.target.closest?.('[data-card-action="daily-photo"]');
  const tomorrowCard = event.target.closest?.('[data-card-action="tomorrow"]');
  const targetPageControl = event.target.closest?.("[data-target-page]");

  if (targetPageControl) {
    showPage(targetPageControl.dataset.targetPage);
  }

  if (dailyPhotoCard) {
    setDailyPhotoOpen(true);
  }

  if (tomorrowCard) {
    showPage("calendar");
    showCalendarView("day");
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !quickSheet.hidden) {
    setSheetOpen(false);
  }

  if (event.key === "Escape" && dailyPhotoOverlay && !dailyPhotoOverlay.hidden) {
    setDailyPhotoOpen(false);
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
  refreshIcons();
  updateDots();
  showCalendarView("week");
  showShoppingTab("today");
  loadTasks().catch((error) => {
    console.warn("Tasks API is unavailable, mock tasks stay visible.", error);
  });
});
