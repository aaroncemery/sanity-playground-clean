/**
 * TypeScript types for Burger Haven frontend.
 *
 * Note: In production you'd use Sanity TypeGen to generate these from schema.
 * For this demo, they're hand-crafted for clarity.
 */

// ============================================================
// PRODUCT CATALOG TYPES (productcatalog dataset)
// ============================================================

export interface NutritionFacts {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  sodium?: number
}

export interface PimMetadata {
  lastSyncedAt?: string
  syncSource?: string
  syncStatus?: 'synced' | 'pending' | 'error' | 'validation_failed'
  validationErrors?: string[]
}

export interface Product {
  _id: string
  sku: string
  name: string
  category: 'burgers' | 'chicken' | 'breakfast' | 'sides' | 'drinks'
  basePrice: number
  allergens: string[]
  nutritionFacts?: NutritionFacts
  ingredients?: string[]
  syncStatus?: string
  syncSource?: string
  lastSynced?: string
}

export interface StoreLocation {
  _id: string
  storeId: string
  name: string
  address: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  region: 'california' | 'georgia' | 'texas'
  pricingTier?: string
}

export interface ProductPricing {
  _id: string
  price: number
  pricingTier?: string
  productId: string
  productSku?: string
  locationName?: string
  locationCity?: string
}

// ============================================================
// CUSTOMER CONTENT TYPES (customercontent dataset)
// ============================================================

export interface SanityImage {
  _type: 'image'
  asset: {_ref: string; _type: 'reference'}
  hotspot?: {x: number; y: number; height: number; width: number}
  alt?: string
}

export interface MenuItem {
  _id: string
  marketingName: string
  tagline?: string
  description?: string
  heroImage?: SanityImage
  galleryImages?: SanityImage[]
  badges?: string[]
  displayOrder?: number
  featured?: boolean
  seasonalAvailability?: {
    startDate?: string
    endDate?: string
  }
  productRef?: string
  productDataset?: string
}

export interface Promotion {
  _id: string
  title: string
  description?: string
  promoCode?: string
  discountType?: 'percentage' | 'amount' | 'fixed' | 'bogo'
  discountAmount?: number
  startDate: string
  endDate: string
  menuItemRefs?: string[]
}

export interface Region {
  _id: string
  name: string
  code?: string
  states?: string[]
}

// ============================================================
// ENRICHED / COMPOSITE TYPES
// ============================================================

/**
 * Menu item combined with product data from catalog
 * This represents the "enriched" view that customers see
 */
export interface EnrichedMenuItem extends MenuItem {
  product?: Product
  pricing?: ProductPricing
  activePromotions?: Promotion[]
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface CatalogStats {
  totalProducts: number
  syncedProducts: number
  failedProducts: number
  totalLocations: number
  recentProducts: Array<{
    _id: string
    sku: string
    name: string
    lastSynced?: string
    syncStatus?: string
    syncSource?: string
  }>
  failedValidations: Array<{
    _id: string
    sku: string
    name: string
    errors?: string[]
  }>
}

export interface ContentStats {
  totalMenuItems: number
  featuredItems: number
  activePromotions: number
  totalCampaigns: number
  recentMenuItems: Array<{
    _id: string
    marketingName: string
    featured?: boolean
    _updatedAt?: string
  }>
}

// ============================================================
// ALLERGEN DISPLAY
// ============================================================

export const ALLERGEN_LABELS: Record<string, string> = {
  dairy: '🥛 Dairy',
  wheat: '🌾 Wheat',
  soy: '🫘 Soy',
  treeNuts: '🌰 Tree Nuts',
  shellfish: '🦐 Shellfish',
  eggs: '🥚 Eggs',
  fish: '🐟 Fish',
  peanuts: '🥜 Peanuts',
  none: '✅ None',
}

export const ALLERGEN_EMOJI: Record<string, string> = {
  dairy: '🥛',
  wheat: '🌾',
  soy: '🫘',
  treeNuts: '🌰',
  shellfish: '🦐',
  eggs: '🥚',
  fish: '🐟',
  peanuts: '🥜',
  none: '✅',
}

export const CATEGORY_LABELS: Record<string, string> = {
  burgers: 'Signature Burgers',
  chicken: 'Chicken & Sandwiches',
  breakfast: 'Breakfast',
  sides: 'Sides & Apps',
  drinks: 'Drinks & Desserts',
}

export const BADGE_LABELS: Record<string, string> = {
  new: '🆕 New!',
  limited: '⏰ Limited Time',
  favorite: '⭐ Fan Favorite',
  value: '💰 Value Deal',
  spicy: '🔥 Spicy',
  fresh: '🥗 Fresh',
}

export const REGION_LABELS: Record<string, string> = {
  california: 'California',
  georgia: 'Georgia',
  texas: 'Texas',
}

// ============================================================
// JITB UPSELL — OFFER RULE TYPES
// ============================================================

export type Channel = 'mobile' | 'web' | 'kiosk'
export type Daypart = 'breakfast' | 'lunch' | 'dinner' | 'lateNight'
export type RewardType =
  | 'percentOff'
  | 'dollarOff'
  | 'freeItem'
  | 'bonusPoints'
  | 'comboUpgrade'

export interface OfferRuleRewardItem {
  _id: string
  marketingName: string
  heroImage?: SanityImage
  productRef?: string
}

export interface OfferRuleTier {
  label?: string
  lowerBound: number
  target: number
  rewardType: RewardType
  rewardValue?: number
  rewardItem?: OfferRuleRewardItem
}

export interface OfferRuleCopyVariant {
  variantId: string
  headline: string
  body?: string
  cta?: string
}

export interface OfferRuleSuggestedProduct {
  _id: string
  marketingName: string
  tagline?: string
  heroImage?: SanityImage
  badges?: string[]
  productRef?: string
}

export interface OfferRule {
  _id: string
  name: string
  priority?: number
  marginFloor?: number
  channels?: Channel[]
  dayparts?: Daypart[]
  tiers: OfferRuleTier[]
  copyVariants: OfferRuleCopyVariant[]
  suggestedProducts?: OfferRuleSuggestedProduct[]
}

export interface EmbeddingsRecommendation {
  _id: string
  marketingName: string
  tagline?: string
  description?: string
  heroImage?: SanityImage
  badges?: string[]
  productRef?: string
  _score: number
}

export interface UpgradeMap {
  _id: string
  name: string
  priceDelta: number
  bonusCopy?: string
  sourceItem?: OfferRuleRewardItem
  upgradeItem?: OfferRuleRewardItem
}

// ============================================================
// CART SIMULATION TYPES
// ============================================================

export interface CartLine {
  menuItemId: string
  marketingName: string
  unitPrice: number
  qty: number
  category?: string
  heroImage?: SanityImage
}

export interface ResolvedNudge {
  rule: OfferRule
  tier: OfferRuleTier
  variant: OfferRuleCopyVariant
  gap: number
  headline: string
  body?: string
  cta?: string
  unlocked: boolean
  rewardLabel: string
}
