/**
 * Seeds the customercontent dataset with an offerRule + upgradeMap demo set
 * for the JitB Upsell POC.
 *
 * Run from apps/burger-haven:
 *   pnpm dlx tsx scripts/seed-offer-rules.ts
 *
 * Requires SANITY_API_TOKEN env var with write access to a09jbdjz/customercontent.
 */
import {createClient} from '@sanity/client'

const PROJECT_ID = 'a09jbdjz'
const DATASET = 'customercontent'

// Existing menuItem IDs (resolved from the seeded customercontent dataset)
const MENU_ITEMS = {
  classicHaven: '73119bf4-c3df-4291-b4a0-6083f2bd56d4',
  doubleDownDeluxe: 'f14cb349-1afc-431a-96d2-8e9ff968daef',
  smokyBbqBaconStack: '40ffa8e3-d47c-4d0a-a8e8-1f0f351da834',
  fireStarter: 'df354ff2-41e1-495c-bf9c-7cfdcc42b14e',
  crispyChicken: '8b6eba06-cfbc-4dfd-bf8c-8da2949a1ea1',
  grilledChickenClub: 'ee1c94c2-eb8f-4c49-a460-70f9d6b2ccb3',
  tendersFeast: '3f349d9c-4a2a-44d0-b05b-b16d0d245b64',
  breakfastHavenSandwich: 'be2cc3d0-4cc9-490d-8974-8f54a811128e',
  loadedBreakfastBurrito: '27c650f3-a445-44ba-84cb-f871f0f4354a',
  crispyFries: '4243da78-ace8-40b7-83db-756154628c7c',
  goldenOnionRings: '4617fb57-4ad2-4323-a1c2-6490b57cb269',
  premiumCoffee: '38e01501-be13-4c84-86d2-f3cf622683c9',
} as const

const ref = (id: string) => ({_type: 'reference', _ref: id})

const offerRule = {
  _id: 'offerRule.summer-upsell-mobile',
  _type: 'offerRule',
  name: 'Summer Upsell — Mobile',
  enabled: true,
  priority: 10,
  marginFloor: 20,
  channels: ['mobile', 'web'],
  dayparts: ['lunch', 'dinner', 'lateNight'],
  tiers: [
    {
      _key: 't1',
      label: 'Tier 1 — Entry',
      lowerBound: 5,
      target: 10,
      rewardType: 'percentOff',
      rewardValue: 10,
    },
    {
      _key: 't2',
      label: 'Tier 2 — Side bonus',
      lowerBound: 10,
      target: 15,
      rewardType: 'freeItem',
      rewardItem: ref(MENU_ITEMS.crispyFries),
    },
    {
      _key: 't3',
      label: 'Tier 3 — Loyalty boost',
      lowerBound: 15,
      target: 20,
      rewardType: 'bonusPoints',
      rewardValue: 200,
    },
    {
      _key: 't4',
      label: 'Tier 4 — Big basket',
      lowerBound: 20,
      target: 25,
      rewardType: 'percentOff',
      rewardValue: 15,
    },
  ],
  copyVariants: [
    {
      _key: 'A',
      variantId: 'A',
      headline: '[GAP] away from [REWARD]!',
      body: 'Add a little more to unlock your reward.',
      cta: 'See suggestions',
    },
    {
      _key: 'B',
      variantId: 'B',
      headline: 'So close! Just [GAP] to go!',
      body: "You're almost at [TARGET] — don't miss out on [REWARD].",
      cta: 'Add something',
    },
    {
      _key: 'C',
      variantId: 'C',
      headline: 'Unlock [REWARD] for just [GAP] more',
      body: 'Smart move — add a side or drink to hit [TARGET].',
      cta: 'Browse deals',
    },
  ],
  suggestedProducts: [
    {_key: 's1', ...ref(MENU_ITEMS.crispyFries)},
    {_key: 's2', ...ref(MENU_ITEMS.goldenOnionRings)},
    {_key: 's3', ...ref(MENU_ITEMS.premiumCoffee)},
  ],
}

const upgradeMaps = [
  {
    _id: 'upgradeMap.classic-to-bbq',
    _type: 'upgradeMap',
    name: 'Classic Haven → BBQ Bacon Stack',
    sourceItem: ref(MENU_ITEMS.classicHaven),
    upgradeItem: ref(MENU_ITEMS.smokyBbqBaconStack),
    priceDelta: 1.5,
    bonusCopy: 'Upgrade to BBQ Bacon for just $1.50 more!',
    enabled: true,
  },
  {
    _id: 'upgradeMap.crispy-to-tenders',
    _type: 'upgradeMap',
    name: 'Crispy Chicken → Tenders Feast',
    sourceItem: ref(MENU_ITEMS.crispyChicken),
    upgradeItem: ref(MENU_ITEMS.tendersFeast),
    priceDelta: 2.5,
    bonusCopy: 'Make it a Tenders Feast for $2.50 more',
    enabled: true,
  },
]

async function main() {
  const token =
    process.env.SANITY_API_TOKEN ?? process.env.SANITY_CUSTOMER_CONTENT_WRITE_TOKEN
  if (!token) {
    console.error(
      'Token env var is required: SANITY_API_TOKEN or SANITY_CUSTOMER_CONTENT_WRITE_TOKEN',
    )
    process.exit(1)
  }

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2025-02-24',
    token,
    useCdn: false,
  })

  const tx = client.transaction()
  tx.createOrReplace(offerRule)
  upgradeMaps.forEach((doc) => tx.createOrReplace(doc))

  const result = await tx.commit()
  console.log('✅ Seeded JitB upsell content', {
    documents: result.results.length,
    offerRule: offerRule._id,
    upgradeMaps: upgradeMaps.map((u) => u._id),
  })
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
