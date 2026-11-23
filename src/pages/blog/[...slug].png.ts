import type { APIRoute, GetStaticPaths } from "astro";
import { generateOpenGraph } from "@lib/opengraph";
import { postOg, type OgCard } from "@lib/og";
import { getCatalogue } from "@lib/posts";

export const getStaticPaths = (async () =>
  (await getCatalogue()).pages.map(({ post }) => {
    const { params, card } = postOg(post);
    return { params, props: card };
  })) satisfies GetStaticPaths;

export const GET: APIRoute<OgCard> = ({ props }) => generateOpenGraph(props);
