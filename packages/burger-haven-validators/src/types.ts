export interface NutritionFacts {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  sodium?: number
}

export interface ProductDocument {
  _id: string
  _type: string
  sku?: string
  name?: string
  category?: string
  basePrice?: number
  allergens?: string[]
  nutritionFacts?: NutritionFacts
  pimProductId?: string
  pimMetadata?: {syncSource?: string; syncStatus?: string}
}

export interface PricingDocument {
  _id: string
  _type: string
  price?: number
  product?: {_ref: string}
  storeLocation?: {_ref: string}
  pricingTier?: string
}

export type ValidationResult = {errors: string[]; warnings: string[]}
