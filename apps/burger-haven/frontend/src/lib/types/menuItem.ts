/**
 * DEMO: Cross-dataset type merging workaround
 *
 * Typegen does not currently resolve crossDatasetReference fields — it generates
 * a generic reference stub for the `product` field on menuItem documents.
 *
 * Until typegen supports cross-dataset resolution, maintain this merged type manually.
 * When it ships, delete this file and re-run `pnpm typegen`.
 *
 * Tracks: https://github.com/sanity-io/sanity/issues (check for typegen cross-dataset ticket)
 */

/** Shape of a product document from the productcatalog dataset */
export interface CatalogProduct {
  _id: string
  sku: string
  name: string
  category: string
  basePrice: number
  allergens: string[]
  nutritionFacts: {
    calories: number
    protein?: number
    carbs?: number
    fat?: number
    sodium?: number
  }
  pimMetadata: {
    syncSource?: string
    syncStatus?: string
    lastSyncedAt?: string
  }
}

/** menuItem from customercontent with its product resolved from productcatalog */
export interface MenuItemWithProduct {
  _id: string
  marketingName: string
  tagline?: string
  description?: string
  heroImage?: {asset: {_ref: string}; alt?: string}
  badges?: string[]
  displayOrder?: number
  featured?: boolean
  product: CatalogProduct | null // null if ref not populated or product not found
}
