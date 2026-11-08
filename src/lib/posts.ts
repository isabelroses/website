import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

export interface PostPage {
  post: Post;
  prevPost: Post | null;
  nextPost: Post | null;
  tags: string[];
}

export interface TagPage {
  tag: string;
  posts: Post[];
}

export const lastChanged = (post: Post) => post.data.updated ?? post.data.date;

// injected into the rendered frontmatter by @xsynaptic/satteri-reading-time
type ReadingFrontmatter = { minutesRead?: number };

export const readTime = (post: Post) =>
  (post.rendered?.metadata?.frontmatter as ReadingFrontmatter | undefined)
    ?.minutesRead ?? 1;

export function catalogue(entries: Post[]) {
  const published = entries
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const posts = published.filter((post) => !post.data.archived);
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))];
  const linkable = new Set(tags);

  const pages = published.map((post) => {
    const i = posts.indexOf(post);
    return {
      post,
      prevPost: i === -1 ? null : (posts[i + 1] ?? null),
      nextPost: i === -1 ? null : (posts[i - 1] ?? null),
      tags: post.data.tags.filter((tag) => linkable.has(tag)),
    };
  });

  const tagPages = tags.map((tag) => ({
    tag,
    posts: posts.filter((post) => post.data.tags.includes(tag)),
  }));

  const years = [...Map.groupBy(posts, (post) => post.data.date.getFullYear())];

  return { posts, pages, tags, tagPages, years };
}

let built: Promise<ReturnType<typeof catalogue>> | undefined;

// dev re-reads content on every call so edited posts show up without a restart
export const getCatalogue = () =>
  import.meta.env.PROD
    ? (built ??= getCollection("blog").then(catalogue))
    : getCollection("blog").then(catalogue);
