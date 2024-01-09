{
  lib,
  buildGoModule,
}:
buildGoModule {
  pname = "isabelroses.com";
  version = "0.0.1";

  src = ./.;

  vendorHash = "sha256-Q6ZAptN0HX1sauHVQG3MjOmL4+cXtQp2RGiKfOTXYWI=";

  ldflags = ["-s" "-w"];

  meta = with lib; {
    description = "My personal website";
    homepage = "https://github.com/isabelroses/website";
    license = with licenses; [gpl3];
    maintainers = with maintainers; [isabelroses];
  };
}
