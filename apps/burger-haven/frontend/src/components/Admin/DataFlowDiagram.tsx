export function DataFlowDiagram() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Architecture: Data Flow</h2>
      <div className="overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max text-sm">
          {/* External PIM */}
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🏭</div>
            <div className="font-bold text-gray-700">External PIM</div>
            <div className="text-xs text-gray-500">Akeneo / Salsify</div>
          </div>

          {/* Arrow with label */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-gray-500">API writes</div>
            <div className="text-xl text-gray-400">→</div>
          </div>

          {/* Product Catalog */}
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">📦</div>
            <div className="font-bold text-blue-700">Product Catalog</div>
            <div className="text-xs text-blue-500">productcatalog dataset</div>
            <div className="mt-1 bg-blue-100 rounded px-2 py-0.5">
              <span className="text-xs font-medium text-blue-700">⚡ Functions validate ALL writes</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-gray-500">cross-dataset refs</div>
            <div className="text-xl text-gray-400">→</div>
          </div>

          {/* Customer Content */}
          <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">✨</div>
            <div className="font-bold text-purple-700">Customer Content</div>
            <div className="text-xs text-purple-500">customercontent dataset</div>
            <div className="mt-1 text-xs text-gray-500">+ Marketing enrichment</div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-gray-500">published to</div>
            <div className="text-xl text-gray-400">→</div>
          </div>

          {/* Apps */}
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">📱</div>
            <div className="font-bold text-green-700">Customer Apps</div>
            <div className="text-xs text-green-500">Web / Mobile / Kiosk</div>
          </div>
        </div>
      </div>

      {/* Key callouts */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700">📦 Product Catalog Dataset</p>
          <p className="text-xs text-blue-600 mt-1">
            Written by external PIM via API. Functions enforce allergen, nutrition, and pricing rules
            on <strong>every</strong> write — even API calls.
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-purple-700">✨ Customer Content Dataset</p>
          <p className="text-xs text-purple-600 mt-1">
            Written by marketing team. Cross-dataset references link to product catalog without
            duplicating data. Marketing adds images, taglines, promotions.
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-orange-700">⚡ Functions (Critical)</p>
          <p className="text-xs text-orange-600 mt-1">
            Solve the #1 customer problem: &ldquo;Business rules can be bypassed via API.&rdquo; Functions
            run server-side on every write, so PIM cannot skip compliance checks.
          </p>
        </div>
      </div>
    </div>
  )
}
