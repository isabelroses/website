import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  // sequoia's coverImage, resolved against dist/blog (the generated og image)
  image: z.string().optional(),
  tags: z.array(z.string()),
  draft: z.boolean().default(false),
  archived: z.boolean().default(false),
  atUri: z.string(),
});

const blogCollection = defineCollection({
  loader: glob({ base: "./src/content", pattern: "**/*.md" }),
  schema: blog,
});

export const collections = { blog: blogCollection };
