import { glob, type Loader } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const customLoader: Loader = {
  ...glob,
  name: "customLoader",
  load: async (loaderParams) => {
    const { store, logger } = loaderParams;

    const baseLoader = glob({
      base: "./src/content",
      pattern: "**/*.md",
    });
    await baseLoader.load.call(this, loaderParams);

    let items = [...store.values()];
    store.clear();

    const sorted = items.sort((a, b) => b.data.date - a.data.date);

    sorted.forEach((item) => {
      store.set({ ...item });
    });
  },
};

const blog = defineCollection({
  loader: customLoader,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()),
  }),
});

export const collections = { blog };
