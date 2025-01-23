---
title: My custom lib.nixosSystem
description: How I came to write my own lib.nixosSystem
date: 09/01/2025
tags:
  - learning
  - nix
---

## Introduction

I've been using NixOS for a while now, and my biggest issue was that I have a
lot of [systems](https://github.com/isabelroses/dotfiles/tree/main/systems) on
my [flake](https://github.com/isabelroses/dotfiles). Which leads to having a
lot of different hardware and therefore modules that are needed for said
hardware. The normal solution would be to use the module system, but a new
issue arises when we add [nix-darwin](https://github.com/LnL7/nix-darwin). We
suddenly start to fail eval over issues because some modules don't exist that
are in the normal NixOS module system. So my new issue is that I can no longer
use my small abstraction over
[`lib.nixosSystem`](https://github.com/NixOS/nixpkgs/blob/5223d4097bb2c9e89d133f61f898df611d5ea3ca/flake.nix#L57-L79).
I would have to expand the abstraction to include
[`lib.darwinSystem`](https://github.com/LnL7/nix-darwin/blob/87131f51f8256952d1a306b5521cedc2dc61aa08/flake.nix#L21-L51)
since I can no longer unconditionally import all modules I use if they don't
exist in nix-darwin? But what if I don't want to do that? What if I want to
write my own `lib.nixosSystem` or my own `lib.darwinSystem`? What if I call it
[`mkSystem`](https://github.com/isabelroses/dotfiles/blob/24588b2101c0fb2a8587df377a670e9e4cc47b42/parts/lib/builders.nix#L17).
Well that's exactly what I did. And this article covers how I got to that point
and how my custom “builder” later evolved into
[easy-hosts](https://github.com/isabelroses/easy-hosts).

## The research

Before getting started we need to read into 4 main files in the nixpkgs repository:

- [flake.nix](https://github.com/NixOS/nixpkgs/blob/5223d4097bb2c9e89d133f61f898df611d5ea3ca/flake.nix)
- [nixos/lib/eval-config.nix](https://github.com/NixOS/nixpkgs/blob/5223d4097bb2c9e89d133f61f898df611d5ea3ca/nixos/lib/eval-config.nix)
- [nixos/lib/eval-config-minimal.nix](https://github.com/NixOS/nixpkgs/blob/5223d4097bb2c9e89d133f61f898df611d5ea3ca/nixos/lib/eval-config-minimal.nix)
- [lib/modules.nix](https://github.com/NixOS/nixpkgs/blob/5223d4097bb2c9e89d133f61f898df611d5ea3ca/lib/modules.nix)

These files may seem somewhat arbitrary, but they are listed in the order they
are called. The `flake.nix` file has our `lib.nixosSystem` function that calls
our `nixos/lib/eval-config.nix` file which is a light wrapper around our final
`lib/modules.nix`. So lets walk through those files in order and see what
exactly they do.

### `flake.nix`

This file contains our `lib.nixosSystem` function, which takes `args` as an
argument. The
[documentation](https://github.com/NixOS/nixpkgs/blob/b78b5ce3b29c147e193633659a0ea9bf97f6c0c0/flake.nix#L44)
lists a set of known arguments being `modules`, `specialArgs` and
`modulesLocation`, it also specifies some additional legacy arguments `system`
and `pkgs` both of which are now redundant.

The `lib.nixosSystem` then imports the `nixos/lib/eval-config.nix` file whilst
passing `lib`, and the remaining `args` to it. However, it also sets `system` to
`null` as well as adding `nixpkgs.flake.source` to nixpkgs output derivation,
to our set of modules.

### nixos/lib/eval-config.nix

This file immediately points us to the fact that it is a “light wrapper” around
`lib.evalModules`. This file also has a large collection of arguments most of
which will be the defaults. A good example of this is `baseModules` which
defaults to a list of modules from the nixpkgs repo. The most important
arguments from this file are `specialArgs`, `lib` and `modules`. For the
most part these come from the prior `flake.nix` file.

As we read down the file we notice that there are two additional modules that
are going to be added. These are the `pkgsModule` and the `modulesModule`.
These appear to be pretty strange names at first, but the `pkgsModule` will
set `nixpkgs.system` if `system` was not null, and will set
`nixpkgs.pkgs` if `pkgs` is not null. The `modulesModule` will add
`config._module.args` as an attrset of `noUserModules`, `baseModules`,
`extraModules` and `modules`. So now we know some of the arguments that are
given to `lib.evalModules` lets see what that does.

### nixos/lib/eval-config-minimal.nix

This file is a small wrapper upon `lib.evalModules`, but it gives us a little
bit of guidance on how to use the `class` argument. As well as showing us the
default for `modulePath` which is going to be passed as a special arg.

### lib/modules.nix

This is where `lib.evalModules` is defined which takes the `modules` and
`specialArgs` from before. It also takes the `class` arugment, which is a
nominal type, which ensures that only compatible modules are imported. This
may become really useful later. We do not need to analyze too much into
this, since we will be calling this function later.

## The implementation

Now that we have our key inputs of `class`, `modules` and `specialArgs` we can
start implementing our own `lib.nixosSystem`.

### Getting the basics

Let us start in our very own `flake.nix` by writing the following code. This
will give us a basic template to work with and you, the reader, knows how to
start.

```nix
{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = inputs: let
    mkSystem = import ./mksystem.nix { inherit inputs; };
  in {
    nixosConfigurations = {
      mySystem = mkSystem { };
    };
  };
}
```

Now that we have a very bare bone `flake.nix` we can get started on the
`mkSystem` function. Let's also create the `mksystem.nix` file. We are going to
add some basic args that we know we are going to need later such as `modules`,
`specialArgs` and `class`. And we are going to add some defaults to these args
such that we don't get any errors if they are not provided.

```nix
{
  inputs ? throw "No inputs provided",
  lib ? inputs.nixpkgs.lib,
  ...
}:
{
  modules ? [ ],
  specialArgs ? { },
  class ? "nixos",
}: lib.evalModules {
  inherit modules specialArgs class;
}
```

### Adding `modulesPath`

Now that we have our basic template down. Let's start by adding the
`modulesPath`, most people probably recognize this from when they first
installed nix and read their `hardware-configuration.nix` file and saw
something along the lines of `modulesPath + /installer/scan/not-detected.nix`.
That is why we are starting with this, so that our `hardware-configuration.nix`
will work.

The key to this is going to be including `modulesPath` in our `specialArgs`.
This is because `specialArgs` should only be used with arguments that need to
be evaluated when resolving module structure.

########## continute herheeh thatnks pookie ############

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
{
  modules ? [ ],
  specialArgs ? { },
  class ? "nixos",
}: let
  modulesPath = "${inputs.nixpkgs}/nixos/modules";
in
lib.evalModules {
  inherit modules class;

  # here we are merging the user provided specialArgs with the modulesPath
  specialArgs = { inherit modulesPath; } // specialArgs;
}
```

### So close and yet so far

But just adding `modulePath` is a bit useless, we can't exactly replace our
`lib.nixosSystem`'s yet. So let's work on that. To do that we are going to start
importing `baseModules`, this will provide us with a base set of modules from
nixpkgs. To do this we can use the `modulePath` and get the module list from
there since this will prepare us for later when we want to add Darwin support.

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
{
  modules ? [ ],
  specialArgs ? { },
  class ? "nixos",
}: let
  modulesPath = "${inputs.nixpkgs}/nixos/modules";

  baseModules = import "${modulesPath}/module-list.nix";
in
lib.evalModules {
  inherit class;

  specialArgs = { inherit modulesPath; } // specialArgs;

  modules = baseModules ++ modules;
}
```

### It actually works?

We now have a *mostly* functional replacement. Depending on your configuration
may actually work as it is now! To keep progressing we are going to have to go
back to the `modulesModule` from [earlier](#nixos/lib/eval-config.nix). we need this such that some nixpkgs
modules will work, one of these is the [documentation module](https://github.com/NixOS/nixpkgs/blob/48f79c1d5168ce8e9b21a790be523c9a8f60046c/nixos/modules/misc/documentation.nix#L1)
which will be a hard module to ignore, when so many people use it.

So what we are going to introduce a new module which contains
`config._module.args` which takes a set of attrs that will be passed to each
module. I'm sure most of you reckoginse these when writing a module and adding
`{ pkgs, config, ... }` to the top of a file. These should be used by arguments
that don't need to resolve module stucute since thats the exact reason we have
`specialArgs`.

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
{
  modules ? [ ],
  specialArgs ? { },
  class ? "nixos",
}: let
  modulesPath = "${inputs.nixpkgs}/nixos/modules";

  baseModules = import "${modulesPath}/module-list.nix";
in
lib.evalModules {
  inherit class;

  specialArgs = { inherit modulesPath; } // specialArgs;

  modules = baseModules ++ modules ++ [
    {
      config._module.args = {
        inherit baseModules modules;
      };
    }
  ];
}
```

### Adding some of our own modules

Even better, now we have completely replaced `lib.nixosSystem` with our own
`mkSystem` function. But let's be real. That's not enough for us. We should
start abstracting some common themes between our systems. Some big examples of
this are `networking.hostName` and `nixpkgs.hostPlatform`. And while were at it
lets also re-add the `nixpkgs.flake.source` from the original `lib.nixoSystem`,
as well as adding `inputs` as a special arg. As most people do this anyway,
I think it's a safe assumption we should add it. For futher reading about
passing inputs to modules check [nobbz's blog on getting inputs to flake modules](https://blog.nobbz.dev/2022-12-12-getting-inputs-to-modules-in-a-flake/).

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
name:
{
  modules ? [ ],
  specialArgs ? { },
  class ? "nixos",
}: let
  modulesPath = "${inputs.nixpkgs}/nixos/modules";

  baseModules = import "${modulesPath}/module-list.nix";
in
lib.evalModules {
  inherit class;

  specialArgs = { inherit inputs modulesPath; } // specialArgs;

  modules = baseModules ++ modules ++ [
    {
      config. = {
        _module.args = {
          inherit baseModules modules;
        };

        networking.hostName = name;

        nixpkgs.flake.source = inputs.nixpkgs.outPath;
      };
    }
  ];
}
```

I just added `name` as an additional argument to our `mkSystem` function. This
allows us to set the hostname of our system. The way I opted to write it allows
for us to use `mapAttrs` on our `nixosConfigurations`. This will mean that we
need to change how the original `flake.nix` works though.

```nix
{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = inputs: let
    mkSystem = import ./mksystem.nix { inherit inputs; };
  in {
    nixosConfigurations = builtins.mapAttrs mkSystem {
      mySystem = { };
    };
  };
}
```

Furthermore notice how I lied about settings `nixpkgs.hostPlatform`, if your curious why maybe you
should read [my last blog post about it](https://isabelroses.com/blog/im-not-mad-im-disapointed-10). (Shameless plug)

### The original issue, Darwin!

But now lets address what I originally came for. Adding `lib.darwinSystem`
support for this too.

To introduce Darwin support we are going to allow users to set the `class`
argument to `darwin` from there we can determine what modules to import.
As a result of this you may notice that Darwin has a different set of
modules which introduced some new options to set for this system type. This
includes `nixpkgs.source` and `darwinVersionSuffix` and `darwinRevision`. Some
of these are for commands like `darwin-version`. You may also notice that we
had to add `system = eval.config.system.build.toplevel` back into the final
eval produced by our Darwin eval. This is needed so we can actually swap to the
configuration, otherwise it won't work at all.

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
name:
{
  modules ? [ ],
  specialArgs ? { },
  class ? "nixos",
}: let
  # this is new? what is it?
  # I'm glad you asked, this is a nice way of checking if we have our darwin and nixpkgs inputs
  nixpkgs = inputs.nixpkgs or (throw "No nixpkgs input found");
  darwin = inputs.darwin or inputs.nix-darwin or (throw "No nix-darwin input found");

  modulesPath = if class == "darwin" then "${darwin}/modules" else "${nixpkgs}/nixos/modules";

  baseModules = import "${modulesPath}/module-list.nix";

  eval = lib.evalModules {
    inherit class;

    specialArgs = { inherit inputs modulesPath; } // specialArgs;

    modules = baseModules ++ modules ++ [
      {
        config. = {
          _module.args = {
            inherit baseModules modules;
          };

          networking.hostName = name;

          nixpkgs.flake.source = nixpkgs.outPath;
        };
      }
    ] ++ lib.optionals (class == "darwin") [
      {
        config = {
          nixpkgs.source = nixpkgs.outPath;

          system = {
            checks.verifyNixPath = false;

            darwinVersionSuffix = ".${darwin.shortRev or darwin.dirtyShortRev or "dirty"}";
            darwinRevision = darwin.rev or darwin.dirtyRev or "dirty";
          };
        };
      }
    ];
  };
in
  if class == "darwin" then (eval // { system = eval.config.system.build.toplevel; }) else eval;
```

### The final touch

The final and maybe the best bit is adding `inputs'`. For those who are unaware
of flake-parts, you probably are not aware of the greatness that is `inputs'`.
The diff below shows the advantage of using `inputs'` over `inputs` for
accessing packages.

```diff
- inputs.input-name.packages.${pkgs.stdenv.hostPlatform.system}.package-name
+ inputs'.input-name.packages.package-name
```

Is that not awesome? So how can we replicate that for ourselves?

What we will need to do is map over all inputs, and their outputs and select
the output dependent on the host platform, if a system dependent output exists,
otherwise it will leave it as is. We can acchive that with the following code:

```nix
inputs' = lib.mapAttrs (_: lib.mapAttrs (_: v: v.${config.nixpkgs.hostPlatform} or v)) inputs;
```

Or if you are using flake-parts, you may prefer using the following code instead:

```nix
withSystem config.nixpkgs.hostPlatform ({ inputs', ... }: { inherit inputs'; });
```

So let's add that to our `mkSystem` function.

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
name:
{
  modules ? [ ],
  specialArgs ? { },
  class ? "nixos",
}: let
  nixpkgs = inputs.nixpkgs or (throw "No nixpkgs input found");
  darwin = inputs.darwin or inputs.nix-darwin or (throw "No nix-darwin input found");

  modulesPath = if class == "darwin" then "${darwin}/modules" else "${nixpkgs}/nixos/modules";

  baseModules = import "${modulesPath}/module-list.nix";

  eval = lib.evalModules {
    inherit class;

    specialArgs = { inherit inputs modulesPath; } // specialArgs;

    modules = baseModules ++ modules ++ [
      ({ config, ... }: {
        config = {
          _module.args = {
            inherit baseModules modules;

            inputs' = lib.mapAttrs (_: lib.mapAttrs (_: v: v.${config.nixpkgs.hostPlatform} or v)) inputs;
          };

          networking.hostName = name;

          nixpkgs.flake.source = nixpkgs.outPath;
        };
      })
    ] ++ lib.optionals (class == "darwin") [
      {
        config = {
          nixpkgs.source = nixpkgs.outPath;

          system = {
            checks.verifyNixPath = false;

            darwinVersionSuffix = ".${darwin.shortRev or darwin.dirtyShortRev or "dirty"}";
            darwinRevision = darwin.rev or darwin.dirtyRev or "dirty";
          };
        };
      }
    ];
  };
in
  if class == "darwin" then (eval // { system = eval.config.system.build.toplevel; }) else eval;
```

Now techincally if we wanted we could remove `inputs` and move `inputs'`,
renaming it to `inputs` and making it a specialArg. Since they will function
virtually the same way but with reduced code.

## Conclusion

And that's it! We have a fully functional `mkSystem` function that can replace
both `lib.nixosSystem` and `lib.darwinSystem`. This was quite the task, and
although this blog post seems to reduce the quite simple. I've spent a lot of
time on this, both when researching how to create the custom builder and
writing and maintaining the latest rendition in the form of a flake module
called [easy-hosts](https://github.com/isabelroses/easy-hosts). If you enjoyed
this post, please consider donating on [ko-fi](https://ko-fi.com/isabelroses)
or [github sponsors](https://github.com/sponsors/isabelroses).
