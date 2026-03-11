import Link from 'next/link'
import Image from 'next/image'
import {contentClient} from '@/lib/sanity'
import {urlForContentImage} from '@/lib/imageUrl'
import {MENU_ITEMS_WITH_IMAGES_QUERY} from '@/lib/queries'

export const revalidate = 60

interface ImageItem {
  _id: string
  marketingName: string
  imageRef: string | null
  imageResolvedUrl: string | null
  imageAlt: string | null
}

export default async function ImageUrlDemoPage() {
  const items = await contentClient.fetch<ImageItem[]>(MENU_ITEMS_WITH_IMAGES_QUERY)

  // Build URLs from _ref client-side — no extra API call
  const withBuiltUrls = items.map((item) => ({
    ...item,
    builtUrl: item.imageRef
      ? urlForContentImage(item.imageRef).width(400).height(300).fit('crop').url()
      : null,
    resolvedUrl: item.imageResolvedUrl ?? null,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-bh-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-bh-gold">🍔 Burger Haven</h1>
              <p className="text-gray-400 text-sm">🖼️ Image URL Deep Dive</p>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                ← Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            🖼️ Does <code className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-2xl">@sanity/image-url</code> make an extra API call?
          </h2>
          <p className="text-gray-600 text-lg">
            Short answer: <strong className="text-green-700">No.</strong> The URL is constructed entirely from the <code className="bg-gray-100 px-1 rounded">_ref</code> string — no network request is made.
          </p>
        </div>

        {/* The explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-blue-400">
            <h3 className="font-bold text-gray-900 mb-2">🔑 How a Sanity image _ref works</h3>
            <p className="text-sm text-gray-600 mb-3">
              A Sanity image asset reference like:
            </p>
            <code className="block bg-gray-50 border rounded p-3 text-xs text-gray-700 break-all mb-3">
              image-<span className="text-blue-600">abc123def456</span>-<span className="text-green-600">800x600</span>-<span className="text-orange-600">jpg</span>
            </code>
            <p className="text-sm text-gray-600">
              Already encodes <strong>everything</strong> needed to construct the CDN URL:
            </p>
            <ul className="mt-2 text-xs text-gray-600 space-y-1">
              <li><span className="text-blue-600 font-mono">abc123def456</span> → asset hash / file identity</li>
              <li><span className="text-green-600 font-mono">800x600</span> → original dimensions</li>
              <li><span className="text-orange-600 font-mono">jpg</span> → format</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              The builder parses this string and assembles the URL <strong>entirely on the client</strong>.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-green-400">
            <h3 className="font-bold text-gray-900 mb-2">✅ Varnish proxy implications</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-2">
                <span className="text-green-600 font-bold shrink-0">1 req</span>
                <span>Browser requests <code className="bg-gray-100 px-1 rounded text-xs">cdn.sanity.io/images/…</code></span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-500 font-bold shrink-0 line-through">2 req</span>
                <span className="line-through text-gray-400">No hidden lookup to resolve the _ref first</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                <p className="text-xs text-green-700 font-medium">
                  Your Varnish proxy will see exactly 1 cacheable request per image, never 2. The builder is a pure string operation.
                </p>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Two patterns — same result:</p>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-gray-400">// Pattern A — builder from _ref</span>
                  <div className="bg-gray-50 rounded p-2 mt-1 text-gray-700">urlForContentImage(ref).width(400).url()</div>
                </div>
                <div>
                  <span className="text-gray-400">// Pattern B — asset-{'>'} in GROQ</span>
                  <div className="bg-gray-50 rounded p-2 mt-1 text-gray-700">heroImage {'{'} asset-{'>'}{'{'}url{'}'} {'}'}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Pattern B skips the builder entirely — the URL comes back in the GROQ response.
              </p>
            </div>
          </div>
        </div>

        {/* Live image examples */}
        {withBuiltUrls.length > 0 ? (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Live examples from the content dataset</h3>
            <p className="text-sm text-gray-500 mb-6">
              One GROQ query fetched both the raw <code className="bg-gray-100 px-1 rounded">_ref</code> and the resolved <code className="bg-gray-100 px-1 rounded">asset-{'>'}.url</code>. The builder URL is constructed on this server — no additional requests were made.
            </p>

            <div className="space-y-6">
              {withBuiltUrls.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <p className="font-semibold text-gray-900">{item.marketingName}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x">
                    {/* The image */}
                    <div className="p-4 flex flex-col items-center gap-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rendered Image</p>
                      {item.builtUrl ? (
                        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={item.builtUrl}
                            alt={item.imageAlt ?? item.marketingName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Pattern A: from _ref */}
                    <div className="p-4">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                        Pattern A — builder from _ref
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Raw <code className="bg-gray-100 px-1 rounded">_ref</code> from GROQ:
                      </p>
                      <code className="block bg-gray-50 border rounded p-2 text-xs text-gray-700 break-all mb-3">
                        {item.imageRef ?? '—'}
                      </code>
                      <p className="text-xs text-gray-500 mb-2">URL built client-side (0 API calls):</p>
                      <code className="block bg-blue-50 border border-blue-100 rounded p-2 text-xs text-blue-800 break-all">
                        {item.builtUrl ?? '—'}
                      </code>
                    </div>

                    {/* Pattern B: asset-> */}
                    <div className="p-4">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                        Pattern B — asset→ in GROQ
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        URL returned directly from GROQ (no builder needed):
                      </p>
                      <code className="block bg-green-50 border border-green-100 rounded p-2 text-xs text-green-800 break-all mb-3">
                        {item.resolvedUrl ?? '—'}
                      </code>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500 font-mono">
                          {/* groq */ `heroImage { asset->{ url } }`}
                        </p>
                      </div>
                      {item.builtUrl && item.resolvedUrl && (
                        <p className="text-xs text-green-700 mt-2 font-medium">
                          {item.builtUrl.split('?')[0] === item.resolvedUrl
                            ? '✅ Same base URL as Pattern A'
                            : 'ℹ️ Same image, different parameters'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No menu items with images found</p>
            <p className="text-sm">Add <code className="bg-gray-100 px-1 rounded">heroImage</code> to a menuItem in the Content workspace to see examples here.</p>
          </div>
        )}

        {/* Source callout */}
        <div className="mt-8 bg-gray-900 text-gray-100 rounded-xl p-6">
          <p className="text-xs text-gray-400 mb-2 font-mono">src/lib/imageUrl.ts</p>
          <pre className="text-xs text-green-400 overflow-x-auto">{`// Build an image URL from a _ref string or image object. No API call made.
export function urlForContentImage(source: SanityImageSource) {
  return contentBuilder.image(source)
}

// If your GROQ query already projects asset->{ url },
// use the raw URL directly — skip the builder entirely.
export function buildImageUrlFromAsset(asset: { url: string } | null | undefined) {
  return asset?.url ?? null
}`}</pre>
        </div>
      </main>
    </div>
  )
}
