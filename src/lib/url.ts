import type { CollectionEntry } from "astro:content";

export const pagePath = (url: URL) =>
  url.pathname.replace(/(\/index)?\.html$/, "").replace(/\/$/, "") || "/";

export const postPath = (post: CollectionEntry<"blog">) => `/blog/${post.id}`;

export const tagPath = (tag: string) => `/blog/tag/${tag}`;
