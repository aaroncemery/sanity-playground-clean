import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Product Catalog schemas (synced from PIM)
import {product, productPricing, storeLocation, pimSyncLog} from './src/schemaTypes/catalog'

// Customer Content schemas (marketing enrichment)
import {menuItem, promotion, seasonalCampaign, region} from './src/schemaTypes/content'

export default defineConfig([
  // ============================================================
  // WORKSPACE 1: Product Catalog
  // Data synced from external PIM. Functions enforce validation.
  // ============================================================
  {
    name: 'product-catalog-workspace',
    title: 'Product Catalog',
    subtitle: 'Data synced from external PIM — Functions enforce validation',
    projectId: 'a09jbdjz',
    dataset: 'productcatalog',
    basePath: '/catalog',

    plugins: [
      structureTool(),
      visionTool(),
    ],

    schema: {
      types: [product, productPricing, storeLocation, pimSyncLog],
    },
  },

  // ============================================================
  // WORKSPACE 2: Customer Content
  // Marketing enrichment layer — what customers actually see.
  // ============================================================
  {
    name: 'customer-content-workspace',
    title: 'Customer Content',
    subtitle: 'Marketing enrichment of product catalog',
    projectId: 'a09jbdjz',
    dataset: 'customercontent',
    basePath: '/content',

    plugins: [
      structureTool(),
      visionTool(),
    ],

    schema: {
      types: [menuItem, promotion, seasonalCampaign, region],
    },
  },
])
