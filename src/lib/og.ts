import type { Page } from "./pages";
import { postImage, type Post } from "./posts";

export const OG_IMAGE = { width: 1080, height: 600 };

// the layout is chosen by kind, not by whether a date happens to be present
export type OgCard =
  | { kind: "page"; title: string; description: string }
  | { kind: "post"; title: string; description: string; date: Date };

export interface OgEntry {
  // the url a page's <meta og:image> points at
  path: string;
  // getStaticPaths params for the route that serves path
  params: Record<string, string>;
  card: OgCard;
}

const ogSlug = (page: Page) =>
  page.path === "/" ? "index" : page.path.slice(1);

export const pageOg = (page: Page): OgEntry => ({
  path: `/${ogSlug(page)}.png`,
  params: { page: ogSlug(page) },
  card: { kind: "page", title: page.card, description: page.description },
});

export const postOg = (post: Post): OgEntry => ({
  path: postImage(post),
  params: { slug: post.id },
  card: {
    kind: "post",
    title: post.data.title,
    description: post.data.description,
    date: post.data.date,
  },
});

export const pageImage = (page: Page) => pageOg(page).path;
