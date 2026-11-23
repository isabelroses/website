import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

// the only place that knows where posts and tags live
export const postPath = (post: Post) => `/blog/${post.id}`;
export const tagPath = (tag: string) => `/blog/tag/${tag}`;
export const postImage = (post: Post) => `${postPath(post)}.png`;

export const lastChanged = (post: Post) => post.data.updated ?? post.data.date;

// injected into the rendered frontmatter by @xsynaptic/satteri-reading-time
type ReadingFrontmatter = { minutesRead?: number };

export const readTime = (post: Post) =>
  (post.rendered?.metadata?.frontmatter as ReadingFrontmatter | undefined)
    ?.minutesRead ?? 1;

export interface PostLink {
  title: string;
  href: string;
}

export interface PostPage {
  post: Post;
  href: string;
  image: string;
  minutes: number;
  prev: PostLink | null;
  next: PostLink | null;
  tags: string[];
}

export interface TagPage {
  tag: string;
  href: string;
  posts: Post[];
}

export function catalogue(entries: Post[]) {
  const published = entries
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const posts = published.filter((post) => !post.data.archived);
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))];
  const linkable = new Set(tags);

  const link = (post: Post): PostLink => ({
    title: post.data.title,
    href: postPath(post),
  });

  const pages: PostPage[] = published.map((post) => {
    const i = posts.indexOf(post);
    const prev = i === -1 ? undefined : posts[i + 1];
    const next = i === -1 ? undefined : posts[i - 1];
    return {
      post,
      href: postPath(post),
      image: postImage(post),
      minutes: readTime(post),
      prev: prev ? link(prev) : null,
      next: next ? link(next) : null,
      tags: post.data.tags.filter((tag) => linkable.has(tag)),
    };
  });

  const tagPages: TagPage[] = tags.map((tag) => ({
    tag,
    href: tagPath(tag),
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
