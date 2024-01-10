{
  description = "isabelroses.com";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";

  outputs = {nixpkgs, ...}: let
    forAllSystems = nixpkgs.lib.genAttrs ["x86_64-linux" "x86_64-darwin" "i686-linux" "aarch64-linux" "aarch64-darwin"];
    pkgsForEach = nixpkgs.legacyPackages;
  in {
    packages = forAllSystems (system: {
      default = pkgsForEach.${system}.callPackage ./default.nix {};
    });

    devShells = forAllSystems (system: {
      default = pkgsForEach.${system}.callPackage ./shell.nix {};
    });

    nixosModules.default = import ./module.nix;
  };
}
