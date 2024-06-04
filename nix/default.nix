{ lib, buildGoModule }:
buildGoModule {
  pname = "isabelroses-website";
  version = "0.0.9";

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

  vendorHash = "sha256-rdAPPF8pqkK/JZSKC2XBmJDzgCh5PA5LJgrg9Z0ZAnU=";

  ldflags = [
    "-s"
    "-w"
  ];

  preBuild = ''
    substituteInPlace lib/settings.go \
      --replace-fail 'RootDir  string = "."' 'RootDir  string = "'$out/share'"' \
      --replace-fail 'ServeDir string = "."' 'ServeDir string = "/srv/storage/isabelroses.com"'
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
      gpl3
      # cc-by-nc-sa-40
    ];
    mainProgram = "isabelroses.com";
    maintainers = with lib.maintainers; [ isabelroses ];
  };
}
