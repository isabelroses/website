import {
  createRouter,
  createWebHistory,
  NavigationFailure,
  RouteRecordRaw,
} from "vue-router";
import Home from "@/views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    meta: { title: "Home", nav: true },
    component: Home,
  },
  {
    path: "/projects",
    name: "Projects",
    meta: { title: "Projects", nav: true },
    component: () => import("../views/Projects.vue"),
  },
  {
    path: "/blog",
    name: "Blog",
    meta: { title: "Blog", nav: true },
    component: () => import("../views/Blog.vue"),
    props: (route) => route.query,
  },
  {
    path: "/blog/:slug",
    name: "BlogPost",
    meta: { title: "Blog", nav: true },
    component: () => import("../views/BlogPost.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

export function pushQuery(query: {
  [id: string]: string | null;
}): Promise<void | NavigationFailure | undefined> {
  const queries = { ...(router.currentRoute.value.query ?? {}) };

  for (const k of Object.keys(query)) {
    if (query[k] == null) delete queries[k];
    else queries[k] = query[k];
  }

  return router.push({ query: queries });
}
export default router;
