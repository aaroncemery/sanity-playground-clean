/**
 * Re-creates the custom-ID seeded docs under single-segment UUIDs so they
 * match the dataset ACL `_id in path("*")` and become publicly readable.
 */
import {createClient} from '@sanity/client'
import {randomUUID} from 'node:crypto'

const PROJECT_ID = 'a09jbdjz'

const TOKEN =
  process.env.SANITY_API_TOKEN ?? process.env.SANITY_CUSTOMER_CONTENT_WRITE_TOKEN
if (!TOKEN) {
  console.error('Missing SANITY_API_TOKEN / SANITY_CUSTOMER_CONTENT_WRITE_TOKEN')
  process.exit(1)
}

const catalog = createClient({
  projectId: PROJECT_ID,
  dataset: 'productcatalog',
  apiVersion: '2025-02-24',
  token: TOKEN,
  useCdn: false,
})

const content = createClient({
  projectId: PROJECT_ID,
  dataset: 'customercontent',
  apiVersion: '2025-02-24',
  token: TOKEN,
  useCdn: false,
})

const oldProductIds = [
  'product.iced-lemonade',
  'product.cold-brew',
  'product.vanilla-shake',
  'product.fountain-cola',
  'product.brownie',
  'product.apple-pie',
  'product.mozz-sticks',
]
const oldMenuIds = [
  'menuItem.iced-lemonade',
  'menuItem.cold-brew',
  'menuItem.vanilla-shake',
  'menuItem.fountain-cola',
  'menuItem.brownie',
  'menuItem.apple-pie',
  'menuItem.mozz-sticks',
]

async function main() {
  // Fetch existing dotted-id docs
  const oldProducts = await catalog.getDocuments(oldProductIds)
  const oldMenus = await content.getDocuments(oldMenuIds)

  const productIdMap = new Map<string, string>()

  // Re-create products with UUID ids
  const productTx = catalog.transaction()
  oldProducts.forEach((doc) => {
    if (!doc) return
    const newId = randomUUID()
    productIdMap.set(doc._id, newId)
    const {_id: _omit, _rev: _omitRev, _createdAt: _omitC, _updatedAt: _omitU, ...rest} = doc
    void _omit
    void _omitRev
    void _omitC
    void _omitU
    productTx.create({...rest, _id: newId})
    productTx.delete(doc._id)
  })
  const productResult = await productTx.commit()
  console.log(`✅ Re-created ${productIdMap.size} products with UUID ids`)
  void productResult

  // Re-create menuItems with UUID ids and updated cross-dataset refs
  const menuTx = content.transaction()
  let menuCount = 0
  oldMenus.forEach((doc) => {
    if (!doc) return
    const newId = randomUUID()
    const {_id: _omit, _rev: _omitRev, _createdAt: _omitC, _updatedAt: _omitU, ...rest} = doc
    void _omit
    void _omitRev
    void _omitC
    void _omitU
    const oldRef = (rest as Record<string, unknown>).product as
      | {_ref?: string; [k: string]: unknown}
      | undefined
    const newProductRef = oldRef?._ref ? productIdMap.get(oldRef._ref) : undefined
    if (oldRef && newProductRef) {
      ;(rest as Record<string, unknown>).product = {...oldRef, _ref: newProductRef}
    }
    menuTx.create({...rest, _id: newId})
    menuTx.delete(doc._id)
    menuCount++
  })
  await menuTx.commit()
  console.log(`✅ Re-created ${menuCount} menu items with UUID ids`)

  console.log('\nEmbeddings will recompute (~1 min). Reload the cart-demo page after.')
}

main().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
