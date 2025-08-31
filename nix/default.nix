{
  lib,
  just,
  stdenvNoCC,
  nodejs_24,
  pnpm_10,
}:
let
  nodejs = nodejs_24;
  pnpm = pnpm_10.override { inherit nodejs; };
in
stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "isabelroses-website";
  version = "0.10.0";

  src = ../.;

  nativeBuildInputs = [
    just
    nodejs
    pnpm.configHook
  ];

  pnpmDeps = pnpm.fetchDeps {
    inherit (finalAttrs) pname version src;
    fetcherVersion = 2;
    hash = "sha256-/7uhKfbzErQSt6D4aGRKpqK0hnVMcYTfhKd7gJ7pfUU=";
  };

  dontUseJustInstall = true;
  dontUseJustCheck = true;

  installPhase = ''
    runHook preInstall

    mkdir -p "$out"
    cp -r dist/* "$out"

    runHook postInstall
  '';

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
})
