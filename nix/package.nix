{
  lib,
  just,
  pnpm,
  nodejs,
  stdenvNoCC,
  fetchPnpmDeps,
  pnpmConfigHook,
}:
stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "isabelroses-website";
  version = "0.11.2";

  src = ../.;

  nativeBuildInputs = [
    just
    pnpm
    nodejs
    pnpmConfigHook
  ];

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    fetcherVersion = 4;
    hash = "sha256-y/j0Wxxy2DHYmgzMkpVfrpTSMxBAVH6QpmLbYrdmT3U=";
  };

  dontUseJustCheck = true;

  justFlags = [
    "--set"
    "prefix"
    (placeholder "out")
  ];

  env.ASTRO_TELEMETRY_DISABLED = 1;

  meta = {
    description = "isabelroses.com";
    homepage = "https://isabelroses.com";
    license = with lib.licenses; [
      mit
      cc-by-nc-sa-40
    ];
    maintainers = with lib.maintainers; [ isabelroses ];
  };
})
