import type { APIRoute } from "astro";
import { generateOpenGraph } from "../lib/opengraph";

const title = "My Friends";
const description = "Awesome people I know from the interwebs";

export const GET: APIRoute = async ({ params }) => {
  const png = await generateOpenGraph(title, description);
  return new Response(png, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
};
