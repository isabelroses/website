import { glob, type Loader } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { readingTime } from "reading-time-estimator";

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

type BlogPost = z.infer<typeof blog>;

const customLoader: Loader = {
  ...glob,
  name: "customLoader",
  load: async (loaderParams) => {
    const { store } = loaderParams;

    const baseLoader = glob({
      base: "./src/content",
      pattern: "**/*.md",
    });
    await baseLoader.load.call(this, loaderParams);

    let items = [...store.values()];
    store.clear();

    const sorted = items.sort(
      (a, b) =>
        new Date((b.data as BlogPost).date).getTime() -
        new Date((a.data as BlogPost).date).getTime(),
    );

    items.forEach((item) => {
      const readTime = readingTime(item.body ?? "", 200);
      item.data.readTime = readTime.minutes;
    });

    sorted.forEach((item) => {
      store.set({ ...item });
    });
  },
};

const blogCollection = defineCollection({
  loader: customLoader,
  schema: blog,
});

export const collections = { blog: blogCollection };
