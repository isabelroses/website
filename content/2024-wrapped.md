---
title: 2024 Wrapped
description: like last year, but this year
date: 29/12/2024
tags:
  - meta
  - wrapped
---

Welcome to my 2024 Wrapped! This is a recall of all that happened this year, and a look at what's to come in 2025.

## 2024 in Review

### New technologies

- [wezterm](https://wezfurlong.org/wezterm/) - I started using this terminal emulator due to its multiplatform support and its depth of configurablity.
- [ghostty](https://ghostty.org/) - I started using this one while it was still in beta, and its been my go-to terminal emulator on macOS since.
- [lix](https://lix.systems/) - This is a fork of nix and I've been using it for its cli stability and improved performance.
- [freeze](https://github.com/charmbracelet/freeze) - A lovely little tool for taking screenshots of code and sharing them with friends.

Switching from WezTerm to Ghostty might seem odd, but the decision was clear: Ghostty’s native implementation offered unmatched speed and macOS integration, making it the superior choice for my needs.

### Languages

This year I didn't learn any new languages, but rather I decided to focus on improving my existing skills in Go, Java and Rust. I found during that time that I really do prefer Rust, this is largly due to the developer support through rust-analyzer and cargo clippy.

### New Projects

The year began with a significant project; rewriting my website in Go. The process was tedious, but the outcome was much preferable. However, I still had my reservations about Go's templating engine. While it’s good, I felt there was room for improvement.

And that is where Tera, a rust based templating engine like jinja2 and Django. I first encountered Tera through the [Catppuccin Whiskers](https://github.com/catppuccin/whiskers) project. Tera’s extensablity convinced me to rewrite my site again, this time in Rust. The result exceeded my expectations, and Rust’s ecosystem further cemented my love for the language.

However, before the website was rewritten in rust I tried to create a new Go project [izrss](https://github.com/isabelroses/izrss) which was a terminal RSS feed reader. It's not feature rich but it was created to look pretty due to my dissatisfaction with newsboat.

This year, I abstracted by neovim configuration incredibly through the use of [chainix](https://github.com/catgardens/chainix). I later decided to remove a significant amount of the nix abstraction through [izvim](https://github.com/isabelroses/nvim), where I made a package around the lua rather then using nix to generate the lua. During this year I also wrote the [freeze.nvim](https://github.com/charm-and-friends/freeze.nvim) plugin, which I wrote a blog post about. You can find the jeorney here: [neovim blog post](https://isabelroses.com/blog/writing-a-neovim-plugin-6).

## My goals for 2025

I would like to get some more work done on my Wayland compositor. I would also love to grow my social media presence, and maybe even write 3 blog posts, which would be my apology for not writing one in 6 months. And you all know me; rewrite my nix config once or twice again... per week.
