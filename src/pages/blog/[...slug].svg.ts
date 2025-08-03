import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { generateOpenGraph } from "../../lib/opengraph";

const posts = await getCollection("blog");

export async function getStaticPaths() {
    return posts.map(({ id }) => ({
        params: { slug: id },
    }));
}

export const GET: APIRoute = async ({ params }) => {
  const postData = posts.find((post) => post.id === params.slug);

  const svg = await generateOpenGraph(postData.data.title, postData.data.description);
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml" },
  });
};

