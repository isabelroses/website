import type { APIRoute } from "astro";
import { generateOpenGraph } from "@lib/opengraph";
import { SITE_TITLES, SITE_DESCRIPTIONS } from "@lib/consts";

export const GET: APIRoute = () =>
  generateOpenGraph(SITE_TITLES.projects, SITE_DESCRIPTIONS.projects);
