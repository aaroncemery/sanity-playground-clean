import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

/**
 * Burger Haven - Sanity Functions Blueprint
 *
 * These functions enforce business rules on ALL writes to the productcatalog dataset.
 * This is the critical feature: External PIM writes cannot bypass these validation rules.
 */

export default defineBlueprint({
  resources: [
    // PRIMARY: Validate all product and pricing writes from external PIM
    defineDocumentFunction({
      name: 'validate-catalog-writes',
      event: {
        on: ['create', 'update'],
        filter: 'dataset == "productcatalog" && (_type == "product" || _type == "productPricing")',
        projection: '{_id, _type, sku, name, category, basePrice, allergens, nutritionFacts, pimProductId, pimMetadata, price, product, storeLocation, pricingTier}',
      },
    }),

    // SECONDARY: Create audit trail of all PIM sync activity
    defineDocumentFunction({
      name: 'sync-audit-trail',
      event: {
        on: ['create', 'update'],
        filter: 'dataset == "productcatalog" && (_type == "product" || _type == "productPricing" || _type == "storeLocation")',
        projection: '{_id, _type, sku, pimMetadata}',
      },
    }),
  ],
})
