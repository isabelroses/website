alias b := build
alias r := run
alias u := update

# build ouput path
prefix := "dist"

default: build

build:
  pnpm run build

run:
  pnpm run dev

nix:
  nix build -L

update:
  pnpm upgrade

install:
  mkdir -p "{{ prefix }}"
  cp -r dist/* "{{ prefix }}"
