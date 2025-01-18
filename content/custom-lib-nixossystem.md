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

Before getting started I read into 3 main files in the nixpkgs repository:

- [flake.nix](https://github.com/NixOS/nixpkgs/blob/5223d4097bb2c9e89d133f61f898df611d5ea3ca/flake.nix)
- [nixos/lib/eval-config.nix](https://github.com/NixOS/nixpkgs/blob/5223d4097bb2c9e89d133f61f898df611d5ea3ca/nixos/lib/eval-config.nix)
- [lib/modules.nix](https://github.com/NixOS/nixpkgs/blob/5223d4097bb2c9e89d133f61f898df611d5ea3ca/lib/modules.nix)

These files may seem somewhat arbitrary, but they are listed in the order they
are called. The `flake.nix` file has our `lib.nixosSystem` function that calls
our `nixos/lib/eval-config.nix` file which is a light wrapper around our final
`lib/modules.nix`. So lets walk through those files in order and see what
exactly they do.

### `flake.nix`

This file contains our `lib.nixosSystem` function, which takes `args` as an
argument. The documentation lists a set of known arguments being `modules`,
`specialArgs` and `modulesLocation`, it also specifies some additional legacy
arguments `system` and `pkgs` both of which are now redundant.

The `lib.nixosSystem` then imports the `nixos/lib/eval-config.nix` file whilst
pass `lib`, and the remaining `args` to it. However, it also sets `system` to
`null` as well as adding `nixpkgs.flake.source` to nixpkgs output derivation,
to our set of modules.

### nixos/lib/eval-config.nix

This file immediately points us to the fact that it is a “light wrapper” around
`lib.evalModules`. This file has a large collection of arguments most of which
will be their defaults, a good example of this is `baseModules` which defaults
to a list of modules. The most important arguments from this file are
`specialArgs`, `lib` and `modules`. For the most part these come from the prior
`flake.nix` file. So we were well aware of these arguments, but now we know of a
lot more argument that could be passed to `lib.evalModules`.

As we read down the file we notice that there are two additional modules that
are going to be added these are the `pkgsModule` and the `modulesModle`. Pretty
strange names at first, but the `pkgsModule` will set `nixpkgs.system` if
`system` was not null, and will set `nixpkgs.pkgs` and `pkgs` is not null. The
`modulesModule` will add `config._module.args` to an attrset of
`noUserModules`, `baseModules`, `extraModules` and `modules`. So now we know
some of the arguments that are given to `lib.evalModules` lets see what that
does.

### lib/modules.nix

This is where `lib.evalModules` is defined which takes the `modules` and
`specialArgs` from before but also can take `class` which is a nominal type
which can make sure only compatible modules are imported! This will may become
really useful later. We don't need to analyze too much into this since we will
be calling this function later.

## The implementation

Now that we have our key inputs of `class`, `modules` and `specialArgs` we can start implementing our own `lib.nixosSystem`.

### Getting the basics

To use the code below you would need something like this `mkSystem = import ./file.nix { inherit inputs; }`.

```nix
{
  inputs,
  # we are somewhat assuming we have nixpkgs as a input
  # but its a pretty safe assumption, and lets get lib from it
  lib ? inputs.nixpkgs.lib,
  ...
}:
{
  # lets make sure to add some defaults such that everything doesn't go wrong
  # if we don't get any arguments from the user
  modules ? [ ],
  specialArgs ? { },
  class ? null,
}: lib.evalModules {
  inherit modules specialArgs class;
}
```

And awesome! We have a very bare bone `mkSystem` function. However, this is
far from a finished product. So let's start adding some more features so that
we can actually use it as a replacement for `lib.nixosSystem`. Let's start with
`modulesPath`, most people probably recognize this from when they installed nix
and read their `hardware-configuration.nix` file and saw something along the
lines of `modulesPath + /installer/scan/not-detected.nix`.

### Adding `modulesPath`

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
{
  modules ? [ ],
  specialArgs ? { },
  class ? null,
}: let
  modulesPath = "${inputs.nixpkgs}/nixos/modules";
in
lib.evalModules {
  inherit modules class;

  # here we are merging the user provided specialArgs with the modulesPath
  specialArgs = { inherit modulesPath; } // specialArgs;
}
```

The key fact here is that we included `modulesPath` in our `specialArgs`. We
only use `specialArgs` because we need to resolve module paths and `specialArgs`
should only be used with arguments that need to be evaluated when resolving
module structure.

But just adding `modulePath` is a bit useless, we can't exactly replace our
`lib.nixosSystem`'s yet. So let's work on that. To do that we are going to start
importing `baseModules`, this will provide us with a base set of modules from
nixpkgs.

### So close and yet so far

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
{
  modules ? [ ],
  specialArgs ? { },
  class ? null,
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

We now have a *mostly* functional `mySystem` function. That depending on your
configuration may actually work! But that's not enough. Let's make it work as
well as we can to be a proper replacement. To do so we are going to have to go
back to the `modulesModule` from earlier, we need this such that some nixpkgs
modules will work, one of these is the [documentation
module](https://github.com/NixOS/nixpkgs/blob/48f79c1d5168ce8e9b21a790be523c9a8f60046c/nixos/modules/misc/documentation.nix#L1)
which will be a bit of a hard module to ignore, when so many people use it.

### It actually works?

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
{
  modules ? [ ],
  specialArgs ? { },
  class ? null,
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

Even better, now we have completely replaced `lib.nixosSystem` with our own
`mkSystem` function. But let's be real. That's not enough for us. We should
start abstracting some common themes between our systems. Some big examples of
this are `networking.hostName` and `nixpkgs.hostPlatform`. And while were at it
lets also re-add the `nixpkgs.flake.source` from the original `lib.nixoSystem`,
as well as adding `inputs` as a special arg since most people do that anyway,
I think it's a safe assumption we would want it.

### Adding some of our own modules

```nix
{
  inputs,
  lib ? inputs.nixpkgs.lib,
  ...
}:
# why are we adding `name` here? instead of in the args below?
# well you could do either, but I thought it would be nice for `mapAttrs` or
# similar, but its totally up to you reader
name:
{
  modules ? [ ],
  specialArgs ? { },
  class ? null,
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

Notice how the new argument `name` was added to account for our hostname. Also
notice how I lied about settings `nixpkgs.hostPlatform`, if your curious why maybe you
should read [my last blog post about it](https://isabelroses.com/blog/im-not-mad-im-disapointed-10).

### The original issue, Darwin!

But now lets address what I originally came for. Adding `lib.darwinSystem` support for this too.

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
  class ? null,
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

The biggest change was that we are now using `class` to determine if we have a
Darwin system or not. You may also notice that Darwin has a different set of
modules which introduced some new options to set for this system type. This
includes `nixpkgs.source` and `darwinVersionSuffix` and `darwinRevision`. Some
of these are for commands like `darwin-version`. You may also notice that we
had to add `system = eval.config.system.build.toplevel` back into the final
eval produced by our Darwin eval. This is needed so we can actually swap to the
configuration, otherwise it won't work at all.

### The final touch

The final and maybe the best bit is adding `inputs'`. For those who are unaware
of flake-parts, you probably are not aware of the greatness that is `inputs'`.
The diff below shows the advantage of using `inputs'` over `inputs` for
accessing packages.

```diff
- inputs.input-name.packages.${pkgs.stdenv.hostPlatform.system}.package-name
+ inputs'.input-name.packages.package-name
```

So to add that we can do the following:

```nix
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
  class ? null,
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

Is that not awesome? What the added code does is map over all inputs, and then
their outputs and will make a select the output dependent on the host platform.
If there is a system dependent output for that output, otherwise it will leave
it as is.

```nix
inputs' = lib.mapAttrs (_: lib.mapAttrs (_: v: v.${config.nixpkgs.hostPlatform} or v)) inputs;
```

If you are using flake-parts, you may prefer using the following code instead:

```nix
withSystem config.nixpkgs.hostPlatform ({ inputs', ... }: { inherit inputs'; });
```

And that's it! We have a fully functional `mkSystem` function that can replace
both `lib.nixosSystem` and `lib.darwinSystem`.

## Conclusion

This was quite the task, and although this blog post seems to reduce the quite
simple. I've spent a lot of time on this, both when researching how to create
the custom builder and writing and maintaining the latest rendition in the form
of a flake module called
[easy-hosts](https://github.com/isabelroses/easy-hosts). If you enjoyed this
post, please consider donating on [ko-fi](https://ko-fi.com/isabelroses) or
[github sponsors](https://github.com/sponsors/isabelroses).
