import type { APIRoute } from "astro";
import { generateOpenGraph } from "../lib/opengraph";

const title = "My Projects";
const description = "A collection of projects that I maintain";

export const GET: APIRoute = async ({ params }) => {
  const png = await generateOpenGraph(title, description);
  return new Response(png, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
};
