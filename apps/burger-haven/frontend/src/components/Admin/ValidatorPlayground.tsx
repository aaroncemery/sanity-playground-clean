'use client'

import {useState, useCallback} from 'react'
import {
  validateProduct,
  validateSku,
  validateProductName,
  validateBasePrice,
  validateAllergens,
  validateNutritionFacts,
} from '@repo/burger-haven-validators'
import type {ProductDocument, ValidationResult} from '@repo/burger-haven-validators'

const ALLERGEN_OPTIONS = [
  {label: '🥛 Dairy', value: 'dairy'},
  {label: '🌾 Wheat', value: 'wheat'},
  {label: '🫘 Soy', value: 'soy'},
  {label: '🌰 Tree Nuts', value: 'treeNuts'},
  {label: '🥚 Eggs', value: 'eggs'},
  {label: '✅ None', value: 'none'},
]

const CATEGORY_OPTIONS = [
  {label: '— select —', value: ''},
  {label: 'Signature Burgers', value: 'burgers'},
  {label: 'Chicken & Sandwiches', value: 'chicken'},
  {label: 'Breakfast', value: 'breakfast'},
  {label: 'Sides & Apps', value: 'sides'},
  {label: 'Drinks & Desserts', value: 'drinks'},
]

const EMPTY: ValidationResult = {errors: [], warnings: []}

function ResultBadge({result}: {result: ValidationResult}) {
  if (result.errors.length === 0 && result.warnings.length === 0) {
    return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ valid</span>
  }
  if (result.errors.length > 0) {
    return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">✗ {result.errors.length} error{result.errors.length > 1 ? 's' : ''}</span>
  }
  return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⚠ {result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}</span>
}

function FieldMessages({result}: {result: ValidationResult}) {
  if (result.errors.length === 0 && result.warnings.length === 0) return null
  return (
    <div className="mt-1 space-y-1">
      {result.errors.map((e, i) => (
        <p key={i} className="text-xs text-red-600">{e}</p>
      ))}
      {result.warnings.map((w, i) => (
        <p key={i} className="text-xs text-yellow-600">{w}</p>
      ))}
    </div>
  )
}

export function ValidatorPlayground() {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [calories, setCalories] = useState('')
  const [allergens, setAllergens] = useState<string[]>([])

  const toggleAllergen = useCallback((value: string) => {
    setAllergens((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
    )
  }, [])

  // Build the document shape from form state
  const doc: ProductDocument = {
    _id: 'playground',
    _type: 'product',
    sku: sku || undefined,
    name: name || undefined,
    category: category || undefined,
    basePrice: basePrice !== '' ? parseFloat(basePrice) : undefined,
    allergens: allergens.length > 0 ? allergens : undefined,
    nutritionFacts:
      calories !== ''
        ? {calories: parseFloat(calories)}
        : undefined,
  }

  // Run all validators — this is pure JS, no Sanity connection, no API call
  const skuResult = sku !== '' ? validateSku(sku) : EMPTY
  const nameResult = name !== '' ? validateProductName(name) : EMPTY
  const priceResult = basePrice !== '' ? validateBasePrice(parseFloat(basePrice)) : EMPTY
  const allergenResult = allergens.length > 0 ? validateAllergens(allergens) : EMPTY
  const nutritionResult =
    calories !== '' ? validateNutritionFacts({calories: parseFloat(calories)}) : EMPTY

  const fullResult = validateProduct(doc)
  const hasAnyInput = sku || name || category || basePrice || calories || allergens.length > 0

  const inputClass = (result: ValidationResult) => {
    if (result.errors.length > 0) return 'border-red-300 bg-red-50 focus:ring-red-300'
    if (result.warnings.length > 0) return 'border-yellow-300 bg-yellow-50 focus:ring-yellow-300'
    return 'border-gray-300 focus:ring-bh-gold'
  }

  return (
    <div className="space-y-8">
      {/* The callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <p className="font-semibold text-blue-900 mb-1">
          ⚡ This validation is running in your browser right now
        </p>
        <p className="text-sm text-blue-700">
          The same <code className="bg-blue-100 px-1 rounded">validateProduct()</code> function
          you see below is imported from <code className="bg-blue-100 px-1 rounded">@repo/burger-haven-validators</code> —
          the shared package. When your PIM hits the Sanity API, the server-side Function calls
          the identical function. One source of truth.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-5">
          <h3 className="font-bold text-gray-900">Build a product</h3>

          {/* SKU */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">SKU</label>
              <ResultBadge result={skuResult} />
            </div>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. BH1001 or bh1001"
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 transition-colors ${inputClass(skuResult)}`}
            />
            <FieldMessages result={skuResult} />
            <p className="text-xs text-gray-400 mt-1">Format: two uppercase letters + four digits (XX0000)</p>
          </div>

          {/* Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <ResultBadge result={nameResult} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Classic Burger"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${inputClass(nameResult)}`}
            />
            <FieldMessages result={nameResult} />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bh-gold"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Base price */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Base Price ($)</label>
              <ResultBadge result={priceResult} />
            </div>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="e.g. 8.49"
              step="0.01"
              min="0"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${inputClass(priceResult)}`}
            />
            <FieldMessages result={priceResult} />
          </div>

          {/* Allergens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Allergens</label>
              <ResultBadge result={allergenResult} />
            </div>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleAllergen(o.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    allergens.includes(o.value)
                      ? 'bg-bh-dark text-white border-bh-dark'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <FieldMessages result={allergenResult} />
          </div>

          {/* Calories */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Calories</label>
              <ResultBadge result={nutritionResult} />
            </div>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 820 or 3500 to trigger a warning"
              min="0"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${inputClass(nutritionResult)}`}
            />
            <FieldMessages result={nutritionResult} />
          </div>
        </div>

        {/* Full result */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4">validateProduct() result</h3>

          {!hasAnyInput ? (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
              <p className="text-lg mb-1">Start filling in the form</p>
              <p className="text-sm">Results appear here in real time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className={`rounded-xl p-4 border-2 ${
                fullResult.errors.length > 0
                  ? 'bg-red-50 border-red-200'
                  : fullResult.warnings.length > 0
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {fullResult.errors.length > 0 ? '🚫' : fullResult.warnings.length > 0 ? '⚠️' : '✅'}
                  </span>
                  <span className={`font-bold ${
                    fullResult.errors.length > 0
                      ? 'text-red-800'
                      : fullResult.warnings.length > 0
                      ? 'text-yellow-800'
                      : 'text-green-800'
                  }`}>
                    {fullResult.errors.length > 0
                      ? `REJECTED — ${fullResult.errors.length} error${fullResult.errors.length > 1 ? 's' : ''}`
                      : fullResult.warnings.length > 0
                      ? `ACCEPTED with ${fullResult.warnings.length} warning${fullResult.warnings.length > 1 ? 's' : ''}`
                      : 'ACCEPTED — all checks passed'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  This is the same decision the Function makes on a PIM API write.
                </p>
              </div>

              {/* Errors */}
              {fullResult.errors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Errors (block the write)</p>
                  <ul className="space-y-1">
                    {fullResult.errors.map((e, i) => (
                      <li key={i} className="text-sm text-red-700 bg-red-50 rounded px-3 py-2">{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {fullResult.warnings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">Warnings (non-blocking)</p>
                  <ul className="space-y-1">
                    {fullResult.warnings.map((w, i) => (
                      <li key={i} className="text-sm text-yellow-700 bg-yellow-50 rounded px-3 py-2">{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Raw JSON */}
              <details className="group">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  View document being validated
                </summary>
                <pre className="mt-2 bg-gray-900 text-green-400 text-xs rounded-lg p-4 overflow-x-auto">
                  {JSON.stringify(doc, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Code snippet */}
          <div className="mt-6 bg-gray-900 text-gray-100 rounded-xl p-5">
            <p className="text-xs text-gray-400 mb-2 font-mono">Same import used in the Function:</p>
            <pre className="text-xs text-green-400">{`import { validateProduct } from '@repo/burger-haven-validators'

// In the Sanity Function (server-side):
const { errors, warnings } = validateProduct(document)
if (errors.length > 0) throw new Error(...)

// In the browser (client-side, this page):
const { errors, warnings } = validateProduct(formData)`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
