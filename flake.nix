{
  description = "isabelroses.com flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        devShells.default = pkgs.mkShellNoCC {
          name = "isabelroses.com";
          packages = with pkgs; let
            mkNpxAlias = name: writeShellScriptBin name "npx ${name} \"$@\"";
          in [
            (nodePackages.yarn.override {inherit nodejs_20;})
            nodejs_20
            eslint_d
            prettierd
            (mkNpxAlias "tsc")
            (mkNpxAlias "tsserver")

            # for python gen script
            python3
            # python3.withPackages
            # (
            #   with python311Packages; [
            #     pathlib
            #     pyyaml
            #     feedgen
            #     pytz
            #   ]
            # )
          ];
        };
      }
    );
}
