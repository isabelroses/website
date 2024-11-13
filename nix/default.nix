{ lib, rustPlatform }:
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
        ../Cargo.toml
        ../Cargo.lock
        ../src
        ../templates
        ../content
        ../static
      ]
    );
  };

  cargoLock.lockFile = ../Cargo.lock;

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
