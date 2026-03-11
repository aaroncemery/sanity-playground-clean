import Link from 'next/link'
import {ValidatorPlayground} from '@/components/Admin/ValidatorPlayground'

export default function ValidatorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-bh-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-bh-gold">🍔 Burger Haven</h1>
              <p className="text-gray-400 text-sm">🧪 Shared Validator Playground</p>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                ← Dashboard
              </Link>
              <Link href="/admin/validation" className="text-gray-400 hover:text-white transition-colors">
                Function Demo →
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            🧪 Shared Validator Playground
          </h2>
          <p className="text-gray-600 text-lg">
            Before today, validation logic lived inside Sanity&apos;s <code className="bg-gray-100 px-1 rounded">Rule</code> builder callbacks —
            untestable without a Sanity context. Now it&apos;s in a shared package.
          </p>
          <p className="text-gray-500 mt-2">
            The validators running below are the <strong>same functions</strong> that run in the Sanity Function when your PIM hits the API.
            No mock. No stub. The real code.
          </p>
        </div>

        {/* Architecture callout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: '🖥️',
              label: 'Studio (UI)',
              desc: 'Rule.custom() wrappers call the same functions. Errors block saving.',
              color: 'border-blue-300 bg-blue-50',
              textColor: 'text-blue-700',
            },
            {
              icon: '⚡',
              label: 'Function (API)',
              desc: 'validateProduct() runs server-side on every write. Throws to block the mutation.',
              color: 'border-green-300 bg-green-50',
              textColor: 'text-green-700',
            },
            {
              icon: '🧪',
              label: 'Tests (CI)',
              desc: 'Pure functions. No Sanity imports. 24 tests run in < 1 second.',
              color: 'border-purple-300 bg-purple-50',
              textColor: 'text-purple-700',
            },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl border-2 p-4 ${item.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{item.icon}</span>
                <span className={`font-bold text-sm ${item.textColor}`}>{item.label}</span>
              </div>
              <p className={`text-xs ${item.textColor}`}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <ValidatorPlayground />
        </div>

        {/* Link to the Function demo */}
        <div className="bg-white rounded-xl shadow p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">See it block a real API write</p>
            <p className="text-sm text-gray-500">
              The Function Demo shows the same logic rejecting a write to the Sanity API — not just a UI preview.
            </p>
          </div>
          <Link
            href="/admin/validation"
            className="bg-bh-red hover:bg-bh-red-dark text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ml-4"
          >
            ⚡ Function Demo →
          </Link>
        </div>
      </main>
    </div>
  )
}
