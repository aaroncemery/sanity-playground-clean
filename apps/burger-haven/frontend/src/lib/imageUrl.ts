/**
 * DEMO: Does @sanity/image-url make an extra API call when given a _ref?
 *
 * Answer: NO. The URL is constructed entirely from the _ref string by convention.
 * A ref like "image-abc123-800x600-jpg" encodes everything needed:
 *   https://cdn.sanity.io/images/{projectId}/{dataset}/{hash}-{dimensions}.{format}
 *
 * This means:
 * - Safe to use in a CDN-cached environment (no extra uncached API calls)
 * - The Varnish proxy will see exactly 1 request per image URL, never 2
 * - If you include asset-> in your GROQ query, you already have the full URL
 *   and don't even need the builder — see buildImageUrlFromAsset() below
 */
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import {catalogClient, contentClient} from './sanity'

const catalogBuilder = imageUrlBuilder(catalogClient)
const contentBuilder = imageUrlBuilder(contentClient)

/** Build an image URL from a catalog (productcatalog) image _ref or image object. No API call made. */
export function urlForCatalogImage(source: SanityImageSource) {
  return catalogBuilder.image(source)
}

/** Build an image URL from a content (customercontent) image _ref or image object. No API call made. */
export function urlForContentImage(source: SanityImageSource) {
  return contentBuilder.image(source)
}

/**
 * If your GROQ query already projects asset-> (full asset object with url),
 * you can use the raw URL directly and skip the builder entirely.
 * This is the most CDN-cache-friendly approach for high-traffic scenarios.
 *
 * Example GROQ:  heroImage { asset->{ url, metadata { dimensions } } }
 */
export function buildImageUrlFromAsset(asset: {url: string} | null | undefined): string | null {
  return asset?.url ?? null
}
