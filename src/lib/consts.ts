import catppuccinNix from "@assets/repos/catppuccin-nix.webp";
import freezeNvim from "@assets/repos/freeze.webp";
import dotfiles from "@assets/repos/dotfiles.svg";
import bellado from "@assets/repos/bellado.webp";

export const SITE_TITLES = {
  index: "isabel",
  blog: "isabel's blog",
  projects: "isabel's projects",
  friends: "isabel's friends",
};

export const SITE_DESCRIPTIONS = {
  index: "the nix witch",
  blog: "my personal blog",
  projects: "a collection of my open source projects",
  friends: "badges and webrings",
};

// stars are barely updated
export const PROJECTS = [
  {
    name: "This Site",
    description: "This site that your currently on.",
    icon: null,
    banner: null,
    href: "https://isabelroses.com",
    repo: "https://github.com/isabelroses/website",
    stars: 24,
  },
  {
    name: "Catppuccin Nix",
    description: "Soothing pastel colors for nix",
    icon: catppuccinNix.src,
    href: null,
    repo: "https://github.com/catppuccin/nix",
    stars: 582,
  },
  {
    name: "freeze.nvim",
    description: "A wrapper for charm's freeze cli tool for usage in neovim",
    icon: freezeNvim.src,
    href: null,
    repo: "https://github.com/charm-community/freeze.nvim",
    stars: 80,
  },
  {
    name: "izrss",
    description: "An RSS feed reader for the terminal",
    icon: null,
    href: null,
    repo: "https://github.com/isabelroses/izrss",
    stars: 32,
  },
  {
    name: "Dotfiles",
    description: "My over complex system configurations",
    icon: dotfiles.src,
    href: null,
    repo: "https://github.com/isabelroses/dotfiles",
    stars: 305,
  },
  {
    name: "Bellado",
    description: "A fast and once simple cli todo tool",
    icon: bellado.src,
    href: null,
    repo: "https://github.com/isabelroses/bellado",
    stars: 13,
  },
];

import gen from "@assets/friends/gen.png";
import alyxia from "@assets/friends/alyxia.png";
import chloe from "@assets/friends/chloe.png";
import nax from "@assets/friends/nax.gif";
import kaya from "@assets/friends/kaya.gif";
import aubrey from "@assets/friends/aubrey.png";
import rooot from "@assets/friends/rooot.gif";
import autumn from "@assets/friends/autumn.webp";
import maeve from "@assets/friends/maeve.png";
import basil from "@assets/friends/basil.gif";
import arimelody from "@assets/friends/arimelody.gif";
import ezri from "@assets/friends/ezri.png";
import notnite from "@assets/friends/notnite.png";
import robin from "@assets/friends/robin.gif";
import sketch from "@assets/friends/sketch.png";
import slonking from "@assets/friends/slonking.webp";
import thermia from "@assets/friends/thermia.gif";
import awwpotato from "@assets/friends/awwpotato.png";
import dbw from "@assets/friends/dbw.png";

export const FRIENDS = [
  {
    name: "gen",
    link: "https://genshibe.ca",
    badge: gen,
  },
  {
    name: "alyxia",
    link: "https://alyxia.dev",
    badge: alyxia,
  },
  {
    name: "chloe",
    link: "https://sapphic.moe",
    badge: chloe,
  },
  {
    name: "nax",
    link: "https://nax.dev",
    badge: nax,
  },
  {
    name: "kaya",
    link: "https://tired.moe",
    badge: kaya,
  },
  {
    name: "aubrey",
    link: "https://aubrey.rs",
    badge: aubrey,
  },
  {
    name: "rooot",
    link: "https://rooot.gay",
    badge: rooot,
  },
  {
    name: "autumn",
    link: "https://autumn.town",
    badge: autumn,
  },
  {
    name: "maeve",
    link: "https://les.bi",
    badge: maeve,
  },
  {
    name: "basil",
    link: "https://basil.cafe",
    badge: basil,
  },
  {
    name: "arimelody",
    link: "https://arimelody.me",
    badge: arimelody,
  },
  {
    name: "ezri",
    link: "https://ezri.pet",
    badge: ezri,
  },
  {
    name: "notnite",
    link: "https://notnite.com",
    badge: notnite,
  },
  {
    name: "robin",
    link: "https://robinroses.xyz",
    badge: robin,
  },
  {
    name: "sketch",
    link: "https://sketchni.uk",
    badge: sketch,
  },
  {
    name: "slonking",
    link: "https://slonk.ing",
    badge: slonking,
  },
  {
    name: "thermia",
    link: "https://girlthi.ng/~thermia",
    badge: thermia,
  },
  {
    name: "awwpotato",
    link: "https://awwpotato.xyz",
    badge: awwpotato,
  },
  {
    name: "dbw",
    link: "https://dbw.neocities.org",
    badge: dbw,
  },
  //{
  //  link: "https://garfunkles.space",
  //  badge: "garfunkles.webp",
  //},
];

export const WEBRINGS = [
  {
    name: "Catppuccin Webring",
    href: "https://ctp-webr.ing",
    prev: "/isabelroses/previous",
    next: "/isabelroses/next",
  },
  {
    name: "Aberystwyth Webring",
    href: "https://aberwebr.ing",
    prev: "/isabelroses/left",
    next: "/isabelroses/right",
  },
  {
    name: "Sapphic Webring",
    href: "https://ring.sapphic.moe",
    prev: "/isabelroses/previous",
    next: "/isabelroses/next",
  },
];
