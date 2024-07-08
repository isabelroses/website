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
        ../lib
        ../content
        ../api
        ../public
        ../templates
        ../pages
      ]
    );
  };

  vendorHash = "sha256-9ZjF2Y5xx0+NARkh1zbTb4igYbCDEGDIMBxJWXOeGvc=";

  ldflags = [
    "-s"
    "-w"
  ];

  # we change the rootdir so that the templates and other files are loaded from the right place
  # TODO: we should change this so that it uses an emebeded filesystem at some point
  preBuild = ''
    substituteInPlace lib/settings.go \
      --replace-fail 'RootDir string = "."' 'RootDir  string = "'$out/share'"'
  '';

  postInstall = ''
    mkdir -p $out/share

    cp -r content $out/share/content
    cp -r public $out/share/public
    cp -r templates $out/share/templates
  '';

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
