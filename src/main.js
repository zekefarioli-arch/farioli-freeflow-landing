// Utility selectors
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

// Footer year
function setYear() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

// Theme handling
const THEME_KEY = "ff_theme";

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
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

// Sticky header height -> CSS variable
function setHeaderHeightVar() {
  const header = $(".header");
  const h = header ? Math.ceil(header.getBoundingClientRect().height) : 72;
  document.documentElement.style.setProperty("--header-h", `${h}px`);
  return h;
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

  $$("#nav-menu a").forEach(link => link.addEventListener("click", closeMenu));

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return;
    closeMenu();
  });
}


// Decide if a section should be vertically centered or top-aligned
function initViewportSections() {
  const header = $(".header");
  const sections = $$("section.vh-section");
  if (!sections.length) return;

  const refresh = () => {
    const headerH = setHeaderHeightVar();
    const available = Math.max(200, window.innerHeight - headerH);

    sections.forEach(sec => {
      const contentHeight = sec.scrollHeight; // includes padding
      if (contentHeight > available) sec.classList.add("tall");
      else sec.classList.remove("tall");
    });
  };

  refresh();

  window.addEventListener("resize", refresh);

  if (header) {
    // If fonts load / zoom changes, etc.
    const ro = new ResizeObserver(() => refresh());
    ro.observe(header);
  }
}

// Active section highlighting (supports Home + fixes “top shows About”)
function initActiveLinks() {
  const links = $$("#nav-menu a").filter(a => (a.getAttribute("href") || "").startsWith("#"));
  if (!links.length) return;

  const linkByHash = new Map(links.map(a => [a.getAttribute("href"), a]));

  const clearAll = () => links.forEach(l => l.classList.remove("active"));
  const setActive = (hash) => {
  clearAll();
  const a = linkByHash.get(hash);
  if (a) a.classList.add("active");

  if (brand) {
    if (hash === "#home") brand.classList.add("home-active");
    else brand.classList.remove("home-active");
  }
};

  // Prefer Home when at the very top
  const homeLink = linkByHash.get("#home") || null;
  const brand = document.querySelector(".brand");

  const sections = links
    .map(a => $(a.getAttribute("href")))
    .filter(Boolean);

  const updateTopState = () => {
  if (window.scrollY <= 4) {
    setActive("#home");
  }
};

  const buildObserver = () => {
    const headerH = setHeaderHeightVar();

    const observer = new IntersectionObserver(
      entries => {
        updateTopState();
        if (window.scrollY <= 4) return;

        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (!visible?.target?.id) return;
        setActive(`#${visible.target.id}`);
      },
      {
        rootMargin: `-${headerH + 24}px 0px -60% 0px`,
        threshold: [0.12, 0.25, 0.5]
      }
    );

    sections.forEach(s => observer.observe(s));
    updateTopState();
  };

  buildObserver();
  window.addEventListener("scroll", updateTopState, { passive: true });
}

// Client-side form validation
function initForm() {
  const form = $("#contact-form");
  if (!form) return;

  const setError = (field, message) => {
    const errorEl = $(`[data-error-for="${field}"]`);
    if (errorEl) errorEl.textContent = message;
  };

  const clearErrors = () => ["name", "email", "message"].forEach(f => setError(f, ""));

  form.addEventListener("submit", (e) => {
    clearErrors();

    const name = $("#name")?.value.trim() || "";
    const email = $("#email")?.value.trim() || "";
    const message = $("#message")?.value.trim() || "";

    let valid = true;

    if (name.length < 2) { setError("name", "Please enter your name."); valid = false; }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) { setError("email", "Please enter a valid email address."); valid = false; }
    if (message.length < 10) { setError("message", "Please enter a longer message."); valid = false; }

    if (!valid) { e.preventDefault(); return; }

    if ((form.getAttribute("action") || "#") === "#") {
      e.preventDefault();
      form.reset();
    }
  });
}
function initAnchorScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    link.addEventListener("click", (e) => {
      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(null, "", hash);
    });
  });
}

// App bootstrap
setYear();
setHeaderHeightVar();
initTheme();
initNav();
initAnchorScroll();
initViewportSections();
initActiveLinks();
initForm();
