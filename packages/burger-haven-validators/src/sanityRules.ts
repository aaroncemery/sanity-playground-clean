// DEMO: Sanity Rule.custom() wrappers — thin adapters over pure validator functions.
// These run in Studio UI context. The same logic also runs server-side in Functions.
//
// Note: Rule parameter typed as `any` — Sanity's field-specific rule types (StringRule,
// NumberRule, etc.) don't extend the base Rule type, so field-generic wrappers require any.
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  validateSku,
  validateAllergens,
  validateNutritionFacts,
  validateCalories,
  validateNutritionMacro,
  validateBasePrice,
  validateProductName,
} from './productRules'
import {validatePricing} from './pricingRules'

export const skuValidation = (Rule: any) =>
  Rule.custom((value: string | undefined) => {
    const {errors} = validateSku(value)
    return errors.length > 0 ? (errors[0] ?? true) : true
  })

export const allergensValidation = (Rule: any) =>
  Rule.custom((value: string[] | undefined) => {
    const {errors} = validateAllergens(value)
    return errors.length > 0 ? (errors[0] ?? true) : true
  })

export const nutritionFactsValidation = (Rule: any) =>
  Rule.custom((value: unknown) => {
    const {errors} = validateNutritionFacts(
      value as Parameters<typeof validateNutritionFacts>[0],
    )
    return errors.length > 0 ? (errors[0] ?? true) : true
  })

export const basePriceValidation = (Rule: any) =>
  Rule.custom((value: number | undefined) => {
    const {errors} = validateBasePrice(value)
    return errors.length > 0 ? (errors[0] ?? true) : true
  })

export const productNameValidation = (Rule: any) =>
  Rule.custom((value: string | undefined) => {
    const {errors} = validateProductName(value)
    return errors.length > 0 ? (errors[0] ?? true) : true
  })

export const caloriesValidation = (Rule: any) =>
  Rule.custom((value: number | undefined) => {
    const {errors} = validateCalories(value)
    return errors.length > 0 ? (errors[0] ?? true) : true
  })

/** Factory that returns a validator for a nutrition macro field (protein, carbs, fat, sodium) */
export const nutritionMacroValidation = (fieldName: string) => (Rule: any) =>
  Rule.custom((value: number | undefined) => {
    const {errors} = validateNutritionMacro(value, fieldName)
    return errors.length > 0 ? (errors[0] ?? true) : true
  })

export const pricingValidation = (Rule: any) =>
  Rule.custom((value: unknown) => {
    if (!value || typeof value !== 'object') return true
    const {errors} = validatePricing(value as Parameters<typeof validatePricing>[0])
    return errors.length > 0 ? (errors[0] ?? true) : true
  })
