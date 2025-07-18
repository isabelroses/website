{
  mkShell,
  callPackage,
  astro-language-server,
  tailwindcss-language-server,
  typescript,
}:
let
  mainPkg = callPackage ./default.nix { };
in
mkShell {
  inputsFrom = [ mainPkg ];

  packages = [
    astro-language-server
    tailwindcss-language-server
    typescript
  ];
}
