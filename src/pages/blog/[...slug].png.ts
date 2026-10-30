import type { APIRoute, GetStaticPaths } from "astro";
import type { CollectionEntry } from "astro:content";
import { generateOpenGraph } from "@lib/opengraph";
import { getPostPages } from "@lib/posts";

export const getStaticPaths = (async () => {
  return (await getPostPages()).map(({ post }) => ({
    params: { slug: post.id },
    props: { post },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ post: CollectionEntry<"blog"> }> = ({ props }) =>
  generateOpenGraph(
    props.post.data.title,
    props.post.data.description,
    props.post.data.date,
  );
