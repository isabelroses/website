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
      locations."/".tryFiles = "$uri $uri.html $uri/ =404";
      # filenames are content-hashed, so they never change. `expires` rather than
      # add_header, which would drop any add_header inherited from the server block
      locations."/_astro/".extraConfig = ''
        expires max;
      '';
      extraConfig = ''
        error_page 404 /404.html;
      '';
    };
  };
}
