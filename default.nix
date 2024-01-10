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
      --replace "./" "$out/"
  '';

  postInstall = ''
    cp -r * $out/
  '';

  meta = {
    description = "Website for isabelroses.com";
    homepage = "https://isabelroses.com/";
    license = lib.licenses.gpl3;
    maintainers = with lib.maintainers; [isabelroses];
    platforms = lib.platforms.all;
  };
}
