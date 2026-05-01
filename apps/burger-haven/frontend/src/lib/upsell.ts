/**
 * Upsell rule evaluation — runs client-side on every cart change.
 *
 * Sanity owns the rules (tiers, copy, targeting). The frontend evaluates them
 * against current cart state. Per the architecture: Sanity Functions are
 * event-driven only, not HTTP endpoints, so eval lives at the edge of the app.
 */
import type {
  CartLine,
  Daypart,
  OfferRule,
  OfferRuleCopyVariant,
  OfferRuleTier,
  ResolvedNudge,
} from './types'

export function cartSubtotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.unitPrice * line.qty, 0)
}

export function currentDaypart(date: Date = new Date()): Daypart {
  const h = date.getHours()
  if (h < 10) return 'breakfast'
  if (h < 16) return 'lunch'
  if (h < 22) return 'dinner'
  return 'lateNight'
}

export function findActiveTier(
  subtotal: number,
  tiers: OfferRuleTier[],
): OfferRuleTier | undefined {
  const sorted = [...tiers].sort((a, b) => a.lowerBound - b.lowerBound)
  // Active tier: subtotal >= lowerBound and subtotal < target
  for (const tier of sorted) {
    if (subtotal >= tier.lowerBound && subtotal < tier.target) return tier
  }
  return undefined
}

export function rewardLabel(tier: OfferRuleTier): string {
  const v = tier.rewardValue
  switch (tier.rewardType) {
    case 'percentOff':
      return `${v ?? 0}% off`
    case 'dollarOff':
      return `$${(v ?? 0).toFixed(2)} off`
    case 'bonusPoints':
      return `${v ?? 0} bonus points`
    case 'freeItem':
      return tier.rewardItem?.marketingName
        ? `a free ${tier.rewardItem.marketingName}`
        : 'a free item'
    case 'comboUpgrade':
      return 'a combo upgrade'
    default:
      return 'a reward'
  }
}

export function resolveTokens(
  copy: string | undefined,
  context: {gap: number; reward: string; target: number},
): string {
  if (!copy) return ''
  return copy
    .replaceAll('[GAP]', `$${context.gap.toFixed(2)}`)
    .replaceAll('[REWARD]', context.reward)
    .replaceAll('[TARGET]', `$${context.target.toFixed(2)}`)
}

export interface EvaluateOptions {
  cart: CartLine[]
  rules: OfferRule[]
  variantId?: string
  /** Simulated cart margin (percent). If a rule's marginFloor is set above this, it's suppressed. */
  cartMargin?: number
}

export function evaluateNudge(opts: EvaluateOptions): ResolvedNudge | null {
  const subtotal = cartSubtotal(opts.cart)
  if (subtotal <= 0) return null

  for (const rule of opts.rules) {
    if (
      typeof rule.marginFloor === 'number' &&
      typeof opts.cartMargin === 'number' &&
      opts.cartMargin < rule.marginFloor
    ) {
      continue
    }

    const tier = findActiveTier(subtotal, rule.tiers)
    if (!tier) continue

    const variant =
      rule.copyVariants.find((v) => v.variantId === opts.variantId) ??
      rule.copyVariants[0]
    if (!variant) continue

    const gap = Math.max(0, tier.target - subtotal)
    const reward = rewardLabel(tier)
    const ctx = {gap, reward, target: tier.target}

    return {
      rule,
      tier,
      variant,
      gap,
      headline: resolveTokens(variant.headline, ctx),
      body: resolveTokens(variant.body, ctx),
      cta: variant.cta,
      unlocked: false,
      rewardLabel: reward,
    }
  }

  return checkUnlockedAcrossRules(subtotal, opts.rules, opts.variantId)
}

function checkUnlockedAcrossRules(
  subtotal: number,
  rules: OfferRule[],
  variantId?: string,
): ResolvedNudge | null {
  for (const rule of rules) {
    const sorted = [...rule.tiers].sort((a, b) => a.target - b.target)
    const reached = sorted.filter((t) => subtotal >= t.target).pop()
    if (!reached) continue
    const variant =
      rule.copyVariants.find((v) => v.variantId === variantId) ??
      rule.copyVariants[0]
    if (!variant) continue
    const reward = rewardLabel(reached)
    return {
      rule,
      tier: reached,
      variant,
      gap: 0,
      headline: `🎉 You unlocked ${reward}!`,
      body: 'Keep adding to push to the next reward tier.',
      cta: variant.cta,
      unlocked: true,
      rewardLabel: reward,
    }
  }
  return null
}

export function buildCartContext(cart: CartLine[]): string {
  if (cart.length === 0) return 'empty cart'
  const items = cart
    .map((c) => `${c.qty}× ${c.marketingName}${c.category ? ` (${c.category})` : ''}`)
    .join(', ')
  const total = cartSubtotal(cart).toFixed(2)
  return `Customer cart: ${items}. Subtotal $${total}. Looking for complementary items.`
}
