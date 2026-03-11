// DEMO: validation logic imported from shared package — Studio and API writes use identical rules
import {documentEventHandler} from '@sanity/functions'
import {validateProduct, validatePricing} from '@repo/burger-haven-validators'
import type {ProductDocument, PricingDocument} from '@repo/burger-haven-validators'

/**
 * CRITICAL: This Function enforces business rules on ALL writes to productcatalog dataset.
 *
 * Why this matters:
 * - External PIM writes via API (bypasses Studio validation)
 * - Missing allergens = compliance violation & legal liability
 * - Invalid pricing = operational errors & customer complaints
 * - This runs on EVERY write (Studio + API), so PIM cannot bypass rules
 *
 * Demo value: Shows prospect that Functions solve the #1 pain point:
 * "We can limit business rules via UI, but then it can be bypassed via API."
 */

export const handler = documentEventHandler(async ({event}) => {
  const document = event.data?.data || event.data
  const operation = event.type

  // Only validate creates and updates
  if (!['document.create', 'document.update'].includes(operation)) {
    return
  }

  if (!document || !document._type) {
    return
  }

  console.log(`[VALIDATION] ${operation.toUpperCase()} ${document._type} ${document._id}`)

  // Validate products
  if (document._type === 'product') {
    await runProductValidation(document as ProductDocument)
  }

  // Validate pricing
  if (document._type === 'productPricing') {
    await runPricingValidation(document as PricingDocument)
  }
})

async function runProductValidation(product: ProductDocument): Promise<void> {
  const {errors, warnings} = validateProduct(product)

  if (warnings.length > 0) {
    console.warn('[VALIDATION WARNINGS]', {
      documentId: product._id,
      sku: product.sku,
      name: product.name,
      warnings,
      timestamp: new Date().toISOString(),
    })
  }

  if (errors.length > 0) {
    console.error('[VALIDATION FAILURE] Product write REJECTED', {
      documentId: product._id,
      sku: product.sku,
      name: product.name,
      errors,
      warnings,
      timestamp: new Date().toISOString(),
      source: product.pimMetadata?.syncSource || 'unknown',
    })

    const errorMessage = [
      '🚫 PRODUCT VALIDATION FAILED',
      '',
      ...errors,
      '',
      ...(warnings.length > 0 ? ['Warnings (non-blocking):', ...warnings] : []),
      '',
      '---',
      'This write has been rejected to maintain data quality and compliance.',
      'Please correct the errors in your PIM system and retry the sync.',
    ].join('\n')

    throw new Error(errorMessage)
  }

  console.log('✅ Product validation PASSED', {
    sku: product.sku,
    name: product.name,
    category: product.category,
    warnings: warnings.length,
    timestamp: new Date().toISOString(),
  })
}

async function runPricingValidation(pricing: PricingDocument): Promise<void> {
  const {errors} = validatePricing(pricing)

  if (errors.length > 0) {
    console.error('[VALIDATION FAILURE] Pricing write REJECTED', {
      documentId: pricing._id,
      errors,
      timestamp: new Date().toISOString(),
    })

    throw new Error(`Pricing validation failed:\n${errors.join('\n')}`)
  }

  console.log('✅ Pricing validation PASSED for', pricing.product?._ref || 'product')
}
