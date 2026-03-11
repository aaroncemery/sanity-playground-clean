import type {NutritionFacts, ProductDocument, ValidationResult} from './types'

export function validateSku(sku: string | undefined): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!sku) {
    errors.push('❌ REQUIRED: SKU is required for all products')
  } else if (!/^[A-Z]{2}\d{4}$/.test(sku)) {
    errors.push(
      `❌ FORMAT ERROR: SKU "${sku}" is invalid. Must be format XX0000 (e.g., BH1001, CH2001)`,
    )
  }

  return {errors, warnings}
}

export function validateAllergens(allergens: string[] | undefined): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!allergens || allergens.length === 0) {
    errors.push(
      '⚠️ COMPLIANCE VIOLATION: Allergen information is REQUIRED for all food products. ' +
        'This is a legal requirement and cannot be bypassed.',
    )
  }

  return {errors, warnings}
}

export function validateNutritionFacts(facts: NutritionFacts | undefined): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!facts) {
    errors.push(
      '⚠️ COMPLIANCE VIOLATION: Nutrition facts are REQUIRED. ' +
        'Missing this data violates FDA regulations.',
    )
    return {errors, warnings}
  }

  const {calories, protein, carbs, fat, sodium} = facts

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

  return {errors, warnings}
}

export function validateBasePrice(price: number | undefined): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (price === undefined || price === null) {
    errors.push('❌ REQUIRED: Base price is required')
  } else if (price <= 0) {
    errors.push('❌ INVALID: Base price must be greater than $0')
  } else if (price > 100) {
    warnings.push(
      '⚠️ WARNING: Base price over $100 is unusual for QSR menu items. Please verify with PIM.',
    )
  }

  return {errors, warnings}
}

/** Validates the calories sub-field within nutritionFacts */
export function validateCalories(calories: number | undefined): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (calories === undefined || calories === null) {
    errors.push('❌ REQUIRED: Calorie count is required')
  } else if (calories < 0) {
    errors.push('❌ INVALID: Calories cannot be negative')
  } else if (calories > 3000) {
    errors.push('❌ INVALID: Calories cannot exceed 3000 — verify with PIM source')
  }

  return {errors, warnings}
}

/** Validates a nutrition macro sub-field (protein, carbs, fat, sodium) — must be >= 0 */
export function validateNutritionMacro(
  value: number | undefined,
  fieldName: string,
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (value !== undefined && value < 0) {
    errors.push(`❌ INVALID: ${fieldName} cannot be negative`)
  }

  return {errors, warnings}
}

export function validateProductName(name: string | undefined): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!name || name.trim().length === 0) {
    errors.push('❌ REQUIRED: Product name is required')
  }

  return {errors, warnings}
}

export function validateProduct(product: ProductDocument): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const merge = (result: ValidationResult) => {
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  }

  merge(validateAllergens(product.allergens))
  merge(validateNutritionFacts(product.nutritionFacts))
  merge(validateSku(product.sku))
  merge(validateBasePrice(product.basePrice))
  merge(validateProductName(product.name))

  if (!product.category) {
    errors.push('❌ REQUIRED: Product must have a category assigned')
  }

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

  return {errors, warnings}
}
