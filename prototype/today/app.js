const carouselTrack = document.getElementById("carouselTrack");
const dots = Array.from(document.querySelectorAll("#carouselDots span"));
const openQuickAdd = document.getElementById("openQuickAdd");
const closeQuickAdd = document.getElementById("closeQuickAdd");
const quickSheet = document.getElementById("quickSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const navItems = Array.from(document.querySelectorAll(".nav-item"));
const pages = Array.from(document.querySelectorAll(".app-page"));
const addButtons = Array.from(document.querySelectorAll(".add-button"));
const calendarViewButtons = Array.from(document.querySelectorAll(".segment-control [data-calendar-view]"));
const calendarViews = Array.from(document.querySelectorAll(".calendar-view"));
const calendarModeLabel = document.getElementById("calendarModeLabel");
let lastSheetTrigger = openQuickAdd;

const calendarViewLabels = {
  month: "Месяц",
  week: "Неделя",
  day: "День",
  list: "Список",
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
    closeQuickAdd.focus();
  } else if (lastSheetTrigger) {
    lastSheetTrigger.focus();
  }
}

function showPage(pageName) {
  pages.forEach((page) => {
    page.hidden = page.dataset.page !== pageName;
    page.classList.toggle("is-active", page.dataset.page === pageName);
  });

  navItems.forEach((item) => {
    const isActive = item.dataset.page === pageName;
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !quickSheet.hidden) {
    setSheetOpen(false);
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

window.addEventListener("load", () => {
  refreshIcons();
  updateDots();
  showCalendarView("week");
});
