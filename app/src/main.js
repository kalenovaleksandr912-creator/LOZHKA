import { renderBottomNav, renderQuickSheet } from "./components/layout.js?v=11";
import { renderCalendarPage } from "./pages/calendar.js?v=11";
import { renderMenuPage } from "./pages/menu.js?v=11";
import { renderMorePage } from "./pages/more.js?v=11";
import { renderPeoplePage } from "./pages/people.js?v=11";
import { renderShoppingPage } from "./pages/shopping.js?v=11";
import { renderStatsPage } from "./pages/stats.js?v=11";
import { renderTasksPage } from "./pages/tasks.js?v=11";
import { renderTodayPage } from "./pages/today.js?v=11";

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
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");

    if (status) {
      status.textContent = "Готово. В прототипе это пока не сохраняется в данные.";
    }
  });
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
});
