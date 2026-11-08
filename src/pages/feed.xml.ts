import type { APIRoute } from "astro";
import { Feed } from "feed";
import { SITE_NAME } from "@lib/consts";
import { feedHtml } from "@lib/feed";
import { PAGES } from "@lib/pages";
import { getCatalogue, lastChanged } from "@lib/posts";
import { postPath } from "@lib/url";

export const GET: APIRoute = async ({ site }) => {
  const { posts } = await getCatalogue();
  const siteUrl = site!.origin;

  const feed = new Feed({
    title: SITE_NAME,
    description: PAGES.index.description,
    id: siteUrl,
    link: siteUrl,
    language: "en",
    favicon: `${siteUrl}/favicon.ico`,
    copyright: "content licensed under CC BY-NC-SA 4.0",
    feedLinks: {
      atom: `${siteUrl}/feed.xml`,
    },
    author: {
      name: "isabel roses",
    },
    updated: posts
      .map(lastChanged)
      .sort((a, b) => b.getTime() - a.getTime())[0],
  });

  for (const post of posts) {
    const postUrl = new URL(postPath(post), site).href;

    feed.addItem({
      title: post.data.title,
      description: post.data.description,
      date: lastChanged(post),
      published: post.data.date,
      content: feedHtml(post.rendered?.html ?? "", postUrl),
      link: postUrl,
    });
  }

  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
};
