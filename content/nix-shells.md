---
title: Dev dependencies
description: Nix is truly an enlightening experience
date: 07/06/2024
tags:
  - nix
---

## Introduction

Handling dependencies is hard to say the least. Issue after issue of missing and conflicting dependencies. And no good way to fix this util ~~Docker~~ Nix came along.

## Getting started

First we are going to create a basic file tree, such that you can understand how your system may look like.

```
.
├── default.nix
├── shell.nix
├── flake.lock
└── flake.nix
```

At first when seeing this tree you may think why are we polluting our root directory with all these files. But in this is a good way to help us write less Nix!

Now we are going to create a `flake.nix` file. This is pretty agnostic when it comes to what language your project is in by comparison to other files later on.

```nix
{
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";

  outputs = { self, nixpkgs }: {
    packages.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.callPackage ./default.nix {};

    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.callPackage ./shell.nix {};
  };
}
```

If you were lucky enough to have read my last blog post on [experimenting with nix](/blog/7), or you're a Nix wizard you may have noticed that there is a better way to do this, that being:

```nix
{
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      forAllSystems =
        function:
        nixpkgs.lib.genAttrs [
          "x86_64-linux"
          "x86_64-darwin"
          "aarch64-linux"
          "aarch64-darwin"
        ] (system: function nixpkgs.legacyPackages.${system});
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
  src = ./.; # The source of the package

  # The lock file of the package, this can be done in other ways
  # like cargoHash, we are not doing it in this case because this
  # is much simpler, especially if we have access to the lock file
  # in our source tree
  cargoLock.lockFile = ./Cargo.lock;

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

  nativeBuildInputs = [ pkg-config ];

  meta = {
    license = lib.licenses.mit;
    mainProgram = "kittysay";
  };
}
```

You may have noticed `buildInputs` and `nativeBuildInputs`, which contain the dependencies of the project. At a basic level `buildInputs` are the dependencies that are needed at runtime whilst `nativeBuildInputs` are the dependencies that are only needed during the build process.

These dependencies can be reused in our `shell.nix` file. We can do this like so:

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
mainPkg.overrideAttrs (oa: {
  nativeBuildInputs = [
    # Additional Rust tooling
    clippy
    rustfmt
    rust-analyzer
  ] ++ (oa.nativeBuildInputs or [ ]);
})
```

In this example we are adding additional Rust tooling to our shell. This is because those inputs are not there in our dependencies that we have defined in our `default.nix` file.

## But what if I don't want to have `default.nix` file?

Nix still has a solution for this — `pkgs.mkShell` or `pkgs.mkShellNoCC`. Your first question after seeing these is likely how are these two different? The difference is that `mkShell` includes a C compiler in the shell environment, whilst `mkShellNoCC` does not.

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

But what if you also need all the dependencies of another program? I've personally never needed this but you can do it like so:

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

### But what about the environment variables?

I see a number of people using `shellHook`, but I'd argue that this is wrong — ideally we should use `env`.

```nix
shellHook = ''
  export LD_LIBRARY_PATH=${"$LD_LIBRARY_PATH:${libglvnd}/lib";}
'';
```

```nix
env = {
  # Force linking to libEGL and libwayland-client
  RUSTFLAGS = "-lEGL -lwayland-client";
  LD_LIBRARY_PATH = lib.makeLibraryPath [ libglvnd ];
};
```

Comparing these two code snippets, `env` seems a lot cleaner and more readable.

## The cherry on top

[nix-direnv](https://github.com/nix-community/nix-direnv) is a tool that allows you to have a `.envrc` file in your project that will automatically load the nix shell when you enter the directory. This is a great way to make sure that you are always in the correct environment.

The files from before will not change but now the `.envrc` file will be added to the project, and this will contain something like so:

```sh
if has nix_direnv_version; then
  use flake
fi
```
