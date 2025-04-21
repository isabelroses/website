default: build

build:
  pnpm run build

run:
  pnpm run dev

nix:
  nix build -L
