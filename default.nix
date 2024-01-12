{
  lib,
  buildGoModule,
}:
buildGoModule {
  pname = "isabelroses-website";
  version = "0.0.1";

  src = ./.;

  vendorHash = "sha256-Q6ZAptN0HX1sauHVQG3MjOmL4+cXtQp2RGiKfOTXYWI=";

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
