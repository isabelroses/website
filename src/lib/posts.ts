import { getCollection, type CollectionEntry } from "astro:content";

export async function getPosts({ includeArchived = false } = {}) {
  const posts = await getCollection(
    "blog",
    ({ data }) => !data.draft && (includeArchived || !data.archived),
  );

  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const getTags = (posts: CollectionEntry<"blog">[]) => [
  ...new Set(posts.flatMap((post) => post.data.tags)),
];
