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
  image: z.string().optional(),
  tags: z.array(z.string()),
  readTime: z.string().optional(),
  draft: z.boolean().default(false),
  archived: z.boolean().default(false),
});

const customLoader = {
  ...glob,
  name: "customLoader",
  load: async (loaderParams) => {
    const { store } = loaderParams;

    const baseLoader = glob({
      base: "./src/content",
      pattern: "**/*.md",
    });
    await baseLoader.load.call(this, loaderParams);

    const items = [...store.values()];
    store.clear();

    // we used to sort here but getCollection is none-deterministic so our sort
    // order became jumbled as of astro v6 so we cannot do that anymore

    items.forEach((item) => {
      const readTime = readingTime(item.body ?? "");
      item.data.readTime = readTime.minutes;
      store.set({ ...item });
    });
  },
} satisfies Loader;

const blogCollection = defineCollection({
  loader: customLoader,
  schema: blog,
});

export const collections = { blog: blogCollection };
