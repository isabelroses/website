{
  pkgs ? import <nixpkgs> { inherit system; },
  system ? builtins.currentSystem,
  ...
}:
{
  isabelroses-website = pkgs.callPackage ./nix/package.nix { };
}
