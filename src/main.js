// Utility selectors
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

// Footer year
function setYear() {
  const yearEl = $("#year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

// Theme handling
const THEME_KEY = "ff_theme";

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  applyTheme(getInitialTheme());

  const toggleBtn = $("#theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

// Mobile navigation
function initNav() {
  const toggle = $(".nav-toggle");
  const menu = $("#nav-menu");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  $$("#nav-menu a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return;
    closeMenu();
  });
}

// Active section highlighting
function initActiveLinks() {
  const links = $$("#nav-menu a").filter(a => a.getAttribute("href")?.startsWith("#"));
  const sections = links
    .map(a => $(a.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const linkById = new Map(
    links.map(a => [a.getAttribute("href"), a])
  );

  const observer = new IntersectionObserver(
    entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

      if (!visible?.target?.id) return;

      links.forEach(l => l.classList.remove("active"));
      const active = linkById.get(`#${visible.target.id}`);
      if (active) active.classList.add("active");
    },
    {
      rootMargin: "-25% 0px -65% 0px",
      threshold: [0.1, 0.25, 0.5]
    }
  );

  sections.forEach(section => observer.observe(section));
}

// Client-side form validation
function initForm() {
  const form = $("#contact-form");
  if (!form) return;

  const setError = (field, message) => {
    const errorEl = $(`[data-error-for="${field}"]`);
    if (errorEl) errorEl.textContent = message;
  };

  const clearErrors = () => {
    ["name", "email", "message"].forEach(f => setError(f, ""));
  };

  form.addEventListener("submit", (e) => {
    clearErrors();

    const name = $("#name")?.value.trim() || "";
    const email = $("#email")?.value.trim() || "";
    const message = $("#message")?.value.trim() || "";

    let valid = true;

    if (name.length < 2) {
      setError("name", "Please enter your name.");
      valid = false;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      setError("email", "Please enter a valid email address.");
      valid = false;
    }

    if (message.length < 10) {
      setError("message", "Please enter a longer message.");
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      return;
    }

    if ((form.getAttribute("action") || "#") === "#") {
      e.preventDefault();
      form.reset();
    }
  });
}

// App bootstrap
setYear();
initTheme();
initNav();
initActiveLinks();
initForm();
