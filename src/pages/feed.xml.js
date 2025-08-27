import { Feed } from "feed";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

export async function GET(context) {
  const posts = await getCollection("blog", ({ data }) => {
    return !data.draft && !data.archived;
  });

  const siteUrl = "https://isabelroses.com";

  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });

  const feed = new Feed({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    id: siteUrl,
    link: siteUrl,
    language: "en",
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss: `${siteUrl}/feed.xml`,
    },
    author: {
      name: "isabel roses",
    },
    updated: new Date(),
  });

  posts.forEach((post) => {
    const htmlContent = md.render(post.body);

    const sanitizedContent = sanitizeHtml(htmlContent, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "h1",
        "h2",
        "h3",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt", "title"],
        a: ["href", "name", "target", "rel"],
      },
      // Transform relative URLs to absolute URLs
      transformTags: {
        a: (tagName, attribs) => {
          if (attribs.href && attribs.href.startsWith("/")) {
            return {
              tagName: "a",
              attribs: {
                ...attribs,
                href: `${siteUrl}${attribs.href}`,
                target: "_blank",
                rel: "noopener",
              },
            };
          }
          return { tagName, attribs };
        },
        img: (tagName, attribs) => {
          if (attribs.src && attribs.src.startsWith("/")) {
            return {
              tagName: "img",
              attribs: {
                ...attribs,
                src: `${siteUrl}${attribs.src}`,
              },
            };
          }
          return { tagName, attribs };
        },
      },
    });

    feed.addItem({
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      updatedDate: post.data.updated,
      content: sanitizedContent,
      link: `${siteUrl}/blog/${post.id}/`,
    });
  });

  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
