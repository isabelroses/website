import type { APIRoute } from "astro";
import { Feed } from "feed";
import { SITE_TITLES, SITE_DESCRIPTIONS } from "@lib/consts";
import { getPosts } from "@lib/posts";
import { postPath } from "@lib/url";
import sanitizeHtml from "sanitize-html";

// feed readers resolve relative urls against the feed, not the post
const resolveAttr =
  (attr: string, base: string) =>
  (tagName: string, attribs: sanitizeHtml.Attributes) => {
    const url = attribs[attr];
    if (!url || /^[a-z][a-z\d+.-]*:/i.test(url)) return { tagName, attribs };
    return {
      tagName,
      attribs: { ...attribs, [attr]: new URL(url, base).href },
    };
  };

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title"],
    a: ["href", "name", "target", "rel"],
  },
  nonTextTags: ["style", "script", "textarea", "option", "noscript"],
};

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  const siteUrl = site!.origin;
  const lastChanged = (post: (typeof posts)[number]) =>
    post.data.updated ?? post.data.date;

  const feed = new Feed({
    title: SITE_TITLES.index,
    description: SITE_DESCRIPTIONS.index,
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
    const postUrl = `${siteUrl}${postPath(post)}`;
    const sanitizedContent = sanitizeHtml(post.rendered?.html ?? "", {
      ...SANITIZE,
      transformTags: {
        a: resolveAttr("href", postUrl),
        img: resolveAttr("src", postUrl),
      },
    });

    feed.addItem({
      title: post.data.title,
      description: post.data.description,
      date: lastChanged(post),
      published: post.data.date,
      content: sanitizedContent,
      link: postUrl,
    });
  }

  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
};
