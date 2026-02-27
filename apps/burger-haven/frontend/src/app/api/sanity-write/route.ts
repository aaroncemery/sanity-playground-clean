import {NextRequest, NextResponse} from 'next/server'
import {catalogWriteClient} from '@/lib/sanity'

/**
 * API route that simulates an external PIM writing to Sanity.
 *
 * Validates the payload using the same rules as the Sanity Function
 * (validate-catalog-writes.ts) before writing to Sanity. This mirrors
 * what the deployed Function would enforce server-side on every write.
 */

interface ProductBody {
  _type: 'product'
  sku?: string
  name?: string
  category?: string
  basePrice?: number
  allergens?: string[]
  nutritionFacts?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    sodium?: number
  }
}

function validateProduct(body: ProductBody): string[] {
  const errors: string[] = []

  if (!body.allergens || body.allergens.length === 0) {
    errors.push(
      '⚠️ COMPLIANCE VIOLATION: Allergen information is REQUIRED for all food products. This is a legal requirement and cannot be bypassed.',
    )
  }

  if (!body.nutritionFacts) {
    errors.push(
      '⚠️ COMPLIANCE VIOLATION: Nutrition facts are REQUIRED. Missing this data violates FDA regulations.',
    )
  }

  if (!body.sku) {
    errors.push('❌ REQUIRED: SKU is required for all products')
  } else if (!/^[A-Z]{2}\d{4}$/.test(body.sku)) {
    errors.push(
      `❌ FORMAT ERROR: SKU "${body.sku}" is invalid. Must be format XX0000 (e.g., BH1001, CH2001)`,
    )
  }

  if (body.basePrice === undefined || body.basePrice === null) {
    errors.push('❌ REQUIRED: Base price is required')
  } else if (body.basePrice <= 0) {
    errors.push('❌ INVALID: Base price must be greater than $0')
  }

  if (!body.category) {
    errors.push('❌ REQUIRED: Product must have a category assigned')
  }

  if (!body.name || body.name.trim().length === 0) {
    errors.push('❌ REQUIRED: Product name is required')
  }

  return errors
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body._type) {
      return NextResponse.json({error: 'Missing _type field'}, {status: 400})
    }

    // Run the same validation rules as the Sanity Function
    if (body._type === 'product') {
      const errors = validateProduct(body as ProductBody)

      if (errors.length > 0) {
        const errorMessage = [
          '🚫 PRODUCT VALIDATION FAILED',
          '',
          ...errors,
          '',
          '---',
          'This write has been rejected to maintain data quality and compliance.',
          'Please correct the errors in your PIM system and retry the sync.',
        ].join('\n')

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            validationErrors: errors,
            type: 'validation_error',
            note: 'This write was rejected by validation rules. When the Sanity Function is deployed, the same rejection happens server-side on every write — including direct API calls from the external PIM.',
          },
          {status: 422},
        )
      }
    }

    // Validation passed — write to Sanity
    const doc = await catalogWriteClient.create(body)

    return NextResponse.json({
      success: true,
      documentId: doc._id,
      message: 'Document created successfully — validation passed',
      document: doc,
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error')

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: 'api_error',
        note: 'API error occurred',
      },
      {status: 500},
    )
  }
}
