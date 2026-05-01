/**
 * Seeds additional menuItem + product documents to fill embeddings gaps.
 *
 * The original Burger Haven seed has only one drink (hot coffee), so semantic
 * queries like "cold refreshing drink" have nothing to match. This script
 * adds cold drinks, desserts, and a few extra sides — all with rich
 * descriptions so the embeddings model has real signal to rank against.
 *
 * Run from apps/burger-haven:
 *   SANITY_API_TOKEN=... pnpm dlx tsx scripts/seed-menu-items.ts
 */
import {createClient} from '@sanity/client'

const PROJECT_ID = 'a09jbdjz'

const catalog = (token: string) =>
  createClient({
    projectId: PROJECT_ID,
    dataset: 'productcatalog',
    apiVersion: '2025-02-24',
    token,
    useCdn: false,
  })

const content = (token: string) =>
  createClient({
    projectId: PROJECT_ID,
    dataset: 'customercontent',
    apiVersion: '2025-02-24',
    token,
    useCdn: false,
  })

interface SeedItem {
  productId: string
  menuItemId: string
  sku: string
  name: string
  category: 'drinks' | 'sides' | 'breakfast'
  basePrice: number
  allergens: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
  sodium: number
  ingredients: string[]
  marketingName: string
  tagline: string
  description: string
  badges: string[]
  displayOrder: number
}

const items: SeedItem[] = [
  {
    productId: 'product.iced-lemonade',
    menuItemId: 'menuItem.iced-lemonade',
    sku: 'DR1001',
    name: 'Iced Lemonade',
    category: 'drinks',
    basePrice: 2.99,
    allergens: ['none'],
    calories: 120,
    protein: 0,
    carbs: 32,
    fat: 0,
    sodium: 5,
    ingredients: ['water', 'lemon juice', 'cane sugar', 'ice'],
    marketingName: 'Fresh Iced Lemonade',
    tagline: 'Bright. Tart. Ice cold.',
    description:
      'A tall glass of fresh-squeezed lemonade poured over crushed ice. Cold, sweet, and tart — the most refreshing way to cool down on a hot day. Made with real lemons, never from concentrate.',
    badges: ['fresh'],
    displayOrder: 90,
  },
  {
    productId: 'product.cold-brew',
    menuItemId: 'menuItem.cold-brew',
    sku: 'DR1002',
    name: 'Cold Brew Coffee',
    category: 'drinks',
    basePrice: 3.49,
    allergens: ['none'],
    calories: 5,
    protein: 1,
    carbs: 0,
    fat: 0,
    sodium: 10,
    ingredients: ['filtered water', 'coarse-ground coffee', 'ice'],
    marketingName: 'Slow-Steeped Cold Brew',
    tagline: 'Smooth, cold, and never bitter',
    description:
      'Coffee beans steeped for 18 hours in cold filtered water, then poured over ice. Smoother and less acidic than iced coffee — naturally sweet, deeply caffeinated, and perfectly chilled. Served cold, ready to refresh.',
    badges: ['favorite'],
    displayOrder: 91,
  },
  {
    productId: 'product.vanilla-shake',
    menuItemId: 'menuItem.vanilla-shake',
    sku: 'DR1003',
    name: 'Hand-Spun Vanilla Shake',
    category: 'drinks',
    basePrice: 4.99,
    allergens: ['dairy'],
    calories: 540,
    protein: 11,
    carbs: 78,
    fat: 22,
    sodium: 240,
    ingredients: ['vanilla ice cream', 'whole milk', 'real vanilla', 'whipped cream'],
    marketingName: 'Hand-Spun Vanilla Shake',
    tagline: 'Thick, creamy, ice cold dessert in a cup',
    description:
      'Real vanilla ice cream blended with cold milk and topped with whipped cream. Thick enough to need a spoon, sweet enough to count as dessert. The kind of cold creamy treat that makes a meal feel complete.',
    badges: ['favorite'],
    displayOrder: 92,
  },
  {
    productId: 'product.fountain-cola',
    menuItemId: 'menuItem.fountain-cola',
    sku: 'DR1004',
    name: 'Fountain Cola',
    category: 'drinks',
    basePrice: 2.49,
    allergens: ['none'],
    calories: 200,
    protein: 0,
    carbs: 55,
    fat: 0,
    sodium: 60,
    ingredients: ['carbonated water', 'cola syrup', 'ice'],
    marketingName: 'Classic Fountain Cola',
    tagline: 'Fizzy, frosty, classic',
    description:
      'A frosty cup of cola straight from the fountain over crunchy pellet ice. Carbonated, refreshing, and ice cold — the no-fuss soft drink that pairs with every burger and side on the menu.',
    badges: ['value'],
    displayOrder: 93,
  },
  {
    productId: 'product.brownie',
    menuItemId: 'menuItem.brownie',
    sku: 'DS1001',
    name: 'Fudge Brownie',
    category: 'drinks',
    basePrice: 2.79,
    allergens: ['dairy', 'wheat', 'eggs'],
    calories: 410,
    protein: 5,
    carbs: 52,
    fat: 21,
    sodium: 180,
    ingredients: ['flour', 'butter', 'cocoa', 'sugar', 'eggs', 'chocolate chunks'],
    marketingName: 'Warm Fudge Brownie',
    tagline: 'Chocolate, gooey, sweet',
    description:
      'A warm chocolate brownie with a fudgy center and crackly top, studded with chunks of dark chocolate. Sweet, rich, and indulgent — the perfect dessert to finish a meal with something chocolatey.',
    badges: ['favorite'],
    displayOrder: 94,
  },
  {
    productId: 'product.apple-pie',
    menuItemId: 'menuItem.apple-pie',
    sku: 'DS1002',
    name: 'Cinnamon Apple Pie',
    category: 'drinks',
    basePrice: 2.49,
    allergens: ['dairy', 'wheat'],
    calories: 320,
    protein: 3,
    carbs: 48,
    fat: 14,
    sodium: 220,
    ingredients: ['apples', 'cinnamon', 'butter', 'flour', 'brown sugar'],
    marketingName: 'Cinnamon Apple Pie',
    tagline: 'Warm, sweet, golden crust',
    description:
      'A handheld pie with cinnamon-spiced apples baked inside a flaky golden crust. Warm and sweet, like the classic dessert your grandmother made — perfect for finishing a meal on a sweet note.',
    badges: ['fresh'],
    displayOrder: 95,
  },
  {
    productId: 'product.mozz-sticks',
    menuItemId: 'menuItem.mozz-sticks',
    sku: 'SI1001',
    name: 'Mozzarella Sticks (5pc)',
    category: 'sides',
    basePrice: 4.49,
    allergens: ['dairy', 'wheat'],
    calories: 480,
    protein: 18,
    carbs: 38,
    fat: 28,
    sodium: 920,
    ingredients: ['mozzarella cheese', 'breadcrumb coating', 'marinara sauce'],
    marketingName: 'Crispy Mozzarella Sticks',
    tagline: 'Hot, crispy, melty cheese pulls',
    description:
      'Five sticks of mozzarella cheese coated in seasoned breadcrumbs, fried until golden and bubbling. Served hot with a side of marinara — a savory, sharable side with all the cheese pulls you want.',
    badges: ['favorite'],
    displayOrder: 60,
  },
]

function buildProduct(item: SeedItem) {
  return {
    _id: item.productId,
    _type: 'product',
    sku: item.sku,
    name: item.name,
    category: item.category,
    basePrice: item.basePrice,
    allergens: item.allergens,
    nutritionFacts: {
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      sodium: item.sodium,
    },
    ingredients: item.ingredients,
    pimMetadata: {
      lastSyncedAt: new Date().toISOString(),
      syncSource: 'demo',
      syncStatus: 'synced',
    },
  }
}

function buildMenuItem(item: SeedItem) {
  return {
    _id: item.menuItemId,
    _type: 'menuItem',
    product: {
      _type: 'crossDatasetReference',
      _ref: item.productId,
      _projectId: PROJECT_ID,
      _dataset: 'productcatalog',
      _weak: true,
    },
    marketingName: item.marketingName,
    tagline: item.tagline,
    description: item.description,
    badges: item.badges,
    displayOrder: item.displayOrder,
    featured: false,
  }
}

async function main() {
  const token =
    process.env.SANITY_API_TOKEN ?? process.env.SANITY_CUSTOMER_CONTENT_WRITE_TOKEN
  if (!token) {
    console.error(
      'Token env var is required: SANITY_API_TOKEN or SANITY_CUSTOMER_CONTENT_WRITE_TOKEN',
    )
    process.exit(1)
  }

  // 1. Seed products in productcatalog (validate-catalog-writes will run on each)
  const productTx = catalog(token).transaction()
  items.forEach((it) => productTx.createOrReplace(buildProduct(it)))
  const productResult = await productTx.commit()
  console.log(`✅ Wrote ${productResult.results.length} products to productcatalog`)

  // 2. Seed menuItems in customercontent referencing those products
  const menuTx = content(token).transaction()
  items.forEach((it) => menuTx.createOrReplace(buildMenuItem(it)))
  const menuResult = await menuTx.commit()
  console.log(`✅ Wrote ${menuResult.results.length} menuItems to customercontent`)

  console.log('\nNext steps:')
  console.log('  • Embeddings will recompute automatically (~1 min)')
  console.log('  • Reload the cart-demo page; cold drinks should now rank higher')
  console.log('  • Verify with: sanity dataset embeddings status customercontent')
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
