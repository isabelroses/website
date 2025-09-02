---
title: Experimenting with Nix
description: A little bit of fun with Nix
date: 2024-05-25
tags:
  - learning
  - nix
---

## Introduction

My latest addiction is [Nix](https://nixos.org).

Those who have read my previous posts have probably noticed that I have made a few references to it here and there but nothing too deep, that is until now.

This article is going to detail some of the oddities and tips I have learned along the way. Just a fair warning, I am still learning and nix is ever-growing so some of these details may not be the same tomorrow or the next day. Also its a complete mess of hundreds of ideas that I have so prepare yourself.

## shell.nix the file I have everywhere

I don't have **any** dev programs permanently installed on my system, I have a `shell.nix` file in every project that I work on. This file contains all the dependencies that I need to work on that project. This is a great way to keep your system clean and to keep your dependencies in check.

```nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    go
    gopls
  ];
}
```

## Easy things that are not so easy

Recently I undertook the task of [removing all unused occurrences of the `fetchFromGitHub` argument](https://github.com/NixOS/nixpkgs/pull/314910), at the time this was about 64 items, though I only removed 57. But here is why, some files like zig for example contain a `generic.nix` file which has commonalities between all the zig files so to reduce the work here they import that file. And to do that they need to pass `fetchFromGitHub` otherwise, you will error out. This is unexpected since [`deadnix`](https://github.com/astro/deadnix) cannot detect these the import like that. Oh and for anyone curious what kind of monstrosity of a command made this easy:

```bash
deadnix pkgs -o json |
  jq -n 'select(.results[].message == "Unused lambda pattern: fetchFromGitHub") | .file' |
  args -i nvim {}
```

## NURs

I have never understood the point of NURs, they often ship outdated nixpkgs, and don't offer much more than putting the package on nixpkgs instead. I will be the first to admit I have my repo reminiscent of a NUR but it's not the same, that repo ships nightly packages because occasionally I want nightly packages for my programs and these should be consumed as an overlay.

### Pinning packages

This feels somewhat of an extension to NURs since most of my packages are pins of specific working commits. You can achieve this with fetchers like `fetchFromGitHub` but my personal favorite is npins (and occasionally nvfetcher) since you can run git versions of a package. Then you can override the source with something reminiscent of this:

```nix
_: prev: {
  catppuccin-gtk = prev.callPackage (args:
    (prev.catppuccin-gtk.override args).overrideAttrs (attrs: {
      src = pins.catppuccin-gtk;
    })
  ) {};
}
```

```rust
fn expand_on_this_in_another_post() {
  todo!(); # yes this is a bad rust joke
}
```

## Lib

The `lib` or library is a collection of expressions that are commonly used in nix because of this they are official and stable.

### forAllSystems

This is not a part of the official `lib` but is featured in the official [nix templates repo](https://github.com/NixOS/templates/blob/c57ac1ea60ef97bdce2f13e12b849f0ca5eaffe9/go-hello/flake.nix#L20) though maybe not in this exact format. What this does is provide an output for all of the system types that are in the list, this is important for packages that can work on multiple systems since it helps you prevent repeating the same code several times.

```nix
forAllSystems =
  function:
  nixpkgs.lib.genAttrs [
    "x86_64-Linux"
    "aarch64-Linux"
    "x86_64-darwin"
    "aarch64-darwin"
  ] (system: function nixpkgs.legacyPackages.${system});
```

### lib. filesystem.packagesFromDirectoryRecursive

One of my current favorites has to be `lib.filesystem.packagesFromDirectoryRecursive` or its alias `lib.packagesFromDirectoryRecursive`. This function allows you to generate an attrset of your packages from a given directory. Perhaps the best thing about this lib expression is how well-documented it is. Or perhaps it is flexible.
I recently used this to generate a collection of packages you can find them on my GitHub repo [isabelroses/beapkgs](https://github.com/isabelroses/beapkgs). In this case, I needed to `callPackage` with `npins` such that all packages would have access to their source. And guess what this is double the learning opportunity since we can use the previously stated `forAllSystems`.

```nix
packages = forAllSystems (
  pkgs:
  lib.packagesFromDirectoryRecursive {
    callPackage = lib.callPackageWith (pkgs // { pins = import ./npins; });
    directory = ./packages;
  });
```

### lib.trivial.pipe

Similar to the concept of a pipe in bash, this function allows you to pipe the output of one function to the input of another. This is useful when you have a function that returns a value that you want to chain together several operations.

```nix
lib.trivial.pipe 2 [
  (x: x + 2)  # 2 + 2 = 4
  (x: x * 2)  # 4 * 2 = 8
] # outputs 8
```

## Packaging

### Tauri

Recently I tried packaging some Tauri apps, what a big mistake. Anyone that tried packaging a [tarui](https://tauri.app) app has probably seen this amazing error:

```bash
chmod: changing permissions of '/nix/store/6scp0k430y2psl9i7zbiccv0687fk4hc-454xi372h27vn98mavqlxn5cf85x72ll-source/src-tauri': Operation not permitted
```

But it suddenly fixes itself if you package it for nixpkgs rather than as a flake??? This one I am beyond lost on, but my best advice is just to make a package for nixpkgs.

### My greatest enemy

`pngquant-bin` is truly my greatest enemy. In my upward battle to package [`catppuccinifier-gui`](https://github.com/lighttigerXIV/catppuccinifier), it had a dependency on `pngquant-bin`. And the worst bit is that `pngquant-bin` runs an install script to download extra files which simply is not allowed in nix. In the end, I gave up and patched the binary release instead.

## The module system

I wish I learned this much earlier. I abuse this now and it's worth every bit of it. It makes your system configurations a lot easier to understand and commonalities between your systems and users can be shared.

Let's say between all machines I want to have a user named `isabel`, I would set that in a file called `common.nix` and then import that file in all my system configurations.

The file tree might look something like this:

```
.
├── hosts/
│   ├── host1.nix
│   └── host2.nix
└── users/
    └── isabel.nix
```

Then in the file `users/isabel.nix` file I would have something like this:

```nix
{
  users.users.isabel = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" ];
  };
}
```

Then each host1, `hosts/host1.nix`, can contain something specific to that host, in this case, the hostname:

```nix
{
  imports = [@users/isabel.nix];
  networking.hostName = "host1";
}
```

Whereas my other host `hosts/host2.nix`, might want to have a different hostname for example:

```nix
{
  imports = [@users/isabel.nix];
  networking.hostName = "host2";
}
```

If you can see where this is going, you should understand that this means that the entire system is extensible. We can make changes to one host that don't affect another. And changes that apply across multiple hosts.

We can make this even better with options. You could do this with a tree that looks more like such:

```
.
├── hosts/
│   ├── host1.nix
│   └── host2.nix
├── modules/
│   └── common.nix
└── users/
    └── isabel.nix
```

Our `modules/common.nix` may look something like this, where we are defining a new option for the hostname:

```nix
{lib, config, ...}: {
  imports = [@users/isabel.nix]; # this file remains the same

  # in this case we are creating a new option under the `my` namespace
  options.my.hostname = lib.mkOption {
    type = types.str;
    default = "nixos";
  };

  # This might be a little confusing since it's set as
  # `options.my.hostname` but to use is calling `config.networking.hostName`
  config.networking.hostName = config.my.hostname;
}
```

Then each host would look almost identical to the other but with slightly differing values:

```nix
{
  imports = [@modules/common.nix];
  config.my.hostname = "host1";
}
```

Changing the hostname per system like this is pretty trivial and not much of a real use case, but if you put your mind to it you can start to see how you might make a set of packages apply across 2 systems but not a 3rd or 4th.

## Conclusion

Nix is super flexible and there's a lot of uses for it and ways you can use it. Some ways work better for some and not for others. I hope you found this article at least entertaining, if not that at least to have learned at least one thing.
