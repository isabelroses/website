---
title: Dev dependencies
description: Nix is truly an enlightening experience
date: 07/06/2024
tags:
  - nix
---

## Introduction

Handling dependencies is hard to say the least. Issue after issue of missing and conflicting dependencies. And no good way to fix this util ~~Docker~~ Nix came along. This blog post will go over the start to end of getting a solid nix dev entiroment setup for all your projects.

## Getting started

First we are going to create a basic file tree, such that you can understand how your system may look like.

```sh
.
├── default.nix
├── shell.nix
├── flake.lock
└── flake.nix
```

At first when seeing this tree you may think why are we polluting our root directory with all these files. But in this is a good way to help us write less Nix!

Now, we're going to create a flake.nix file. Unlike some other files mentioned later in this post, it's quite agnostic about the language of your project. Since I won't be explaining this part in detail, I recommend you read my previous blog post [experimenting with nix](/blog/7).

```nix
{
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      forAllSystems =
        function:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
          system: function nixpkgs.legacyPackages.${system}
        );
    in
    {
      packages = forAllSystems (pkgs: {
        default = pkgs.callPackage ./default.nix { };
      });

      devShells = forAllSystems (pkgs: {
        default = pkgs.callPackage ./shell.nix { };
      });
    };
}
```

Now we have something more useable for our `flake.nix` file we can now start making our `default.nix` file and `shell.nix` files.

We are going to start with the `default.nix` file for a basic Rust project. We start with the `default.nix` file to identify the dependencies of our project, which is particularly easy to do with Nix since the build system is isolated.

```nix
{
  lib,
  darwin,
  stdenv,
  openssl,
  pkg-config,
  rustPlatform,
}:
rustPlatform.buildRustPackage {
  pname = "kittysay"; # The name of the package
  version = "0.5.2"; # The version of the package

  # You can use lib here to make a more accurate source
  # this can be nice to reduce the amount of rebuilds
  # but thats out of scope for this post
  src = ./.; # The source of the package

  # The lock file of the package, this can be done in other ways
  # like cargoHash, we are not doing it in this case because this
  # is much simpler, especially if we have access to the lock file
  # in our source tree
  cargoLock.lockFile = ./Cargo.lock;

  # The runtime dependencies of the package
  buildInputs =
    [ openssl ]
    ++ lib.optionals stdenv.isDarwin (
      with darwin.apple_sdk.frameworks;
      [
        Security
        CoreFoundation
        SystemConfiguration
      ]
    );

  # programs and libraries used at build-time that, if they are a compiler or
  # similar tool, produce code to run at run-time—i.e. tools used to build the new derivation
  nativeBuildInputs = [ pkg-config ];

  meta = {
    license = lib.licenses.mit;
    mainProgram = "kittysay";
  };
}
```

You may have noticed `buildInputs` and `nativeBuildInputs`, which contain the dependencies of the project. At a basic level `buildInputs` are the dependencies that are needed at runtime whilst `nativeBuildInputs` are the dependencies that are only needed during the build process. So why does that matter?

Well these dependencies can be reused in our `shell.nix` file, we can do this like so:

```nix
{
  clippy,
  rustfmt,
  callPackage,
  rust-analyzer,
}:
let
  mainPkg = callPackage ./default.nix { };
in
mainPkg.overrideAttrs (prev: {
  nativeBuildInputs = [
    # Additional Rust tooling
    clippy
    rustfmt
    rust-analyzer
  ] ++ (prev.nativeBuildInputs or [ ]);
})
```

In this example we are adding additional Rust tooling to our shell. This is because those inputs are not there in our dependencies that we have defined in our `default.nix` file.

## But what if I don't want to have `default.nix` file?

Nix still has a solution for this — `pkgs.mkShell`.

```nix
{
  clippy,
  mkShell,
  rustfmt,
  rust-analyzer,
}:
mkShell {
  packages = [
    clippy
    rustfmt
    rust-analyzer
  ];
}
```

What if you also require all the dependencies of another program? I've personally never needed this, but you can do it like so:

```nix
{
  mkShell,
  rust-analyzer,
}:
mkShell {
  inputsFrom = [
    rust-analyzer
  ];
}
```

Now you have a shell with all the dependencies of `rust-analyzer` and any other dependencies you have defined in your `shell.nix` file.

## Some common misconceptions

### Should I use `nativeBuildInputs` or `buildInputs`?

Well in this case it doesn't matter! All packages that are put into the `mkShell` will be merged into one attribute, and will all be available to the end user. So really the best thing to do here is use `packages` since it's documented and therefore a good practice.

If you would like proof they get merged into the one attribute here is the [source](https://github.com/NixOS/nixpkgs/blob/88130cec79267ea323ed7a31e60affbd9ca0cc3d/pkgs/build-support/mkshell/default.nix#L17-24):

```nix
mergeInputs = name:
  (attrs.${name} or [ ]) ++
  # 1. get all `{build,nativeBuild,...}Inputs` from the elements of `inputsFrom`
  # 2. since that is a list of lists, `flatten` that into a regular list
  # 3. filter out of the result everything that's in `inputsFrom` itself
  # this leaves actual dependencies of the derivations in `inputsFrom`, but never the derivations themselves
  (lib.subtractLists inputsFrom (lib.flatten (lib.catAttrs name inputsFrom)));
```

### How about the environment variables?

I see a number of people using `shellHook`, but I'd argue that this is wrong — ideally we should use `env`. But not for any technical reason, since they fundamentally do the same thing and env is converted into a shellHook, but rather for readability.

1. The worst way:

```nix
shellHook = ''
  export RUSTFLAGS="-lEGL -lwayland-client"
  export LD_LIBRARY_PATH=${"$LD_LIBRARY_PATH:${libglvnd}/lib";}
'';
```

2. A bit better:

```nix
RUSTFLAGS = "-lEGL -lwayland-client";
LD_LIBRARY_PATH = lib.makeLibraryPath [ libglvnd ];
```

3. The best way:

```nix
env = {
  RUSTFLAGS = "-lEGL -lwayland-client";
  LD_LIBRARY_PATH = lib.makeLibraryPath [ libglvnd ];
};
```

After reading all three of these example, I hope you understand why I personally prefer the third example. Since its clear that its exporting environment variables, and it's also clear what the environment variables are or will be. It should also be noted that as of release 24.05 the recommended manor of exporting environment variables in a shell is example 2, but uses mixes between example 1 and 2.

### But you didn't mention `pkgs.mkShellNoCC`?

The diffrence between difference these two is that `mkShell` includes a C compiler in the shell environment, whilst `mkShellNoCC` does not. So in a situation where you know you won't need any C compiler or related technogies its better to use `pkgs.mkShellNoCC`.

### How about using my overlay?

My personal favorite has to be [oxalica/rust-overlay](https://github.com/oxalica/rust-overlay), so that is what we are going to use in this example. I heavily advice mainly using the flake to get reproducable outputs.

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs =
    { nixpkgs, rust-overlay, ... }:
    let
      forAllSystems =
        function:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
          system: let
            overlays = [ (import rust-overlay) ];
            pkgs = import nixpkgs { inherit system overlays; };
          in
            function pkgs;
        );
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            rust-bin.stable.latest.minimal
          ];
        };
      });
    };
}
```

But you didn't include a shell.nix that time? I know thats beacuse I want to keep this as reproducable as possible and that beacomes difficult with overlays and staying backwards compatable. The below example shows how you could do this though its not exactly pretty.

```nix
(import <nixpkgs> {
  overlays = [ (import (builtins.fetchTarball "https://github.com/oxalica/rust-overlay/archive/master.tar.gz")) ];
}).callPackage (
{ mkShell, rust-bin }:
mkShell {
  packages = [
    rust-bin.stable.latest.minimal
  ];
}) {}
```

## The cherry on top

### direnv

[nix-direnv](https://github.com/nix-community/nix-direnv) is a tool that allows you to have a `.envrc` file in your project that will automatically load the nix shell when you enter the directory. This is a great way to make sure that you are always in the correct environment.

The files from before will not change but now the `.envrc` file will be added to the project, and this will contain something like so:

```bash
if has nix_direnv_version; then
  use flake
fi
```

### Templates

Nix allows you to create reproducable templates for your project, so you only have to set these up one time and then you can reuse them for all your projects.

For example you can use my templates like so `nix flake init -t github:isabelroses/dotfiles#go` which will create a new go project in your current directory, or you can use `nix flake new -t github:isabelroses/dotfiles#rust cheese` which will create a new directory called `cheese` with the rust template defined [here](https://github.com/isabelroses/dotfiles/tree/main/parts/templates/rust).

Here we will create a quick example for a basic flake, but you can do this with littrally anything you want.

First lets define what our tree will look like as we did before:

```bash
.
├── flake.nix
└── comfy
    ├── default.nix
    ├── shell.nix
    └── flake.nix
```

Now lets define our `flake.nix`:

```nix
{
  outputs = _: {
    templates = {
      comfy = {
        path = ./comfy;
        description = "A comfy template";
      };
    };
  };
}
```

You may have notice that we are not taking any inputs and are only producing outputs and thats beacuse we don't need a package set here. Then our `comfy/*` files will look like the ones we defined at the beginning of this post.

## Wrapping up

Nix is a great tool for managing dependencies, and I hope this post has helped you understand how to use it in your projects. If you have any futher questions feel free to [email me](mailto:isabel@isabelroses.com) or join [my discord server](https://discord.gg/8RVhHeJH3x). Thanks for reading!!! And If you really enjoyed the post please consider donating so I can keep doing this kind of thing on [kofi](https://ko-fi.com/isabelroses) or [GitHub Sponsers](https://github.com/sponsors/isabelroses).
