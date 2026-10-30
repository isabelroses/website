import { getCollection, type CollectionEntry } from "astro:content";

type Post = CollectionEntry<"blog">;

export interface PostPage {
  post: Post;
  prevPost: Post | null;
  nextPost: Post | null;
}

const getPublished = async () =>
  (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

export const getPosts = async () =>
  (await getPublished()).filter((post) => !post.data.archived);

export async function getPostPages(): Promise<PostPage[]> {
  const published = await getPublished();
  const listed = published.filter((post) => !post.data.archived);

  return published.map((post) => {
    const i = listed.indexOf(post);
    return {
      post,
      prevPost: i === -1 ? null : (listed[i + 1] ?? null),
      nextPost: i === -1 ? null : (listed[i - 1] ?? null),
    };
  });
}

export const getTags = (posts: Post[]) => [
  ...new Set(posts.flatMap((post) => post.data.tags)),
];
