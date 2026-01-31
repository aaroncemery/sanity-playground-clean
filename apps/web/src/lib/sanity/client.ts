import { createClient, type QueryParams } from "next-sanity";

import { apiVersion, dataset, projectId, studioUrl } from "./api";

/**
 * Shared Sanity client configuration
 * Used by both regular fetches and live preview
 */
export const clientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl,
  },
};

/**
 * Standard Sanity client for server-side data fetching
 */
export const client = createClient(clientConfig);

/**
 * Server-side fetch with Next.js caching
 * Use this for regular data fetching outside of live preview
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  return client.fetch(query, params, {
    cache: "force-cache",
    next: {
      revalidate: tags.length ? false : revalidate,
      tags,
    },
  });
}
