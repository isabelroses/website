import type { APIRoute, GetStaticPaths } from "astro";
import { generateOpenGraph } from "@lib/opengraph";
import { getCatalogue, type Post } from "@lib/posts";

export const getStaticPaths = (async () =>
  (await getCatalogue()).pages.map(({ post }) => ({
    params: { slug: post.id },
    props: { post },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ post: Post }> = ({ props }) =>
  generateOpenGraph(
    props.post.data.title,
    props.post.data.description,
    props.post.data.date,
  );
