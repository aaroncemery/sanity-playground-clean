'use client'

import {useState} from 'react'

interface WriteResult {
  success: boolean
  message: string
  details?: Record<string, unknown>
}

const VALID_PRODUCT = {
  _type: 'product',
  sku: 'BH9999',
  name: 'Demo Test Burger',
  category: 'burgers',
  basePrice: 8.99,
  allergens: ['dairy', 'wheat', 'soy'],
  nutritionFacts: {
    calories: 650,
    protein: 35,
    carbs: 45,
    fat: 28,
    sodium: 980,
  },
  pimMetadata: {
    syncSource: 'demo',
    syncStatus: 'synced',
    lastSyncedAt: '2025-01-01T00:00:00.000Z',
  },
}

const INVALID_PRODUCT = {
  _type: 'product',
  sku: 'BH9998',
  name: 'Invalid Test Burger',
  category: 'burgers',
  basePrice: 8.99,
  // ❌ Missing allergens
  // ❌ Missing nutritionFacts
  // ❌ Missing pimProductId
}

export function ValidationDemo() {
  const [loading, setLoading] = useState<'valid' | 'invalid' | null>(null)
  const [result, setResult] = useState<WriteResult | null>(null)
  const [activePayload, setActivePayload] = useState<'valid' | 'invalid'>('valid')

  async function handleWrite(type: 'valid' | 'invalid') {
    setLoading(type)
    setResult(null)
    setActivePayload(type)

    const payload = type === 'valid' ? VALID_PRODUCT : INVALID_PRODUCT

    try {
      const response = await fetch('/api/sanity-write', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: 'Product created in Sanity — all validation rules passed.',
          details: data,
        })
      } else {
        setResult({
          success: false,
          message: data.note || data.error || 'Validation failed',
          details: data,
        })
      }
    } catch (err) {
      setResult({
        success: false,
        message: `❌ Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Context banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-bold text-blue-900 mb-1">🎯 Demo Context</h3>
        <p className="text-sm text-blue-700">
          This simulates an <strong>external PIM system</strong> writing product data to Sanity via
          API. The Sanity Function runs server-side on every write — including API calls that bypass
          Studio validation.
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleWrite('valid')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-semibold text-lg transition-colors duration-150 shadow-md"
        >
          {loading === 'valid' ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>✅</span>
          )}
          Write Valid Product
          <span className="text-sm font-normal opacity-80">(with allergens)</span>
        </button>

        <button
          onClick={() => handleWrite('invalid')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-semibold text-lg transition-colors duration-150 shadow-md"
        >
          {loading === 'invalid' ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>❌</span>
          )}
          Write Invalid Product
          <span className="text-sm font-normal opacity-80">(missing allergens)</span>
        </button>
      </div>

      {/* Payload display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            📤 Request Payload ({activePayload === 'valid' ? 'Valid' : 'Invalid'})
          </h3>
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-auto max-h-64">
            {JSON.stringify(activePayload === 'valid' ? VALID_PRODUCT : INVALID_PRODUCT, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">📥 Function Response</h3>
          {result ? (
            <div className="space-y-3">
              <div
                className={`rounded-xl p-4 ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p className={`font-bold text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.success ? '✅ Write ACCEPTED' : '🚫 Write REJECTED'}
                </p>
                <p className={`text-xs mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.message}
                </p>
              </div>
              {!result.success && result.details?.validationErrors && (
                <div className="bg-red-950 rounded-xl p-4 space-y-1">
                  {(result.details.validationErrors as string[]).map((err, i) => (
                    <p key={i} className="text-red-300 text-xs font-mono leading-relaxed">{err}</p>
                  ))}
                </div>
              )}
              {result.success && result.details && (
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-auto max-h-48">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300 h-full flex items-center justify-center">
              <p className="text-sm text-gray-400 text-center">
                Click a button above to see the Function response
              </p>
            </div>
          )}
        </div>
      </div>

      {/* What's happening explanation */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3">What just happened?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-green-700 mb-1">✅ Valid product write:</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Frontend calls <code className="bg-gray-200 px-1 rounded">/api/sanity-write</code></li>
              <li>Next.js API route writes to Sanity via Mutations API</li>
              <li>Sanity Function triggers on document create</li>
              <li>Function validates allergens ✅, nutrition ✅, SKU ✅</li>
              <li>Write succeeds — product appears in Studio</li>
            </ol>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700 mb-1">❌ Invalid product write:</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Frontend calls <code className="bg-gray-200 px-1 rounded">/api/sanity-write</code></li>
              <li>Next.js API route writes to Sanity via Mutations API</li>
              <li>Sanity Function triggers on document create</li>
              <li>Function detects missing allergens ❌ and nutrition ❌</li>
              <li>Function throws error — write is REJECTED</li>
              <li>PIM cannot bypass this — same rules apply to all API writes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
