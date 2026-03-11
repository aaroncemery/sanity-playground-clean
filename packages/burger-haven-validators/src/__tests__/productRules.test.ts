// DEMO: Validations are now testable because logic is extracted from Sanity's Rule builder context.
// No Sanity imports. No mocking. Just functions and data.
import {describe, it, expect} from 'vitest'
import {
  validateSku,
  validateAllergens,
  validateNutritionFacts,
  validateBasePrice,
  validateProductName,
  validateProduct,
} from '../productRules'
import type {ProductDocument} from '../types'

// ---------------------------------------------------------------------------
// validateSku
// ---------------------------------------------------------------------------

describe('validateSku', () => {
  it('passes for a valid SKU — BH1001', () => {
    const result = validateSku('BH1001')
    expect(result.errors).toHaveLength(0)
  })

  it('passes for a valid SKU — CH2003 (real SKU from dataset)', () => {
    const result = validateSku('CH2003')
    expect(result.errors).toHaveLength(0)
  })

  it('rejects lowercase SKU', () => {
    const result = validateSku('bh1001')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('FORMAT ERROR')
  })

  it('rejects SKU that is too short', () => {
    const result = validateSku('BH10')
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('FORMAT ERROR')
  })

  it('rejects missing SKU', () => {
    const result = validateSku(undefined)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('REQUIRED')
  })
})

// ---------------------------------------------------------------------------
// validateAllergens
// ---------------------------------------------------------------------------

describe('validateAllergens', () => {
  it('passes for a valid allergens array', () => {
    const result = validateAllergens(['dairy', 'wheat'])
    expect(result.errors).toHaveLength(0)
  })

  it('rejects empty array — compliance violation', () => {
    const result = validateAllergens([])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('COMPLIANCE VIOLATION')
  })

  it('rejects missing allergens', () => {
    const result = validateAllergens(undefined)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('COMPLIANCE VIOLATION')
  })
})

// ---------------------------------------------------------------------------
// validateNutritionFacts
// ---------------------------------------------------------------------------

describe('validateNutritionFacts', () => {
  it('passes for a real product nutrition profile', () => {
    const result = validateNutritionFacts({
      calories: 820,
      protein: 52,
      carbs: 48,
      fat: 46,
      sodium: 1480,
    })
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('rejects missing nutrition facts entirely', () => {
    const result = validateNutritionFacts(undefined)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('COMPLIANCE VIOLATION')
  })

  it('warns on high sodium (> 2300mg) — not an error', () => {
    const result = validateNutritionFacts({calories: 500, sodium: 2500})
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toContain('Sodium')
  })

  it('warns when calorie math differs by > 100 from stated calories', () => {
    // protein 10*4=40, carbs 10*4=40, fat 10*9=90 → calculated=170, stated=500 → diff=330
    const result = validateNutritionFacts({calories: 500, protein: 10, carbs: 10, fat: 10})
    expect(result.errors).toHaveLength(0)
    expect(result.warnings.some((w) => w.includes('Calorie calculation'))).toBe(true)
  })

  it('warns on calories > 3000 — not an error', () => {
    const result = validateNutritionFacts({calories: 3500})
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toContain('Calories exceed 3000')
  })
})

// ---------------------------------------------------------------------------
// validateBasePrice
// ---------------------------------------------------------------------------

describe('validateBasePrice', () => {
  it('passes for a typical QSR price', () => {
    const result = validateBasePrice(8.49)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('rejects price of zero', () => {
    const result = validateBasePrice(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('INVALID')
  })

  it('rejects negative price', () => {
    const result = validateBasePrice(-1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('INVALID')
  })

  it('warns for price over $100 — not a hard error', () => {
    const result = validateBasePrice(150)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toContain('over $100')
  })

  it('rejects missing price', () => {
    const result = validateBasePrice(undefined)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('REQUIRED')
  })
})

// ---------------------------------------------------------------------------
// validateProduct (integration)
// ---------------------------------------------------------------------------

describe('validateProduct', () => {
  const validProduct: ProductDocument = {
    _id: 'product-bh1001',
    _type: 'product',
    sku: 'BH1001',
    name: 'Classic Burger',
    category: 'burgers',
    basePrice: 8.49,
    allergens: ['dairy', 'wheat'],
    nutritionFacts: {calories: 820, protein: 52, carbs: 48, fat: 46, sodium: 1480},
    pimProductId: 'PIM-001',
    pimMetadata: {syncSource: 'akeneo', syncStatus: 'synced'},
  }

  it('passes with no errors or warnings for a fully valid product', () => {
    const result = validateProduct(validProduct)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('returns two errors when allergens and nutritionFacts are both missing', () => {
    const product: ProductDocument = {
      ...validProduct,
      allergens: undefined,
      nutritionFacts: undefined,
    }
    const result = validateProduct(product)
    // One error for missing allergens, one for missing nutrition facts
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
    expect(result.errors.some((e) => e.includes('Allergen'))).toBe(true)
    expect(result.errors.some((e) => e.includes('Nutrition facts'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateProductName
// ---------------------------------------------------------------------------

describe('validateProductName', () => {
  it('passes for a normal product name', () => {
    const result = validateProductName('Classic Burger')
    expect(result.errors).toHaveLength(0)
  })

  it('rejects empty string', () => {
    const result = validateProductName('')
    expect(result.errors).toHaveLength(1)
  })

  it('rejects whitespace-only string', () => {
    const result = validateProductName('   ')
    expect(result.errors).toHaveLength(1)
  })

  it('rejects missing name', () => {
    const result = validateProductName(undefined)
    expect(result.errors).toHaveLength(1)
  })
})
