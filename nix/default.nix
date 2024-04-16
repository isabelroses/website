{
  lib,
  buildGoModule,
}:
buildGoModule {
  pname = "isabelroses-website";
  version = "0.0.6";

  src = ../.;

  # lib.fakeSha256 should be used to when deps update, but its not working for me so im leaving this here
  #  sha256-0000000000000000000000000000000000000000000=
  vendorHash = "sha256-jiVZFgRhb1X6FAEjI6diHWeUCmY2v5iq2SHFKnj+mhc=";

  ldflags = ["-s" "-w"];

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
    maintainers = with lib.maintainers; [isabelroses];
  };
}
