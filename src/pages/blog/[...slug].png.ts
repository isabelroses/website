import type { APIRoute, GetStaticPaths } from "astro";
import type { CollectionEntry } from "astro:content";
import { generateOpenGraph } from "@lib/opengraph";
import { getPosts } from "@lib/posts";

export const getStaticPaths = (async () => {
  const posts = await getPosts({ includeArchived: true });
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ post: CollectionEntry<"blog"> }> = ({ props }) =>
  generateOpenGraph(
    props.post.data.title,
    props.post.data.description,
    props.post.data.date,
  );
