/**
 * GROQ queries for Burger Haven frontend.
 *
 * Key architectural note:
 * - menuItem documents live in customercontent dataset
 * - They reference product documents via crossDatasetReference to productcatalog
 * - Pricing and location data are fetched separately from productcatalog
 */

// ============================================================
// PRODUCT CATALOG QUERIES (productcatalog dataset)
// ============================================================

/**
 * Fetch all products from PIM catalog
 */
export const ALL_PRODUCTS_QUERY = /* groq */ `
  *[_type == "product"] | order(category asc, name asc) {
    _id,
    sku,
    name,
    category,
    basePrice,
    allergens,
    nutritionFacts {
      calories,
      protein,
      carbs,
      fat,
      sodium
    },
    ingredients,
    "syncStatus": pimMetadata.syncStatus,
    "syncSource": pimMetadata.syncSource,
    "lastSynced": pimMetadata.lastSyncedAt
  }
`

/**
 * Fetch all store locations
 */
export const ALL_LOCATIONS_QUERY = /* groq */ `
  *[_type == "storeLocation"] | order(region asc, name asc) {
    _id,
    storeId,
    name,
    address,
    region,
    pricingTier
  }
`

/**
 * Fetch pricing for a specific region
 */
export const PRICING_BY_REGION_QUERY = /* groq */ `
  *[_type == "productPricing" && storeLocation->region == $region] {
    _id,
    price,
    pricingTier,
    effectiveDate,
    "productId": product._ref,
    "productSku": product->sku,
    "locationName": storeLocation->name,
    "locationCity": storeLocation->address.city
  }
`

/**
 * Dashboard stats from product catalog
 */
export const CATALOG_STATS_QUERY = /* groq */ `{
  "totalProducts": count(*[_type == "product"]),
  "syncedProducts": count(*[_type == "product" && pimMetadata.syncStatus == "synced"]),
  "failedProducts": count(*[_type == "product" && pimMetadata.syncStatus == "validation_failed"]),
  "totalLocations": count(*[_type == "storeLocation"]),
  "recentProducts": *[_type == "product"] | order(pimMetadata.lastSyncedAt desc) [0...5] {
    _id,
    sku,
    name,
    "lastSynced": pimMetadata.lastSyncedAt,
    "syncStatus": pimMetadata.syncStatus,
    "syncSource": pimMetadata.syncSource
  },
  "failedValidations": *[_type == "product" && pimMetadata.syncStatus == "validation_failed"] {
    _id,
    sku,
    name,
    "errors": pimMetadata.validationErrors
  }
}`

// ============================================================
// CUSTOMER CONTENT QUERIES (customercontent dataset)
// ============================================================

/**
 * Fetch all menu items with marketing content
 * Note: product reference is a crossDatasetReference - must resolve separately
 */
export const ALL_MENU_ITEMS_QUERY = /* groq */ `
  *[_type == "menuItem"] | order(displayOrder asc) {
    _id,
    marketingName,
    tagline,
    description,
    heroImage,
    galleryImages,
    badges,
    displayOrder,
    featured,
    seasonalAvailability,
    "productRef": product._ref,
    "productDataset": product._dataset
  }
`

/**
 * Fetch active promotions
 */
export const ACTIVE_PROMOTIONS_QUERY = /* groq */ `
  *[_type == "promotion" && dateTime(now()) >= dateTime(startDate) && dateTime(now()) <= dateTime(endDate)] | order(startDate desc) {
    _id,
    title,
    description,
    promoCode,
    discountType,
    discountAmount,
    startDate,
    endDate,
    "menuItemRefs": menuItems[]._ref
  }
`

/**
 * Fetch all promotions (for admin)
 */
export const ALL_PROMOTIONS_QUERY = /* groq */ `
  *[_type == "promotion"] | order(startDate desc) {
    _id,
    title,
    description,
    promoCode,
    discountType,
    discountAmount,
    startDate,
    endDate
  }
`

/**
 * Content stats for dashboard
 */
export const CONTENT_STATS_QUERY = /* groq */ `{
  "totalMenuItems": count(*[_type == "menuItem"]),
  "featuredItems": count(*[_type == "menuItem" && featured == true]),
  "activePromotions": count(*[_type == "promotion" && dateTime(now()) >= dateTime(startDate) && dateTime(now()) <= dateTime(endDate)]),
  "totalCampaigns": count(*[_type == "seasonalCampaign"]),
  "recentMenuItems": *[_type == "menuItem"] | order(_updatedAt desc) [0...5] {
    _id,
    marketingName,
    featured,
    _updatedAt
  }
}`

/**
 * Fetch menu items with images — shows both _ref and resolved asset->url.
 * Used by /admin/image-url to demonstrate that no extra API call is made.
 */
export const MENU_ITEMS_WITH_IMAGES_QUERY = /* groq */ `
  *[_type == "menuItem" && defined(heroImage.asset)] | order(displayOrder asc) [0...6] {
    _id,
    marketingName,
    "imageRef": heroImage.asset._ref,
    "imageResolvedUrl": heroImage.asset->url,
    "imageAlt": heroImage.alt
  }
`

/**
 * Fetch all regions
 */
export const ALL_REGIONS_QUERY = /* groq */ `
  *[_type == "region"] | order(name asc) {
    _id,
    name,
    code,
    states
  }
`

// ============================================================
// JITB UPSELL — OFFER RULES (customercontent dataset)
// ============================================================

/**
 * Fetch active offer rules. This is what the cart calls on bag open.
 * Filters: enabled, channel match, daypart match, schedule window.
 */
export const ACTIVE_OFFER_RULES_QUERY = /* groq */ `
  *[_type == "offerRule" && enabled == true
    && ($channel in channels || count(channels) == 0)
    && ($daypart in dayparts || count(dayparts) == 0)
    && (!defined(scheduling.startDate) || dateTime(now()) >= dateTime(scheduling.startDate))
    && (!defined(scheduling.endDate) || dateTime(now()) <= dateTime(scheduling.endDate))
  ] | order(priority asc) {
    _id,
    name,
    priority,
    marginFloor,
    channels,
    dayparts,
    tiers[] {
      label,
      lowerBound,
      target,
      rewardType,
      rewardValue,
      rewardItem->{
        _id,
        marketingName,
        heroImage,
        "productRef": product._ref
      }
    },
    copyVariants[] {
      variantId,
      headline,
      body,
      cta
    },
    suggestedProducts[]->{
      _id,
      marketingName,
      tagline,
      heroImage,
      badges,
      "productRef": product._ref
    }
  }
`

/**
 * Embeddings-powered semantic product recommendations.
 * Requires Dataset Embeddings to be enabled on the dataset (CLI:
 * `sanity dataset embeddings enable customercontent --projection='{...}'`).
 *
 * `text::semanticSimilarity()` takes a single string arg — the fields it
 * matches against are defined by the dataset's embeddings projection, not here.
 */
export const EMBEDDINGS_RECOMMENDATIONS_QUERY = /* groq */ `
  *[_type == "menuItem"] | score(
    text::semanticSimilarity($cartContext)
  ) | order(_score desc) [0...4] {
    _id,
    marketingName,
    tagline,
    description,
    heroImage,
    badges,
    "productRef": product._ref,
    _score
  }
`

/**
 * Fetch upgrade maps for the comboUpgrade reward variant.
 */
export const ACTIVE_UPGRADE_MAPS_QUERY = /* groq */ `
  *[_type == "upgradeMap" && enabled == true] {
    _id,
    name,
    priceDelta,
    bonusCopy,
    sourceItem->{
      _id,
      marketingName,
      heroImage,
      "productRef": product._ref
    },
    upgradeItem->{
      _id,
      marketingName,
      heroImage,
      "productRef": product._ref
    }
  }
`
