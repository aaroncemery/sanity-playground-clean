import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a09jbdjz'
const apiVersion = '2025-02-24'

// Client for product-catalog dataset (PIM data)
// useCdn: false required — CDN rejects GROQ queries that use -> joins in filter clauses
export const catalogClient = createClient({
  projectId,
  dataset: 'productcatalog',
  apiVersion,
  useCdn: false,
})

// Client for customer-content dataset (marketing data)
export const contentClient = createClient({
  projectId,
  dataset: 'customercontent',
  apiVersion,
  useCdn: true,
})

// Write client for catalog (used in validation demo - requires token)
export const catalogWriteClient = createClient({
  projectId,
  dataset: 'productcatalog',
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Read client for jde-demo dataset (sandbox for sync demo — safe to wipe)
// useCdn: true — syncs run every few hours, CDN staleness (seconds) is irrelevant.
// These reads are free and don't count against API quota.
export const jdeDemoClient = createClient({
  projectId,
  dataset: 'jdedemo',
  apiVersion,
  useCdn: true,
})

// Write client for jde-demo dataset
export const jdeDemoWriteClient = createClient({
  projectId,
  dataset: 'jdedemo',
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Image URL builders
export const catalogImageBuilder = imageUrlBuilder(catalogClient)
export const contentImageBuilder = imageUrlBuilder(contentClient)

export function urlForCatalogImage(source: Parameters<typeof catalogImageBuilder.image>[0]) {
  return catalogImageBuilder.image(source)
}

export function urlForContentImage(source: Parameters<typeof contentImageBuilder.image>[0]) {
  return contentImageBuilder.image(source)
}
