import type { APIRoute, GetStaticPaths } from "astro";
import { generateOpenGraph } from "@lib/opengraph";
import { pageOg, type OgCard } from "@lib/og";
import { PAGES, type Page } from "@lib/pages";

export const getStaticPaths = (() =>
  Object.values<Page>(PAGES).map((page) => {
    const { params, card } = pageOg(page);
    return { params, props: card };
  })) satisfies GetStaticPaths;

export const GET: APIRoute<OgCard> = ({ props }) => generateOpenGraph(props);
