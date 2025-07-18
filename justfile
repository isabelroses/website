alias b := build
alias r := run
alias u := update

default: build

build:
  pnpm run build

run:
  pnpm run dev

nix:
  nix build -L

update:
  pnpm upgrade
