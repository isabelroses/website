{
  callPackage,
  go,
  gopls,
  bun,
  air,
}: let
  mainPkg = callPackage ./default.nix {};
in
  mainPkg.overrideAttrs (oa: {
    nativeBuildInputs =
      [
        go
        gopls
        bun
        air
      ]
      ++ (oa.nativeBuildInputs or []);
  })
