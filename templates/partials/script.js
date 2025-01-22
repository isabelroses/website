// set theme on intial load
setTheme(getTheme());

document.addEventListener("DOMContentLoaded", () => {
  const themes = document.getElementById("themes");

  setTheme(getTheme());

  themes.addEventListener("change", (event) => {
    setTheme(event.target.value);
  });
});

function setTheme(theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.className = theme;

  const themes = document.getElementById("themes");
  if (themes) {
    themes.value = theme;
  }
}

function getTheme() {
  const theme = localStorage.getItem("theme");

  if (theme) return theme;

  if (!window.matchMedia) return "theme-dark";

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "theme-dark";
  } else {
    return "theme-light";
  }
}
