export const SITE_NAME = "isabel";

export const pageTitle = (title?: string) =>
  title ? `${SITE_NAME} | ${title}` : SITE_NAME;

export const PAGES = {
  index: {
    card: SITE_NAME,
    description: "the nix witch",
    image: "/index.png",
  },
  blog: {
    card: "isabel's blog",
    description: "nix, nixos and whatever else i'm thinking about",
    image: "/blog/index.png",
  },
  projects: {
    card: "isabel's projects",
    description: "open source things i've built, mostly nix and terminal tools",
    image: "/projects.png",
  },
  friends: {
    card: "isabel's friends",
    description: "the people i like, and the webrings i'm part of",
    image: "/friends.png",
  },
};

export type Page = (typeof PAGES)[keyof typeof PAGES];

export const OG_IMAGE = { width: 1080, height: 600 };

export const ATPROTO = {
  did: "did:plc:qxichs7jsycphrsmbujwqbfb",
  pds: "https://pds.isabelroses.com",
};

export const LASTFM_PROFILE = "https://www.last.fm/user/isabelroses";

export const LINKS = [
  {
    label: "email",
    handle: "isabel@isabelroses.com",
    href: "mailto:isabel@isabelroses.com",
    icon: "fa7-solid:envelope",
  },
  {
    label: "github",
    handle: "@isabelroses",
    href: "https://github.com/isabelroses",
    icon: "fa7-brands:github",
  },
  {
    label: "fediverse",
    handle: "@isabel@bbs.619.hu",
    href: "https://bbs.619.hu/@isabel",
    icon: "fa7-brands:mastodon",
  },
  {
    label: "bluesky",
    handle: "@isabelroses",
    href: "https://bsky.app/profile/did:plc:qxichs7jsycphrsmbujwqbfb",
    icon: "fa7-brands:bluesky",
  },
  {
    label: "twitter",
    handle: "@isabelrosesss",
    href: "https://x.com/isabelrosesss",
    icon: "fa7-brands:x-twitter",
  },
];

// stars are a snapshot; refresh them with scripts/update-stars.sh
export const PROJECTS = [
  {
    name: "Catppuccin Nix",
    description: "Soothing pastel colors for nix",
    icon: "catppuccin-nix.webp",
    href: null,
    repo: "https://github.com/catppuccin/nix",
    stars: 774,
  },
  {
    name: "izrss",
    description: "An RSS feed reader for the terminal",
    icon: null,
    href: null,
    repo: "https://github.com/isabelroses/izrss",
    stars: 60,
  },
  {
    name: "Dotfiles",
    description: "My over complex system configurations",
    icon: "dotfiles.svg",
    href: null,
    repo: "https://github.com/isabelroses/dotfiles",
    stars: 455,
  },
  {
    name: "freeze.nvim",
    description: "A wrapper for charm's freeze cli tool for usage in neovim",
    icon: "freeze.webp",
    href: null,
    repo: "https://github.com/charm-community/freeze.nvim",
    stars: 89,
  },
  {
    name: "my website",
    description: "The site that you're currently on.",
    icon: null,
    href: "https://isabelroses.com",
    repo: "https://github.com/isabelroses/website",
    stars: 30,
  },
  {
    name: "Bellado",
    description: "A fast and once simple cli todo tool",
    icon: "bellado.webp",
    href: null,
    repo: "https://github.com/isabelroses/bellado",
    stars: 14,
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
    name: "april",
    link: "https://aprl.pet",
    image: "april.png",
  },
  {
    name: "rooot",
    link: "https://rooot.gay",
    image: "rooot.gif",
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
    link: "https://arimelody.space",
    image: "arimelody.gif",
  },
  {
    name: "ezri",
    link: "https://ezri.pet",
    image: "ezri.png",
  },
  {
    name: "abigail",
    link: "https://abigail.sh",
    image: "abigail.png",
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
    link: "https://da157.id",
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
    name: "sydney",
    link: "https://sydney.blue",
    image: "sydney.png",
  },
  {
    name: "lyna",
    link: "https://blooym.dev",
    image: "lyna.webp",
  },
  {
    name: "quinn",
    link: "https://emo.gay",
    image: "quinn.png",
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
