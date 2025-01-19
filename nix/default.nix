{
  lib,
  rustPlatform,
  just,
  dart-sass,
}:
let
  toml = (lib.importTOML ../Cargo.toml).package;
in
rustPlatform.buildRustPackage {
  pname = "isabelroses-website";
  inherit (toml) version;

  src = lib.fileset.toSource {
    root = ../.;
    fileset = lib.fileset.intersection (lib.fileset.fromSource (lib.sources.cleanSource ../.)) (
      lib.fileset.unions [
        # for styles
        ../justfile
        ../styles

        # for the website content
        ../content
        ../static

        # for the website code
        ../Cargo.toml
        ../Cargo.lock
        ../src
        ../templates
      ]
    );
  };

  cargoLock = {
    lockFile = ../Cargo.lock;

    outputHashes."comrak-0.33.0" = "sha256-C7srY7ehXrEZuc7nm2knPCIpD1MQ/qq9MORW5H0j4ms=";
  };

  nativeBuildInputs = [
    just
    dart-sass
  ];

  dontUseJustInstall = true;
  dontUseJustBuild = true;
  dontUseJustCheck = true;

  preBuild = ''
    just build-styles
  '';

  meta = {
    description = "isabelroses.com";
    homepage = "https://isabelroses.com";
    license = with lib.licenses; [
      mit
      cc-by-nc-sa-40
    ];
    mainProgram = "isabelroses.com";
    maintainers = with lib.maintainers; [ isabelroses ];
  };
}
