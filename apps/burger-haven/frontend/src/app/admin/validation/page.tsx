import Link from 'next/link'
import {ValidationDemo} from '@/components/Admin/ValidationDemo'

export default function ValidationDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-bh-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-bh-gold">🍔 Burger Haven</h1>
              <p className="text-gray-400 text-sm">⚡ Functions Validation Demo</p>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                ← Dashboard
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Menu Board
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            ⚡ Functions Validation Demo
          </h2>
          <p className="text-gray-600 text-lg">
            The #1 customer problem: <em>&ldquo;We can limit business rules via UI, but they can be bypassed via
            API.&rdquo;</em>
          </p>
          <p className="text-gray-500 mt-2">
            This demo shows how Sanity Functions solve it — validation runs server-side on{' '}
            <strong>every write</strong>, including direct API calls from external PIM systems.
          </p>
        </div>

        {/* The demo */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <ValidationDemo />
        </div>

        {/* How it works - deep dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-900 mb-3">🔍 What the Function Validates</h3>
            <div className="space-y-2">
              {[
                {icon: '⚠️', label: 'Allergen info (FDA compliance)', critical: true},
                {icon: '⚠️', label: 'Nutrition facts (FDA compliance)', critical: true},
                {icon: '❌', label: 'SKU format (XX0000 pattern)', critical: false},
                {icon: '❌', label: 'Price range ($0 – $100)', critical: false},
                {icon: '❌', label: 'Category assignment', critical: false},
                {icon: '❌', label: 'Product name', critical: false},
                {icon: '⚠️', label: 'PIM metadata (warnings only)', critical: false},
              ].map((rule) => (
                <div key={rule.label} className="flex items-center gap-2 text-sm">
                  <span>{rule.icon}</span>
                  <span className={rule.critical ? 'font-semibold text-red-700' : 'text-gray-700'}>
                    {rule.label}
                  </span>
                  {rule.critical && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      blocks write
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-gray-900 mb-3">💬 Customer Quote</h3>
            <blockquote className="border-l-4 border-bh-gold pl-4 italic text-gray-600 text-sm">
              &ldquo;We can limit business rules via UI, but then it can be bypassed via an API.
              Functions should solve this but the team isn&apos;t familiar with them.&rdquo;
            </blockquote>
            <p className="text-xs text-gray-500 mt-2">— VP Engineering, QSR Customer</p>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-green-700">Sanity&apos;s Answer:</p>
              <p className="text-xs text-green-600 mt-1">
                Functions run server-side as document event handlers. They trigger on{' '}
                <strong>every mutation</strong> — Studio saves, API writes, webhook-triggered
                updates. There is no bypass.
              </p>
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Business impact prevented:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>🚫 No more allergen compliance violations</li>
                <li>🚫 No more missing nutrition information</li>
                <li>🚫 No more invalid prices in production</li>
                <li>🚫 No more products without categories</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
