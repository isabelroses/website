import type { Post } from "./posts";
import { SITE_NAME } from "./consts";
import { postPath } from "./url";

export const OG_IMAGE = { width: 1080, height: 600 };

export type Page = {
  path: string;
  name: string;
  label?: string;
  card: string;
  description: string;
  nav?: boolean;
};

export const PAGES = {
  index: {
    path: "/",
    name: SITE_NAME,
    card: SITE_NAME,
    description: "the nix witch",
  },
  blog: {
    path: "/blog",
    name: "grimoire",
    label: "grimoire.index",
    card: `${SITE_NAME}'s grimoire`,
    description: "my collection of ritual logs, mostly nix and nixos",
    nav: true,
  },
  projects: {
    path: "/projects",
    name: "artifacts",
    label: "artifacts.registry",
    card: `${SITE_NAME}'s artifacts`,
    description:
      "things i've conjured in the open, mostly nix and terminal tools",
    nav: true,
  },
  friends: {
    path: "/friends",
    name: "coven",
    label: "coven.members",
    card: `${SITE_NAME}'s coven`,
    description: "the witches i keep close, and the webrings that bind us",
    nav: true,
  },
  donate: {
    path: "/donate",
    name: "donate",
    label: "donate.offerings",
    card: `${SITE_NAME}'s offerings`,
    description:
      "every artifact and ritual log here is made in my free time. if any of it helped you, an offering of any size keeps the candles lit. thank you.",
    nav: true,
  },
  notFound: {
    path: "/404",
    name: "404",
    label: "error.404",
    card: "lost",
    description:
      "nothing lives at this address. it may have moved, or it never existed.",
  },
} satisfies Record<string, Page>;

export const NAV = Object.values<Page>(PAGES).filter((page) => page.nav);

export const pageTitle = (title?: string) =>
  title ? `${SITE_NAME} | ${title}` : SITE_NAME;

export const ogSlug = (page: Page) =>
  page.path === "/" ? "index" : page.path.slice(1);

export const pageImage = (page: Page) => `/${ogSlug(page)}.png`;

export const postImage = (post: Post) => `${postPath(post)}.png`;
