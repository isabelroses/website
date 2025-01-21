{
  mkShell,
  callPackage,

  typos,
  bacon,
  clippy,
  rustfmt,
  rust-analyzer,
}:
let
  mainPkg = callPackage ./default.nix { };
in
mkShell {
  inputsFrom = [ mainPkg ];

  packages = [
    typos
    bacon
    clippy
    rustfmt
    rust-analyzer
  ];
}
