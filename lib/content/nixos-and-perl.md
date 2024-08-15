---
title: NixOS and Perl
description: My battle to purge Perl from my NixOS system
date: 23/07/2024
tags:
  - nix
---

<!--toc:start-->
- [Introduction](#introduction)
- [Research and Planning](#research-and-planning)
<!--toc:end-->

## Introduction

Today's silly battle is about purging Perl from my NixOS system. But to get started we need to understand why Perl is on my system in the first place.
The reason its installed is beacuse nix runs several scripts written in Perl to build and activate the system. One of these is the `switch-to-configuration` script which is used to activate a new system configuration.
You probably don't know of that command if you haven't done too much digging, but what happens when you call `nixos-rebuild switch` is that the system is built and then the `switch-to-configuration` script is called to activate the new configuration.

But why do I actually have a problem with Perl? Well, I don't... I just don't like it, and its really big taking up a fair amount of space in the nix store. So I was bored and decided to kill it with fire!

## Research and Planning

So a big issue with this is how dependant NixOS is on Perl, which makes this a hard task. Immediately we learn that we cannot use `nixos-rebuild` since it comes with a collection of packages that includes Perl. But as it turns out you can run `nix build` and follow that with `sudo ./result/bin/switch-to-configuration switch`.

Oh, wait right... I forgot that `switch-to-configuration` is written in Perl. So how do we get around that. Well thankfully we just had a lovely PR to nixpkgs [#308801](https://github.com/NixOS/nixpkgs/pull/308801) which remedies this isse. But what about WSL, it seems to be broken on that system, no worries theres a fix for that too [#321662](https://github.com/NixOS/nixpkgs/pull/321662).

Now we need to find all the rest of the Perl parts that are on the system. For that we can use `system.forbiddenDependenciesRegexes = ["perl"];` and then run `nix why-depends /run/current-system <perl path>` until we track everthing down.

As it also happens there is a module that mostly removes perl from the system, that can be found here: [nixos/modules/profiles/perlless.nix](https://github.com/NixOS/nixpkgs/blob/f11a6a01cb5e2ceaa40bdc28d492bd2fd8b2a847/nixos/modules/profiles/perlless.nix) however this doesn't go over what the effects of some settings will cause like I will in this post.

## Getting started

To save ourselves the effort of rewriting all the code from the perlless module we can include it in our configuration like so:

```nix
{ modulesPath, ... }:

{
  imports = [
    (modulesPath + "/profiles/perlless.nix")
  ];
}
```

This will remove:

- grub, sorry grub users you best switch to systemd-boot
- 
