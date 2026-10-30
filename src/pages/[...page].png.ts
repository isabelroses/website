import type { APIRoute, GetStaticPaths } from "astro";
import { generateOpenGraph } from "@lib/opengraph";
import { PAGES, type Page } from "@lib/consts";

export const getStaticPaths = (() =>
  Object.values(PAGES).map((page) => ({
    params: { page: page.image.slice(1, -".png".length) },
    props: page,
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<Page> = ({ props }) =>
  generateOpenGraph(props.card, props.description);
