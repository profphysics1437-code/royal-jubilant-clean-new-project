// ═══════════════════════════════════════════════════════════════════════
// Blog Registry — maps slugs to custom premium blog post files.
//
// To add a new custom blog post:
//   1. Create a new file in src/content/blog/ (e.g. my-new-post.tsx)
//   2. Export `metadata` (slug, title, excerpt, category, authorName, etc.)
//   3. Export default React component (the article body)
//   4. Import it here and add to the CUSTOM_BLOGS array
//
// The blog detail page checks this registry FIRST. If a custom file exists
// for the slug, it renders the premium custom article. If not, it falls
// back to the DB (admin portal) content.
//
// The blog listing page (Market Insights) merges custom blogs + DB blogs
// so both appear in the listing.
// ═══════════════════════════════════════════════════════════════════════

import type { ComponentType } from "react";
import PalmJumeirahVillaPrices2026, { metadata as palmMetadata } from "./palm-jumeirah-villa-prices-2026";

export interface BlogMetadata {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  authorRole?: string;
  date: string;
  readTime: string;
  image: string;
}

interface CustomBlog {
  metadata: BlogMetadata;
  Component: ComponentType;
}

export const CUSTOM_BLOGS: CustomBlog[] = [
  {
    metadata: palmMetadata,
    Component: PalmJumeirahVillaPrices2026,
  },
];

/** Look up a custom blog by slug. Returns null if not found. */
export function getCustomBlog(slug: string): CustomBlog | null {
  return CUSTOM_BLOGS.find((b) => b.metadata.slug === slug) || null;
}

/** Get all custom blog metadata (for the listing page). */
export function getAllCustomBlogMetadata(): BlogMetadata[] {
  return CUSTOM_BLOGS.map((b) => b.metadata);
}
