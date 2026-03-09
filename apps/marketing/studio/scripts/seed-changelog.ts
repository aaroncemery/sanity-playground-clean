/**
 * Seed script for Changelog documents
 *
 * Usage:
 *   SANITY_API_TOKEN=<your-token> pnpm seed:changelog
 *   OR: npx tsx scripts/seed-changelog.ts
 *
 * Requires: SANITY_API_TOKEN environment variable
 */

import {createClient} from '@sanity/client'

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error(
    '❌  SANITY_API_TOKEN is not set.\n' +
      '   Export it before running this script:\n' +
      '   export SANITY_API_TOKEN=sk...\n',
  )
  process.exit(1)
}

const client = createClient({
  projectId: 'a09jbdjz',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function block(text: string) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2),
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: Math.random().toString(36).slice(2), text, marks: []}],
  }
}

function feature(
  title: string,
  description: string,
  badge: 'new' | 'improved' | 'studio' | 'api' | 'developer',
  docsUrl?: string,
) {
  return {
    _type: 'feature',
    _key: Math.random().toString(36).slice(2),
    title,
    description: [block(description)],
    badge,
    ...(docsUrl ? {docsUrl} : {}),
  }
}

// ---------------------------------------------------------------------------
// March 2026 — the 11 features being built in this session
// ---------------------------------------------------------------------------

const marchFeatures = [
  feature(
    'Typegen GA: end-to-end TypeScript types',
    'Sanity TypeGen is now generally available. Schema definitions and GROQ queries automatically produce strongly-typed TypeScript interfaces, eliminating entire classes of runtime errors and powering IDE autocompletion across your whole codebase.',
    'developer',
    'https://www.sanity.io/docs/sanity-typegen',
  ),
  feature(
    'Changelog document type (Platform Updates)',
    'A first-class changelog section lets content teams publish polished release notes directly from Studio. Features include badge taxonomy, rich-text descriptions, auto-generated slugs, and full SEO metadata.',
    'new',
  ),
  feature(
    'Portable Text auto-link on paste',
    'Paste any URL with text selected in a rich-text field and Studio instantly wraps the selection in a link annotation — no toolbar click required. The href field is auto-populated and the dialog opens pre-filled for final review.',
    'studio',
  ),
  feature(
    'Validation context in schema rules',
    'Custom validation rules now receive the full document via context.document, enabling conditional logic — for example, skipping SEO character-count warnings on pages marked noIndex.',
    'studio',
    'https://www.sanity.io/docs/validation',
  ),
  feature(
    'Multiple default panes per document type',
    'Configure any document type to open with additional side panels alongside the editor. This release ships a "Release Info" panel for changelogs and a "Content Checklist" panel for blog posts.',
    'studio',
  ),
  feature(
    'Conditional multi-schema references',
    'Reference fields can now restrict their allowed types at query time based on another field\'s value. On the Product document a "contentType" selector (Blog Post | Page) filters the reference picker dynamically.',
    'developer',
  ),
  feature(
    'Incoming references view',
    'A new "Incoming Refs" tab on Blog, Product, and Changelog documents lists every document that references the current one — invaluable for understanding content relationships before editing or deleting.',
    'studio',
  ),
  feature(
    'App SDK inside Studio (zero config)',
    'Build fully interactive dashboards and tools directly inside Studio using the Sanity App SDK. The new Content Dashboard shows live document counts per type using useClient() with no external setup.',
    'api',
    'https://www.sanity.io/docs/app-sdk',
  ),
  feature(
    'Semantic search (GROQ text::semanticSimilarity)',
    'A new /demos/search page showcases GROQ\'s text::semanticSimilarity() function for semantic search over blog content. Toggle between semantic and keyword (match) search to compare results side-by-side.',
    'api',
    'https://www.sanity.io/docs/similarity-search',
  ),
  feature(
    'Agent Context demo page',
    'A /demos/agent chat interface uses GROQ to retrieve relevant blog and changelog documents as context before calling an LLM, then surfaces a "Sources" section showing which documents were retrieved.',
    'new',
  ),
  feature(
    'GitHub Actions for Blueprints CI/CD',
    'A new deploy-blueprint.yml workflow automatically deploys the root sanity.blueprint.ts on every push to main using the official Sanity Blueprint GitHub Action.',
    'developer',
    'https://github.com/sanity-io/sanity-blueprint-action',
  ),
]

// ---------------------------------------------------------------------------
// February 2026 — placeholder entries to make the index feel real
// ---------------------------------------------------------------------------

const februaryFeatures = [
  feature(
    'Media Library improvements',
    'The Media Library now supports folder organisation, bulk tagging, and a redesigned search interface with type and date filters.',
    'improved',
  ),
  feature(
    'Live Content API (stable)',
    'The Live Content API is now stable and production-ready. Real-time document updates reach your frontend in under 100ms via server-sent events.',
    'api',
    'https://www.sanity.io/docs/live',
  ),
  feature(
    'Presentation Tool — click-to-edit overlays',
    'Visual editing overlays now render on every content element automatically when using next-sanity. No manual stega annotations required.',
    'studio',
  ),
  feature(
    'Turbopack support in the Next.js starter',
    'The official Next.js + Sanity starter now runs on Turbopack by default for faster local development and builds.',
    'improved',
  ),
]

// ---------------------------------------------------------------------------
// Create documents
// ---------------------------------------------------------------------------

async function seed() {
  console.log('🌱  Seeding changelog documents into production dataset…\n')

  const docs = [
    {
      _id: 'changelog-march-2026',
      _type: 'changelog',
      title: 'March 2026 Updates',
      slug: {_type: 'slug', current: 'updates/march-2026-updates'},
      releaseMonth: '2026-03-01T00:00:00.000Z',
      summary:
        'March 2026 brings major developer-experience improvements: GA TypeGen, conditional reference fields, multi-pane Studio layouts, an App SDK content dashboard, and two new interactive demo pages for semantic search and agent-assisted content exploration.',
      features: marchFeatures,
    },
    {
      _id: 'changelog-february-2026',
      _type: 'changelog',
      title: 'February 2026 Updates',
      slug: {_type: 'slug', current: 'updates/february-2026-updates'},
      releaseMonth: '2026-02-01T00:00:00.000Z',
      summary:
        'February 2026 stabilises the Live Content API, ships Media Library folder management, and makes click-to-edit visual overlays fully automatic in the Next.js integration.',
      features: februaryFeatures,
    },
  ]

  const ids: string[] = []

  for (const doc of docs) {
    try {
      const result = await client.createOrReplace(doc)
      console.log(`✅  Created: ${result._id}  (${doc.title})`)
      ids.push(result._id)
    } catch (err) {
      console.error(`❌  Failed to create ${doc._id}:`, err)
    }
  }

  console.log('\n📄  Created document IDs:')
  ids.forEach((id) => console.log(`   ${id}`))
  console.log('\n✨  Done! Remember to publish the documents in Studio to make them live.\n')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
