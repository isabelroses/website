default: build

build-styles:
  sass -q --no-source-map --style=compressed styles/main.scss src/styles/global.css

build-astro:
  pnpm run build

build:
  @just build-styles
  @just build-astro

run:
  @just build-styles
  pnpm run dev

nix:
  nix build -L
