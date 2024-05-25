{ lib, buildGoModule }:
buildGoModule {
  pname = "isabelroses-website";
  version = "0.0.8";

  src = ../.;

  vendorHash = "sha256-rdAPPF8pqkK/JZSKC2XBmJDzgCh5PA5LJgrg9Z0ZAnU=";

  ldflags = [
    "-s"
    "-w"
  ];

  preBuild = ''
    substituteInPlace lib/settings.go \
      --replace 'RootDir  string = "."' 'RootDir  string = "'$out/share'"' \
      --replace 'ServeDir string = "."' 'ServeDir string = "/srv/storage/isabelroses.com"'
  '';

  postInstall = ''
    mkdir -p $out/share

    cp -r content $out/share/content
    cp -r public $out/share/public
    cp -r templates $out/share/templates
  '';

  meta = {
    description = "isabelroses.com";
    homepage = "https://isabelroses.com/";
    license = with lib.licenses; [
      gpl3
      # cc-by-nc-sa-40
    ];
    mainProgram = "isabelroses.com";
    maintainers = with lib.maintainers; [ isabelroses ];
  };
}
