{
  go,
  bun,
  air,
  gopls,
  typos,
  callPackage,
}:
let
  mainPkg = callPackage ./default.nix { };
in
mainPkg.overrideAttrs (oa: {
  nativeBuildInputs = [
    go
    bun
    air
    gopls
    typos
  ] ++ (oa.nativeBuildInputs or [ ]);
})
