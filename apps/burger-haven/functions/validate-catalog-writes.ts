import {documentEventHandler} from '@sanity/functions'

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

interface NutritionFacts {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  sodium?: number
}

interface PimMetadata {
  syncSource?: string
  syncStatus?: string
}

interface ProductDocument {
  _id: string
  _type: string
  sku?: string
  name?: string
  category?: string
  basePrice?: number
  allergens?: string[]
  nutritionFacts?: NutritionFacts
  pimProductId?: string
  pimMetadata?: PimMetadata
}

interface PricingDocument {
  _id: string
  _type: string
  price?: number
  product?: {_ref: string}
  storeLocation?: {_ref: string}
  pricingTier?: string
}

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
    await validateProduct(document as ProductDocument)
  }

  // Validate pricing
  if (document._type === 'productPricing') {
    await validatePricing(document as PricingDocument)
  }
})

async function validateProduct(product: ProductDocument): Promise<void> {
  const errors: string[] = []
  const warnings: string[] = []

  // ============================================
  // CRITICAL COMPLIANCE VALIDATIONS
  // ============================================

  // COMPLIANCE: Allergen information (REQUIRED for FDA compliance)
  if (!product.allergens || product.allergens.length === 0) {
    errors.push(
      '⚠️ COMPLIANCE VIOLATION: Allergen information is REQUIRED for all food products. ' +
        'This is a legal requirement and cannot be bypassed.',
    )
  }

  // COMPLIANCE: Nutrition facts (REQUIRED for FDA compliance)
  if (!product.nutritionFacts) {
    errors.push(
      '⚠️ COMPLIANCE VIOLATION: Nutrition facts are REQUIRED. ' +
        'Missing this data violates FDA regulations.',
    )
  } else {
    const {calories, protein, carbs, fat, sodium} = product.nutritionFacts

    if (calories && calories > 3000) {
      warnings.push(
        '⚠️ WARNING: Calories exceed 3000, which is unusually high. ' +
          'Please verify this data with PIM source.',
      )
    }

    if (calories && protein && carbs && fat) {
      const calculatedCalories = protein * 4 + carbs * 4 + fat * 9
      const difference = Math.abs(calories - calculatedCalories)

      if (difference > 100) {
        warnings.push(
          `⚠️ WARNING: Calorie calculation (${calculatedCalories}) differs significantly ` +
            `from stated calories (${calories}). Please verify macronutrients.`,
        )
      }
    }

    if (sodium && sodium > 2300) {
      warnings.push(
        '⚠️ WARNING: Sodium exceeds recommended daily value (2300mg). ' +
          'Consider flagging for customers.',
      )
    }
  }

  // ============================================
  // DATA QUALITY VALIDATIONS
  // ============================================

  // VALIDATION: SKU format (must match XX0000 pattern)
  if (!product.sku) {
    errors.push('❌ REQUIRED: SKU is required for all products')
  } else if (!/^[A-Z]{2}\d{4}$/.test(product.sku)) {
    errors.push(
      `❌ FORMAT ERROR: SKU "${product.sku}" is invalid. Must be format XX0000 (e.g., BH1001, CH2001)`,
    )
  }

  // VALIDATION: Price range
  if (product.basePrice !== undefined && product.basePrice !== null) {
    if (product.basePrice <= 0) {
      errors.push('❌ INVALID: Base price must be greater than $0')
    }
    if (product.basePrice > 100) {
      warnings.push(
        '⚠️ WARNING: Base price over $100 is unusual for QSR menu items. Please verify with PIM.',
      )
    }
  } else {
    errors.push('❌ REQUIRED: Base price is required')
  }

  // VALIDATION: Category required
  if (!product.category) {
    errors.push('❌ REQUIRED: Product must have a category assigned')
  }

  // VALIDATION: Product name
  if (!product.name || product.name.trim().length === 0) {
    errors.push('❌ REQUIRED: Product name is required')
  }

  // ============================================
  // PIM INTEGRATION VALIDATIONS
  // ============================================

  if (!product.pimProductId) {
    warnings.push(
      '⚠️ WARNING: No PIM Product ID. This product may not be properly synced with external PIM system.',
    )
  }

  if (!product.pimMetadata?.syncSource) {
    warnings.push(
      '⚠️ WARNING: No sync source identified. Unable to track which PIM system this came from.',
    )
  }

  // ============================================
  // LOGGING & RESPONSE
  // ============================================

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

async function validatePricing(pricing: PricingDocument): Promise<void> {
  const errors: string[] = []

  if (pricing.price === undefined || pricing.price === null) {
    errors.push('❌ REQUIRED: Price is required')
  } else if (pricing.price < 0) {
    errors.push('❌ INVALID: Price cannot be negative')
  } else if (pricing.price > 100) {
    errors.push('❌ INVALID: Price over $100 is not allowed for QSR menu items')
  }

  if (!pricing.product) {
    errors.push('❌ REQUIRED: Pricing must reference a product')
  }

  if (!pricing.storeLocation) {
    errors.push('❌ REQUIRED: Pricing must reference a store location')
  }

  if (
    pricing.pricingTier &&
    !['standard', 'premium', 'value', 'airport'].includes(pricing.pricingTier)
  ) {
    errors.push(`❌ INVALID: Pricing tier "${pricing.pricingTier}" is not recognized`)
  }

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
