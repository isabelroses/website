{
  description = "isabelroses.com";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = inputs @ {flake-parts, ...}:
    flake-parts.lib.mkFlake {inherit inputs;} {
      systems = ["x86_64-linux" "aarch64-linux" "aarch64-darwin"];

      perSystem = {
        pkgs,
        system,
        ...
      }: {
        _module.args.pkgs = import inputs.nixpkgs {
          inherit system;
        };

        devShells.default = pkgs.mkShell {
          name = "isabelroses.com";
          packages = with pkgs; [
            go
            gopls
            air
            yarn
          ];
        };

        packages.default = pkgs.callPackage ./default.nix {};
      };
    };
}
