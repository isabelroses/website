---
title: A NixOS PDS Hosting Guide
description: How to host your own personal data server using NixOS
date: 2025-11-04
tags:
  - guide
  - nix
---

## Introduction

Over the last number of days leading up to writing this guide I have been
sharing my dotfiles left and right as a way to help people setting up their own
personal data server, which I shall start to refer to as PDS going forwards.

## Understanding my assumptions

Before we go any further I think it's best you understand some of the assumptions
I have made when writing this guide.

1. I am going to make a logical leap to assume you already are using NixOS as
   the host for your server. If you are not, I would highly recommend reading
   [the NixOS manual on installing
   NixOS](https://nixos.org/manual/nixos/stable/#sec-installation).

2. I will be keeping all nix code agnostic from flakes and classic nix.

3. We will only be dealing with the [reference implementation of the PDS](https://github.com/bluesky-social/pds) and not
   alternative implementations such as [cocoon](https://github.com/haileyok/cocoon) even if [they are packaged in
   nixpkgs](https://github.com/NixOS/nixpkgs/pull/458034).

4. I will be targeting my article towards unstable and the next upcoming stable
   release. If you are using the 25.05 release of NixOS, you will have to change
   any references of `bluesky-pds` to `pds` as the package was renamed on
   unstable and later releases.

## Understanding your requirements

Before even starting to set up your PDS we should first consider how many
people we are going to host on the PDS. The [bluesky PDS
documentation](https://github.com/bluesky-social/pds#self-hosting-a-pds)
suggests that for 1-20 users 1GB of ram, 1 vCPU and 20GB of storage is
sufficient. However, if you plan to host more users you should consider
increasing these resources accordingly. I also personally consider a single
user PDS to be a different entire world from a multi user PDS, so keep that in
mind.

## Setting up the PDS

As with any NixOS service the first step will be to set the `enable` option for
the service we have chosen to `true`. This will look like such

```nix
{
  services.bluesky-pds = {
    enable = true;
  };
}
```

## Configuring the PDS

### overwhelming configuration

At first the [list of environment
variables](https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/config/env.ts)
can appear overwhelming. However, we are only going to need a few of them. Those being:

- `PDS_PORT`
- `PDS_HOSTNAME`
- `PDS_ADMIN_EMAIL`
- `PDS_JWT_SECRET`
- `PDS_ADMIN_PASSWORD`
- `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX`

If you are going to be dealing with more than one user on your PDS you should
also be aware of the following optional environment variables.

- `PDS_EMAIL_SMTP_URL`
- `PDS_EMAIL_FROM_ADDRESS`

So lets get started with the easier ones! I personally run the PDS on the port
`3000` since I have it free, so that's what I'll use that in our example. Now
we will need to get a domain name for our PDS for the sake of this example I
will be using `example.com`. It is also 2025 so I'll assume that everyone has
an email address that they can use for the admin of the PDS. So now let's put
that all into practice by adding the settings to our nix configuration.

```nix
{
  services.bluesky-pds = {
    enable = true;

    settings = {
      PDS_PORT = 3000;
      PDS_HOSTNAME = "example.com";
      PDS_ADMIN_EMAIL = "me@example.com";
    };
  };
}
```

### Secrets

We are now faced with the time old question, "how do we deal with secrets in
nix?". First off you should **not** put your secrets into plain nix code as this
will place your secrets into the nix store, which everyone can see. So I would
recommend either [`agenix`](https://github.com/ryantm/agenix) or
[`sops-nix`](https://github.com/Mic92/sops-nix). I shall not cover setting up
either of these but I will explain how to generate the secrets and how to use
both agenix and sops-nix here

To generate the `PDS_JWT_SECRET` and `PDS_ADMIN_PASSWORD`, you should open your
preferred terminal and run

```bash
openssl rand --hex 16
```

You **must** run this once for each secret.

And to generate the `PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX` secret you
should run

```bash
openssl ecparam --name secp256k1 --genkey --noout --outform DER | tail --bytes=+8 | head --bytes=32 | xxd --plain --cols 32
```

You should now place your newly generated secrets into your secrets manager.
This should look something similar to

```bash
PDS_JWT_SECRET=b2a99dc959f0509218cb64f46aec1d7b
PDS_ADMIN_PASSWORD=5114f716065307d0536fcfebc2044ced
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX=78860ff08707c1219a890de116920c53507846d0cc702af9e7a5bba18cd6398c
```

With Agenix this may look something like

```nix
{ config, ... }:
{
  age.secrets.pds = {
    file = ./pds.age; # replace with the path to your secret
    mode = "600";
    owner = "pds";
    group = "pds";
  };

  services.bluesky-pds = {
    enable = true;

    environmentFiles = [ config.age.secrets.pds.path ];

    settings = {
      PDS_PORT = 3000;
      PDS_HOSTNAME = "example.com";
      PDS_ADMIN_EMAIL = "me@example.com";
    };
  };
}
```

And sops-nix this will look like

```nix
{ config, ... }:
{
  sops.secrets.pds = {
    owner = "pds";
    group = "pds";
  };

  services.bluesky-pds = {
    enable = true;

    environmentFiles = [ config.sops.secrets.pds.path ];

    settings = {
      PDS_PORT = 3000;
      PDS_HOSTNAME = "example.com";
      PDS_ADMIN_EMAIL = "me@example.com";
    };
  };
}
```

### The mailer

If you're on a single user PDS you can skip this step, as long as you're willing
to search for the `email_token` in `/var/lib/pds/accounts.sqlite`, when you
first move your account, whenever you're trying to reset your password and so on.

I have set up both SMTP and [resend](https://resend.com/) in my time hosting my
PDS. Resend is by far the easier option if want your PDS to just work, or this
is your first time dealing with the horrors of SMTP and emails.

In the case of resend append the following to your secrets, having replaced the
placeholder details.

```bash
PDS_EMAIL_SMTP_URL=smtps://resend:<your-api-key-here>@smtp.resend.com:465/
PDS_EMAIL_FROM_ADDRESS=noreply@example.com
```

In the case that you are daring enough to use SMTP and your own mail server. You
should append the following to your secrets file, having replaced the placeholder data.
Please note that you **must** [percent encode](https://en.wikipedia.org/wiki/Percent-encoding) your username and password.

```bash
PDS_EMAIL_SMTP_URL=smtps://username:password@smtp.example.com/
PDS_EMAIL_FROM_ADDRESS=noreply@example.com
```

### Additional fun variables

There are still some more optional variables that you may want to consider
using!

If you have multiple domains that would be good for using as handles you can
use `PDS_SERVICE_HANDLE_DOMAINS` to do this. An example of this is
`PDS_SERVICE_HANDLE_DOMAINS=.example.com,.catsky.social`.

Another useful option is `PDS_CRAWLERS`. I have shamelessly sourced my example
of crawlers from [compare hoses](https://compare.hose.cam). So here is how it
may look in nix code.

```nix
PDS_CRAWLERS = lib.concatStringsSep "," [
  "https://bsky.network"
  "https://relay.cerulea.blue"
  "https://relay.fire.hose.cam"
  "https://relay2.fire.hose.cam"
  "https://relay3.fr.hose.cam"
  "https://relay.hayescmd.net"
  "https://relay.xero.systems"
  "https://relay.upcloud.world"
  "https://relay.feeds.blue"
  "https://atproto.africa"
];
```

## The web server

For this part I shall be be providing both [`nginx`](https://nginx.org/) and
[`caddy`](https://caddyserver.com/) examples. We will need to proxy the port we
selected, in my case that is `3000` but we can do this in a smart way by
accessing the port through the `config` attr. This will look like
`config.services.bluesky-pds.settings.PDS_PORT`, from there we can apply this
same premise to the domain. We must also proxy both our domain and all
subdomains of our PDS's domain since subdomains are used for the handles of the
PDS accounts.

In nginx this will look like

```nix
{ config, ... }:
let
  pdsSettings = config.services.bluesky-pds.settings;
in
{
  sops.secrets.pds = {
    owner = "pds";
    group = "pds";
  };

  services = {
    bluesky-pds = {
      enable = true;

      environmentFiles = [ config.sops.secrets.pds.path ];

      settings = {
        PDS_PORT = 3000;
        PDS_HOSTNAME = "example.com";
        PDS_ADMIN_EMAIL = "me@example.com";
      };
    };

    nginx = {
      enable = true;

      virtualHosts.${pdsSettings.PDS_HOSTNAME} = {
        serverName = "${pdsSettings.PDS_HOSTNAME} .${pdsSettings.PDS_HOSTNAME}";

        locations."/" = {
          proxyPass = "http://127.0.0.1:${toString pdsSettings.PDS_PORT}";
          proxyWebsockets = true;
        };
      };
    };
  };
}
```

and in caddy it will look like

```nix
{ config, ... }:
let
  pdsSettings = config.services.bluesky-pds.settings;
in
{
  sops.secrets.pds = {
    owner = "pds";
    group = "pds";
  };

  services = {
    bluesky-pds = {
      enable = true;

      environmentFiles = [ config.sops.secrets.pds.path ];

      settings = {
        PDS_PORT = 3000;
        PDS_HOSTNAME = "example.com";
        PDS_ADMIN_EMAIL = "me@example.com";
      };
    };

    caddy = {
      enable = true;

      virtualHosts.${pdsSettings.PDS_HOSTNAME} = {
        serverAliases = [ "*.${pdsSettings.PDS_HOSTNAME}" ];
        extraConfig = ''
          import common
          reverse_proxy http://127.0.0.1:${toString pdsSettings.PDS_PORT}
        '';
      };
    };
  };
}
```

### Age assurance

We cannot be done just there; some of us are unfortunate enough to live in the
UK under the online safety act. However, a lovely [gist on bluesky
osa](https://gist.github.com/mary-ext/6e27b24a83838202908808ad528b3318) has
been provided to us by the lovely
[mary](https://bsky.app/profile/did:plc:ia76kvnndjutgedggx2ibrem). So let us apply this to our nix code.

In nginx this will look like such

```nix
{
  # ... same as before

  nginx = {
    enable = true;

    virtualHosts.${pdsSettings.PDS_HOSTNAME} = {
      serverName = "${pdsSettings.PDS_HOSTNAME} .${pdsSettings.PDS_HOSTNAME}";

      locations = {
        "/" = {
          proxyPass = "http://127.0.0.1:${toString pdsSettings.PDS_PORT}";
          proxyWebsockets = true;
        };

        "/xrpc/app.bsky.unspecced.getAgeAssuranceState" =
          let
            state = builtins.toJSON {
              lastInitiatedAt = "2025-07-14T15:11:05.487Z";
              status = "assured";
            };
          in
          {
            return = "200 '${state}'";
            extraConfig = ''
              add_header access-control-allow-headers "authorization,dpop,atproto-accept-labelers,atproto-proxy" always;
              add_header access-control-allow-origin "*" always;
              add_header X-Frame-Options SAMEORIGIN always;
              add_header X-Content-Type-Options nosniff;
              default_type application/json;
            '';
          };
      };
    };
  };
}
```

And with caddy

```nix
{
  # ... same as before

  caddy = {
    enable = true;

    virtualHosts.${pdsSettings.PDS_HOSTNAME} = {
      serverAliases = [ "*.${pdsSettings.PDS_HOSTNAME}" ];
      extraConfig = ''
        import common
        reverse_proxy http://127.0.0.1:${toString pdsSettings.PDS_PORT}

        handle /xrpc/app.bsky.unspecced.getAgeAssuranceState {
          header content-type "application/json"
          header access-control-allow-headers "authorization,dpop,atproto-accept-labelers,atproto-proxy"
          header access-control-allow-origin "*"
          respond `{"lastInitiatedAt":"2025-07-14T14:22:43.912Z","status":"assured"}` 200
        }
      '';
    };
  };
}
```

## Create a test account & migration

It is important that you now access the server and create a test repo. To do
this you can use `pdsadmin` which is installed by default by the NixOS module.
We **really** want to do this because there are possible issue that may arise when using a
newly setup PDS, see [setting up a pds by
lyna](https://blooym.dev/blog/setting-up-at-pds).

The below example will create an account for you with the email address and
handle as follows, make sure you replace the placeholder with your own data.

```bash
pdsadmin account create test@example.com test.example.com
```

When you have confirmed that everything is running well you can use
[pdsmoover](https://pdsmoover.com/) by the lovely [Bailey
Townsend](https://bsky.app/profile/did:plc:rnpkyqnmsw4ipey6eotbdnnf). But to do
so you will need an invite code from your PDS which you can generate with the
following command

```bash
pdsadmin create-invite-code
```

Now you can move your account over for which [there are](https://git.witchcraft.systems/scientific-witchery/pds-starter-pack#how-to-move-an-existing-account-to-our-pds) [many](https://tgirl.cloud/blog/migrating-pds/) [guides](https://blacksky.community/profile/did:plc:g7j6qok5us4hjqlwjxwrrkjm/post/3lw3hcuojck2u).

## Add PDS gatekeeper (optional)

[PDS gatekeeper](https://tangled.org/@baileytownsend.dev/pds-gatekeeper) is a
service, once again created by Bailey Townsend, that adds 2FA email and
endpoint spam prevention, which is why I choose to employ it. In the future I
intend to upstream my code packaging and modularizing to nixpkgs, but until
then you will have to consume [tgirlpkgs](https://github.com/tgirlcloud/pkgs).
Please follow the setup guide documented in their readme!

From there it is as simple as adding the following to your previous configuration.

```nix
{ config, ... }:
let
  pdsSettings = config.services.bluesky-pds.settings;
in
{
  services.pds-gatekeeper = {
    enable = true;

    # assuming you're using nginx this will do all the stuff for you!
    setupNginx = true;

    settings = {
      # this should be different to the PDS's port
      GATEKEEPER_PORT = 3001;

      PDS_BASE_URL = "http://127.0.0.1:${toString pdsSettings.PDS_PORT}";
      GATEKEEPER_TRUST_PROXY = "true";

      # we need to share a lot of secrets between pds and gatekeeper
      # if you're using agenix make sure to swap the sops to age
      PDS_ENV_LOCATION = config.sops.secrets.pds.path;
    };
  };
}
```

## Conclusion

You should now be all set! You have got your PDS running!

You should also consider giving me money on
[ko-fi](https://ko-fi.com/isabelroses) or [github
sponsors](https://github.com/sponsors/isabelroses) for writing this because I
suck at writing and I spent a few hours on this.
