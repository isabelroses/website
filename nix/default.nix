{ lib, buildGoModule }:
buildGoModule {
  pname = "isabelroses-website";
  version = "0.1.0";

  src = lib.fileset.toSource {
    root = ../.;
    fileset = lib.fileset.intersection (lib.fileset.fromSource (lib.sources.cleanSource ../.)) (
      lib.fileset.unions [
        ../go.mod
        ../go.sum
        ../main.go
        ../api
        ../lib
        ../pages
        ../public
        ../templates
      ]
    );
  };

  vendorHash = "sha256-9ZjF2Y5xx0+NARkh1zbTb4igYbCDEGDIMBxJWXOeGvc=";

  ldflags = [
    "-s"
    "-w"
  ];

  meta = {
    description = "isabelroses.com";
    homepage = "https://isabelroses.com";
    license = with lib.licenses; [
      mit
      # cc-by-nc-sa-40
    ];
    mainProgram = "isabelroses.com";
    maintainers = with lib.maintainers; [ isabelroses ];
  };
}
