export const THEME_KEY = "theme-choice";

export type Theme = "dark" | "light";

// inlined into <head> by BaseHead so it runs before first paint: it must stay
// self-contained and never close over anything else in this module
export function initTheme(key: string) {
  const doc = document;
  const lightQuery = matchMedia("(prefers-color-scheme: light)");

  const stored = (): Theme | null => {
    try {
      const theme = localStorage.getItem(key);
      if (theme === "light" || theme === "dark") return theme;
    } catch {
      // storage blocked (private mode); fall back to the os
    }
    return null;
  };
  const resolve = (): Theme =>
    stored() ?? (lightQuery.matches ? "light" : "dark");
  // transitions are paused for the swap, otherwise anything with
  // transition-colors fades in late and sits dark-on-dark for a moment
  const apply = (theme: Theme) => {
    const root = doc.documentElement;
    root.setAttribute("data-theme-swap", "");
    root.setAttribute("data-theme", theme);
    getComputedStyle(root).color; // flush styles while transitions are off
    requestAnimationFrame(() => root.removeAttribute("data-theme-swap"));
  };

  apply(resolve());

  // the client router replaces <html>'s attributes on navigation; after-swap runs before paint
  doc.addEventListener("astro:after-swap", () => apply(resolve()));

  lightQuery.addEventListener("change", () => {
    if (!stored()) apply(resolve());
  });

  // delegated so toggles keep working after the header is swapped; only an
  // explicit toggle is remembered, so untouched visitors keep following the os
  doc.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    if (!target?.closest?.("[data-theme-toggle]")) return;
    const next: Theme =
      doc.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    try {
      localStorage.setItem(key, next);
    } catch {
      // storage blocked (private mode); the choice just won't persist
    }
    apply(next);
  });
}
