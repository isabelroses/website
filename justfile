build-styles:
  sass -q --no-source-map --style=compressed styles/main.scss static/styles.css

build:
  @just build-styles
  cargo build

release:
  @just build-styles
  cargo build --release

run:
  @just build-styles
  cargo run

nix:
  nix build -L
