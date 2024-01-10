{
  callPackage,
  go,
  gopls,
  yarn,
  air,
}: let
  mainPkg = callPackage ./default.nix {};
in
  mainPkg.overrideAttrs (oa: {
    nativeBuildInputs =
      [
        go
        gopls
        yarn
        air
      ]
      ++ (oa.nativeBuildInputs or []);
  })
