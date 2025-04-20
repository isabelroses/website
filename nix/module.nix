self:
{
  lib,
  pkgs,
  config,
  ...
}:
let
  inherit (lib) mkIf mkEnableOption;
in
{
  options.services.isabelroses-website.enable = mkEnableOption "isabelroses-website";

  config = mkIf config.services.isabelroses-website.enable {
    services.nginx.virtualHosts.isabelroses-website = {
      root = self.packages.${pkgs.stdenv.hostPlatform.system}.isabelroses-website;
    };
  };
}
