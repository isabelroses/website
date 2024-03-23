{
  go,
  bun,
  air,
  gopls,
  callPackage,
}: let
  mainPkg = callPackage ./default.nix {};
in
  mainPkg.overrideAttrs (oa: {
    nativeBuildInputs =
      [
        go
        bun
        air
        gopls
      ]
      ++ (oa.nativeBuildInputs or []);
  })
