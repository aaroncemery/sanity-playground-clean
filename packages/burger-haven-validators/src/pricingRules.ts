import type {PricingDocument, ValidationResult} from './types'

export function validatePricing(pricing: PricingDocument): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

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

  return {errors, warnings}
}
