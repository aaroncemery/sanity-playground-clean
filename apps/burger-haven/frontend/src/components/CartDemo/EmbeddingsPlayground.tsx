'use client'

import {useState} from 'react'
import Image from 'next/image'
import {contentClient, urlForContentImage} from '@/lib/sanity'
import {EMBEDDINGS_RECOMMENDATIONS_QUERY} from '@/lib/queries'
import type {EmbeddingsRecommendation} from '@/lib/types'

const EXAMPLE_QUERIES = [
  'something cold and refreshing to drink',
  'a quick crispy side under five dollars',
  'breakfast item with eggs and bacon',
  'sweet dessert to finish the meal',
  'spicy chicken sandwich',
]

export function EmbeddingsPlayground() {
  const [query, setQuery] = useState(EXAMPLE_QUERIES[0])
  const [results, setResults] = useState<EmbeddingsRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)

  async function runQuery() {
    setLoading(true)
    setError(null)
    const start = performance.now()
    try {
      const data = await contentClient.fetch<EmbeddingsRecommendation[]>(
        EMBEDDINGS_RECOMMENDATIONS_QUERY,
        {cartContext: query},
      )
      setResults(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(
        msg.includes('embeddings') || msg.includes('semantic')
          ? 'Dataset Embeddings not enabled on customercontent. Enable on the Growth+ plan to run semantic queries.'
          : msg,
      )
      setResults([])
    } finally {
      setLatencyMs(performance.now() - start)
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-bh-dark text-lg">
              Embeddings Playground
            </h2>
            <p className="text-xs text-bh-gray">
              Test <code className="font-mono">text::semanticSimilarity</code> against the
              menuItem corpus. This is what would replace JitB&apos;s rec engine.
            </p>
          </div>
          <span className="text-2xl">🧠</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe the cart context..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-bh-red focus:outline-none focus:ring-2 focus:ring-bh-red/20"
            onKeyDown={(e) => e.key === 'Enter' && runQuery()}
          />
          <button
            onClick={runQuery}
            disabled={loading || !query.trim()}
            className="px-4 py-2 rounded-lg bg-bh-red hover:bg-bh-red-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="text-[11px] px-2 py-1 rounded-full bg-gray-100 hover:bg-bh-red/10 hover:text-bh-red text-bh-gray transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {latencyMs !== null && (
          <p className="text-[11px] text-bh-gray font-mono">
            Last query:{' '}
            <span
              className={
                latencyMs < 200
                  ? 'text-emerald-600'
                  : latencyMs < 600
                    ? 'text-amber-600'
                    : 'text-red-600'
              }
            >
              {latencyMs.toFixed(0)}ms
            </span>
          </p>
        )}

        {error && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            <p className="font-bold mb-1">⚠️ {error}</p>
            <p className="text-amber-800">
              The cart demo above falls back to manual <code>suggestedProducts</code> on
              the rule when embeddings are unavailable.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {results.map((r) => {
              const url = r.heroImage
                ? urlForContentImage(r.heroImage).width(160).height(160).fit('crop').url()
                : null
              return (
                <div
                  key={r._id}
                  className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 bg-gray-50"
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300 shrink-0">
                    {url ? (
                      <Image
                        src={url}
                        alt={r.marketingName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-bh-dark truncate">
                      {r.marketingName}
                    </p>
                    {r.tagline && (
                      <p className="text-[10px] text-bh-gray truncate">{r.tagline}</p>
                    )}
                    <p className="text-[10px] font-mono text-indigo-600 mt-0.5">
                      score: {r._score.toFixed(4)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
