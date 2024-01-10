self: {
  pkgs,
  config,
  lib,
  ...
}: let
  inherit (lib) mkIf mkEnableOption;
in {
  options.services.isabelroses-website.enable = mkEnableOption "isabelroses-website";

  config = mkIf config.services.isabelroses-website.enable {
    systemd.services."isabelroses-website" = {
      description = "isabelroses.com";
      after = ["network.target"];
      wantedBy = ["multi-user.target"];
      path = [
        self.packages.${pkgs.stdenv.hostPlatform.system}.default
      ];

      serviceConfig = {
        Type = "simple";
        DynamicUser = true;
        ExecStart = "${self.packages.${pkgs.stdenv.hostPlatform.system}.default}/bin/isabelroses.com";
        Restart = "always";
      };
    };
  };
}
