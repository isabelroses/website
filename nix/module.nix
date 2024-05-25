self:
{
  pkgs,
  config,
  lib,
  ...
}:
let
  inherit (lib) mkIf mkEnableOption getExe;
in
{
  options.services.isabelroses-website.enable = mkEnableOption "isabelroses-website";

  config = mkIf config.services.isabelroses-website.enable {
    systemd.services."isabelroses-website" = {
      description = "isabelroses.com";
      after = [ "network.target" ];
      wantedBy = [ "multi-user.target" ];
      path = [ self.packages.${pkgs.stdenv.hostPlatform.system}.default ];

      serviceConfig = {
        Type = "simple";
        ReadWritePaths = [ "/srv/storage/isabelroses.com" ];
        DynamicUser = true;
        ExecStart = "${getExe self.packages.${pkgs.stdenv.hostPlatform.system}.default}";
        Restart = "always";
      };
    };
  };
}
