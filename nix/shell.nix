{
  mkShell,
  callPackage,

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
    bacon
    clippy
    rustfmt
    rust-analyzer
  ];
}
