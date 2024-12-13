{
  just,
  dart-sass,
  clippy,
  rustfmt,
  callPackage,
  rust-analyzer,
}:
let
  mainPkg = callPackage ./default.nix { };
in
mainPkg.overrideAttrs (oa: {
  nativeBuildInputs = [
    just
    dart-sass
    clippy
    rustfmt
    rust-analyzer
  ] ++ (oa.nativeBuildInputs or [ ]);
})
