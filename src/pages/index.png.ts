import type { APIRoute } from "astro";
import { generateOpenGraph } from "@lib/opengraph";
import { SITE_TITLES, SITE_DESCRIPTIONS } from "@lib/consts";

export const GET: APIRoute = async () => {
  const png = await generateOpenGraph(
    SITE_TITLES.index,
    SITE_DESCRIPTIONS.index,
  );
  return new Response(png, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
};
