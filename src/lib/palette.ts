import { readFileSync } from "node:fs";

// global.css is the only source of colours; build-time code reads them from it
const CSS_PATH = "src/styles/global.css";

const block = (css: string, opener: string) => {
  const start = css.indexOf(opener);
  if (start === -1)
    throw new Error(`palette: no "${opener}" block in ${CSS_PATH}`);
  return css.slice(start, css.indexOf("}", start));
};

const colours = (source: string) =>
  Object.fromEntries(
    [...source.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)].map(
      ([, name, value]) => [name, value.toLowerCase()],
    ),
  );

const css = readFileSync(CSS_PATH, "utf8");
const dark = colours(block(css, "@theme {"));
for (const name of ["fg", "fg-lighter", "bg", "card", "special", "blood"]) {
  if (!dark[name])
    throw new Error(`palette: --color-${name} missing from @theme`);
}

export const PALETTE = {
  dark,
  light: { ...dark, ...colours(block(css, '[data-theme="light"] {')) },
};

export const FONTS = {
  display: { family: "UnifrakturMaguntia", file: "unifraktur-maguntia" },
  sans: { family: "Grenze", file: "grenze" },
};
