{
  description = "isabelroses.com";

  inputs.nixpkgs.url = "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.xz";

  outputs =
    { nixpkgs, self, ... }:
    let
      inherit (nixpkgs) lib;

      forAllSystems =
        f:
        lib.genAttrs
          [
            "x86_64-linux"
            "x86_64-darwin"
            "i686-linux"
            "aarch64-linux"
            "aarch64-darwin"
          ]
          (
            system:
            f (
              import nixpkgs {
                inherit system;
                config.allowUnfree = true;
              }
            )
          );
    in
    {
      packages = forAllSystems (pkgs: {
        default = self.packages.${pkgs.stdenv.hostPlatform.system}.isabelroses-website;
        isabelroses-website = pkgs.callPackage ./nix/package.nix { };
      });

      devShells = forAllSystems (pkgs: {
        default = pkgs.callPackage ./nix/shell.nix { };
      });

      nixosModules.default = import ./nix/module.nix self;
    };
}
