import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { generateOpenGraph } from "@lib/opengraph";

const posts = await getCollection("blog");

export async function getStaticPaths() {
  return posts.map(({ id }) => ({
    params: { slug: id },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const postData = posts.find((post) => post.id === params.slug);

  if (!postData) {
    return new Response("Not found", { status: 404 });
  }

  const png = await generateOpenGraph(
    postData.data.title,
    postData.data.description,
    postData.data.date,
  );

  return new Response(png, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
};
