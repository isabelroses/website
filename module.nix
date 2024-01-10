{
  config,
  lib,
  self',
  ...
}: let
  inherit (lib) mkIf mkEnableOption;
in {
  options = {
    services.isabelroses-website.enable = mkEnableOption "isabelroses-website";
  };

  config = mkIf config.services.isabelroses-website.enable {
    systemd.services."isabelroses-website" = {
      description = "isabelroses.com";
      after = ["network.target"];
      wantedBy = ["multi-user.target"];
      path = [
        self'.packages.default
      ];

      serviceConfig = {
        Type = "simple";
        DynamicUser = true;
        ExecStart = "${self'.packages.default}/bin/isabelroses.com";
        Restart = "always";
      };
    };
  };
}
