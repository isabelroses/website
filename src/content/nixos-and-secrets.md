---
title: NixOS and Secrets
description: My takes and experinces with secrets management on NixOS
date: 2026-05-08
tags:
  - nixos
  - secrets
---

To start this off I will say that I've been using NixOS for 3 years now and I
have used the main 6 (or 7 if we include ragenix) secrets management tools on
NixOS. This consists of:

- [sops-nix](https://github.com/Mic92/sops-nix)
- [agenix](https://github.com/ryantm/agenix) or [ragenix](https://github.com/yaxitech/ragenix)
- using your filesystem to its full potential but loosing reproducibility on another machine
- putting your secrets into private git repo
- storing them in the main repo with git-crypt
- writing the secrets directly into your nix configuration

Before we go any further I want to say DO NOT use the last three if you intend
to do share your machines or make your configuration public. This is because
the nix store is world readable and people who have access to the machine will
be able to read the secrets. I find this particularly pertinent at the time of
writing with the following vulnerabilities: [CVE-2026-31431
(copyfail)](https://copy.fail/) and [CVE-2026-43284 and CVE-2026-43500
(dirtyfrag)](https://github.com/V4bel/dirtyfrag). For this reason I will not
cover any of these options. But that is not to say I am guilt free in all of
this. I have leaked my secrets on at least two occasions
[1](https://github.com/isabelroses/dotfiles/blob/f84c2265720107530d9d9c85e61aed47bc2f839c/hosts/hydra/settings.nix#L63)
[2](https://github.com/isabelroses/dotfiles/blob/796597ead9c7ea70413faae1a695cb9fb43c9536/env.nix),
and I'm sure you can find more if you look further.

## sops-nix

So I have a bit of a love hate relationship with sops-nix. It was my first tool
for secrets management but it was really hard to get into and working back when
I originally started using it 3 years ago. Especially for a none technical
user like I was at the time I really struggled to get it working. Which also
eventually lead to me removing it since I didn't understand it.

However, now I'm looking back it was easier than I realized, the docs have
gotten miles better, and now sops natively supports using ssh keys to encrypt and
decrypt secrets which is a huge improvement. Sadly sops-nix is lagging behind
in support for this, see both
[sops-nix#779](https://github.com/Mic92/sops-nix/pull/779) and [sops-nix#922](https://github.com/Mic92/sops-nix/pull/922).

The way you use sops-nix is by creating a yaml file with the rules for
encrypting and decrypting secrets. An example of this might look like this:

```yaml title=.sops.yaml
keys:
  - &isabel ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMQDiHbMSinj8twL9cTgPOfI6OMexrTZyHX27T8gnMj2

creation_rules:
  - path_regex: secrets/*.yaml
    key_groups:
      - age:
          - *isabel
```

Then you can use the `sops` command line tool to encrypt and decrypt the
secrets. This command may look like `sops secrets/shush.yaml`. This will then
open your chosen editor to allow you to configure a yaml file. 

```yaml title=secrets/shush.yaml
hello: sops
```

Upon exiting the editor the data will then be encrypted and may look something like:

```yaml title=secrets/shush.yaml
hello: ENC[AES256_GCM,data:5ar0KQ==,iv:WpVEI/BetAloDP/9+4y28udJ04Loh4EBXFm5E8Sln7s=,tag:15IWu728tKQUYJHx9roVrQ==,type:str]
sops:
    age:
        - recipient: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMQDiHbMSinj8twL9cTgPOfI6OMexrTZyHX27T8gnMj2
          enc: |
            -----BEGIN AGE ENCRYPTED FILE-----
            YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IHNzaC1lZDI1NTE5IDk1NDQzZyBuYnhk
            djVoS2F4dHZMUE9LUE5xb3htamVDTnpoTVBPN05BOEZheFJ6a3hJCk1tZ0JoMlhJ
            WWdrVEViUC91VXk3emVETUdSV2tDcHd5dTlKYlJjWGhxcm8KLS0tIFlaczBRRXVQ
            emtZZlUvdEFhU29YSnc3dHNOWHdlamtORCtwN0wxdGQ2ekUKNYpnUt83rFILe/A2
            RiXGYQoDTj3NF6t5szFWeCWXftWZFmsLBhQ59PDpfnrk+cHWXILhxIifrJjlDoHh
            9+i8Yw==
            -----END AGE ENCRYPTED FILE-----
    lastmodified: "2026-05-08T15:21:51Z"
    mac: ENC[AES256_GCM,data:o7aa6vz7qAkS93XPK9adlT5b5382n5c1egTGGft847mYkCM6A2TAOQhMdcrHsN90aY7f64rglt0LaKFrUBOAh8hN04cSvNLykJ7iYYFq+rnADt3HQbjyVcYcZKTeMJ+797Uus26CW24reFENTtqum6VeL1FU78bVEh6/eS03V0E=,iv:Z2w4RbPC4c16VvxAPi4kydR+cNoEkKr4KsXoKHjn+OY=,tag:i+2eSHAscqBvHdZI9T250A==,type:str]
    unencrypted_suffix: _unencrypted
    version: 3.12.2
```

This is totally normal, and you can use the same command as you used before to
keep editing them.

Once the file is encrypted you will still need to introduce your config to it. sops-nix
ships a module that does the heavy lifting, so a typical config may look like:
look like:

```nix
{
  sops = {
    defaultSopsFile = ./secrets/shush.yaml;
    age.sshKeyPaths = [ "/etc/ssh/ssh_host_ed25519_key" ];

    secrets."hello" = {
      owner = "isabel";
      group = "users";
      mode = "0400";
    };
  };
}
```

At activation time sops-nix decrypts the file using the host's SSH key and
drops the plaintext at `/run/secrets/<name>`, which is a tmpfs so the secret
never touches disk. Anything that needs the value just reads that path.

Another feature I lean on heavily is templates. This is particularly useful if
your config is shared between users or referenced by others. But there is still
use outside of that, for example if a service wants a config file that mixes
plain text with one or two secret values, you don't have to encrypt the whole
file:

```nix
{ config, ... }:
{
  sops.templates."mailserver.env".content = ''
    SMTP_USER=isabel
    SMTP_PASSWORD=${config.sops.placeholder."mailserver/smtp_password"}
  '';
}
```

## Agenix

Agenix is a takes a different approach from sops-nix making it feel a lot more
like nix since you configure all the secrets and who can access them through
the `secrets.nix` file. It is important to note that you can also configure
what keys have access to what secret. This file might look a little like so:

```nix title=secrets.nix
let
  isabel = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIL0idNvgGiucWgup/mP78zyC23uFjYq0evcWdjGQUaBH";
  host1 = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPJDyIr/FSz1cJdcoW69R+NrWzwGK/+3gJpqD1t8L2zE";
  host2 = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKzxQgondgEYcLpcPdJLrTdNgZ2gznOHCAxMdaceTUT1";
in
{
  "secret1.age".publicKeys = [ isabel host1 ];
  "secret2.age".publicKeys = [ isabel host2 ];
}
```

From this point you will have to add the `secret1.age` and `secret2.age` files.
This should be done with the `agenix` cli, the command may look like `agenix -e
secret1.age`, this same command can be used later in order to edit the files.

Wiring agenix into a host looks fairly similar to sops-nix, but the surface area
is smaller because each secret is its own file:

```nix
{
  age.secrets.secret1 = {
    file = ./secrets/secret1.age;
    owner = "isabel";
    group = "users";
    mode = "0400";
  };
}
```

At boot the host's SSH key is used to decrypt each `.age` file into
`/run/agenix/<name>`, again on a tmpfs. The bit that catches most people out is
rekeying. Every time that you add a new host or rotate a key, every secret in
`secrets.nix` whose `publicKeys` list has changed will need to be re-encrypted.
The `agenix --rekey` command will do this for you, but it needs the *current*
private key for one of the recipients to read the existing ciphertext first. In
practice this means rekeying happens on the machine you trust most, not on the
new host you're trying to bring up.

## Using the filesystem

The cost of this method being that your config no longer fully describes your
machines, which is why I've never attempted to use this method. If you
reinstall, you have to remember to put every one of those files back in the
right place with the right ownership. It also makes it a total disaster when
doing recovery, which matters more than you'd think when you're rebuilding a
server at 2am.

The thing to avoid is `builtins.readFile "/var/lib/myservice/token"` or
similar. That reads the file at evaluation time and embeds the contents into
the nix store, which is world-readable and is exactly the failure mode the
intro warned about. Always pass the *path* to the service via options like
[services.*.environmentFiles](https://search.nixos.org/options?channel=unstable&query=services.*.environmentFiles).

For a single server or laptop this maybe fine. For anything you'd describe as a
fleet, or anything you want to be able to rebuild from scratch from just your
config, use sops-nix or agenix instead.

## The Battle between the big two

The main reason to use sops-nix is that you're packing as much data into one
file as possible, which has its own respective pros and cons. For me that
mostly meant that I could put a lot more of my mail server secrets into one
file rather than having them split up between 5 or so files like with agenix.

Agenix wins in terms of simplicity. There's no yaml schema to learn, no `.sops.yaml`
to keep in sync, and the `secrets.nix` file is just nix, so the same
`let ... in` bindings you already use for hosts and users work for keys.
The mental model is "one secret, one file, one list of recipients", and that
maps cleanly onto how I think about access control.

The honest answer is that both tools solve the problem and the difference at
this point is mostly ergonomics. If you're starting from scratch and you have
more than a couple of services that each want a bundle of related secrets,
sops-nix will scale better. If you're starting from scratch and you mostly have
a handful of standalone tokens, agenix will get you there with less ceremony.

It is also important to note at this current moment of time agenix is [**NOT**
post quantum safe](https://github.com/ryantm/agenix#threat-modelwarnings).
However, the same issue applies to sops-nix but not because of a limitation of
sops like agenix's limitation in the age cli. But rather due to sops-nix not
supporting Post-Quantum age keys
[sops-nix#885](https://github.com/Mic92/sops-nix/issues/885).

## Conclusion

After three years of cycling through every option on the list, the picture I've
landed on is roughly this:

- **sops-nix** is what I keep using on hosts as a powerful tool. And what I'd
  pick first for anything mail server shaped where I have more secrets than
  fingers and toes.
- **agenix** is what I reach for whenever someone asks me about secrets in a
  NixOS machine. It's the smallest amount of moving parts that still gives you
  proper key-per-host access control.
- **The filesystem** is fine for the one or two values per machine that genuinely
  shouldn't live in a repo, as long as you remember that you've made future-you
  responsible for putting them back.
- **Everything else on the original list**, private repos, git-crypt, plaintext
  in the nix config. I would **NOT** recommend ever.

If you're picking your first secrets tool, pick agenix, get comfortable with
the flow, and only graduate to sops-nix once you actually feel the pain of one
secret per file.
