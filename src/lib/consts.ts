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

export const FRIENDS = [
  {
    name: "gen",
    link: "https://genshibe.ca",
    image: "gen.png",
  },
  {
    name: "alyxia",
    link: "https://alyxia.dev",
    image: "alyxia.png",
  },
  {
    name: "chloe",
    link: "https://sapphic.moe",
    image: "chloe.png",
  },
  {
    name: "nax",
    link: "https://nax.dev",
    image: "nax.gif",
  },
  {
    name: "kaya",
    link: "https://tired.moe",
    image: "kaya.gif",
  },
  {
    name: "aubrey",
    link: "https://aubrey.rs",
    image: "aubrey.png",
  },
  {
    name: "rooot",
    link: "https://rooot.gay",
    image: "rooot.gif"
  },
  {
    name: "autumn",
    link: "https://autumn.town",
    image: "autumn.webp",
  },
  {
    name: "maeve",
    link: "https://les.bi",
    image: "maeve.png",
  },
  {
    name: "basil",
    link: "https://basil.cafe",
    image: "basil.gif",
  },
  {
    name: "arimelody",
    link: "https://arimelody.me",
    image: "arimelody.gif",
  },
  {
    name: "ezri",
    link: "https://ezri.pet",
    image: "ezri.png",
  },
  {
    name: "notnite",
    link: "https://notnite.com",
    image: "notnite.png",
  },
  {
    name: "robin",
    link: "https://robinwobin.dev",
    image: "robin.gif",
  },
  {
    name: "sketch",
    link: "https://sketchni.uk",
    image: "sketch.png",
  },
  {
    name: "slonking",
    link: "https://slonk.ing",
    image: "slonking.webp",
  },
  {
    name: "thermia",
    link: "https://girlthi.ng/~thermia",
    image: "thermia.gif",
  },
  {
    name: "da157",
    link: "https://0xda157.id",
    image: "0xda157.png",
  },
  {
    name: "dbw",
    link: "https://dbw.neocities.org",
    image: "dbw.png",
  },
  {
    name: "elissa",
    link: "https://elissa.moe",
    image: "elissa.png",
  },
  {
    name: "tasky",
    link: "https://tasky.nuxt.dev",
    image: "tasky.webp",
  },
  {
    name: "april",
    link: "https://aprl.cat",
    image: "april.png",
  },
  {
    name: "sydney",
    link: "https://sydney.blue",
    image: "sydney.png",
  },
  {
    name: "lyna",
    link: "https://blooym.dev",
    image: "lyna.webp",
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
