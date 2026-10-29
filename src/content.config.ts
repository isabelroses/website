import { glob, type Loader } from "astro/loaders";
import { defineCollection } from "astro:content";
import { readingTime } from "reading-time-estimator";
import { z } from "astro/zod";

const blog = z.object({
  title: z.string(),
  description: z.string(),
  // Transform string to Date object
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  // sequoia's coverImage, resolved against dist/blog (the generated og image)
  image: z.string().optional(),
  tags: z.array(z.string()),
  readTime: z.number().default(1),
  draft: z.boolean().default(false),
  archived: z.boolean().default(false),
  atUri: z.string(),
});

const blogLoader: Loader = {
  name: "blog",
  load: async (context) => {
    await glob({ base: "./src/content", pattern: "**/*.md" }).load(context);

    for (const item of context.store.values()) {
      // round up: the library rounds to nearest, which undersells and can give 0
      const { words } = readingTime(item.body ?? "");
      const readTime = Math.max(1, Math.ceil(words / 200));
      // set() is a no-op when the digest is unchanged, which it is right after glob
      context.store.delete(item.id);
      context.store.set({ ...item, data: { ...item.data, readTime } });
    }
  },
};

const blogCollection = defineCollection({
  loader: blogLoader,
  schema: blog,
});

export const collections = { blog: blogCollection };
