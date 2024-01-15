{
  lib,
  buildGoModule,
}:
buildGoModule {
  pname = "isabelroses-website";
  version = "0.0.1";

  src = ./.;

  # lib.fakeSha256 should be used to when deps update, but its not working for me so im leaving this here
  #  sha256-0000000000000000000000000000000000000000000=
  vendorHash = "sha256-8XpNo4WDDgSxoGBWpOamue3I1BWP0xtU8IA9BCAgBnQ=";

  ldflags = ["-s" "-w"];

  preBuild = ''
    substituteInPlace lib/settings.go \
      --replace "./" "$out/share/"
  '';

  postInstall = ''
    mkdir -p $out/share

    cp -r content $out/share/content
    cp -r public $out/share/public
    cp -r templates $out/share/templates
  '';

  meta = {
    description = "Website for isabelroses.com";
    homepage = "https://isabelroses.com/";
    license = lib.licenses.gpl3;
    maintainers = with lib.maintainers; [isabelroses];
    platforms = lib.platforms.all;
  };
}
