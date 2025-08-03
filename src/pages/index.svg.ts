import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import type { APIRoute } from "astro";
import { generateOpenGraph } from "../lib/opengraph";

export const GET: APIRoute = async ({ params }) => {
  const svg = await generateOpenGraph(SITE_TITLE, SITE_DESCRIPTION);
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml" },
  });
};
