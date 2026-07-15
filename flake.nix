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

      formatter = forAllSystems (
        pkgs:
        pkgs.treefmt.withConfig {
          runtimeInputs = [
            # keep-sorted start
            pkgs.actionlint
            pkgs.keep-sorted
            pkgs.lychee
            pkgs.typos
            pkgs.yamlfmt
            pkgs.zizmor
            # keep-sorted end
          ];

          settings = {
            on-unmatched = "info";
            tree-root-file = "flake.nix";

            formatter = {
              # keep-sorted start block=yes newline_separated=yes
              actionlint = {
                command = "actionlint";
                includes = [
                  ".github/workflows/*.yml"
                  ".github/workflows/*.yaml"
                ];
              };

              keep-sorted = {
                command = "keep-sorted";
                includes = [ "*" ];
              };

              lychee = {
                command = "lychee";
                includes = [ "*" ];
                excludes = [ "*.svg" ];
              };

              typos = {
                command = "typos";
                includes = [ "*" ];
                excludes = [
                  "*.ttf"
                  "*.woff2"
                  "*.webp"
                  "*.png"
                  "*.jpeg"
                  "*.pdf"
                  "*.ico"
                  "*.gif"
                  "*.svg"
                ];
              };

              yamlfmt = {
                command = "yamlfmt";
                options = [
                  "-formatter"
                  "retain_line_breaks_single=true"
                ];
                includes = [
                  "*.yml"
                  "*.yaml"
                ];
                excludes = [ "pnpm-lock.yaml" ];
              };

              zizmor = {
                command = "zizmor";
                includes = [
                  ".github/workflows/*.yml"
                  ".github/workflows/*.yaml"
                ];
              };
              # keep-sorted end
            };
          };
        }
      );
    };
}
