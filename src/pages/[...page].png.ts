import type { APIRoute, GetStaticPaths } from "astro";
import { generateOpenGraph } from "@lib/opengraph";
import { PAGES, ogSlug, type Page } from "@lib/pages";

export const getStaticPaths = (() =>
  Object.values<Page>(PAGES).map((page) => ({
    params: { page: ogSlug(page) },
    props: page,
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<Page> = ({ props }) =>
  generateOpenGraph(props.card, props.description);
