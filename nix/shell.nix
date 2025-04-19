{
  mkShell,
  callPackage,
  astro-language-server,
}:
let
  mainPkg = callPackage ./default.nix { };
in
mkShell {
  inputsFrom = [ mainPkg ];

  packages = [ astro-language-server ];
}
