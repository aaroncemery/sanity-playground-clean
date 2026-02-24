# Burger Haven — PIM Integration Demo

**A Sanity demo showing how Sanity serves as the integration and enrichment layer between an external PIM system and customer-facing apps.**

Based on a real QSR customer scenario. Anonymized as "Burger Haven" for reuse with any prospect.

---

## The Story

A QSR chain has already purchased a 3rd party PIM (Akeneo, Salsify, etc.). Their top concerns:

1. **Data accuracy crisis**: PIM writes to Sanity via API and bypasses Studio validation — causing missing allergen info and invalid prices (executive-level compliance concern)
2. **Integration challenge**: Need to bring together PIM data (products, pricing) with marketing enrichment
3. **Validation bypass**: *"We can limit business rules via UI, but then it can be bypassed via an API. Functions should solve this but the team isn't familiar with them."*

**This demo answers all three.**

---

## Architecture

```
External PIM (Akeneo, Salsify, etc.)
  ↓ API writes product/pricing data

Sanity Dataset: productcatalog
  ├── Products (synced FROM PIM via API)
  ├── Pricing by location (from PIM)
  ├── Store locations (from PIM)
  └── ⚡ Functions validate ALL writes — API + Studio, no bypass possible

  ↓ cross-dataset references

Sanity Dataset: customercontent
  ├── Menu Items (references productcatalog + adds marketing content)
  ├── Promotions & campaigns
  └── Regional targeting

  ↓ published to

Customer Apps (Web, Mobile, Kiosk)
```

### Why Two Datasets?

| Dataset | Written by | Contains |
|---------|-----------|----------|
| `productcatalog` | External PIM via API | Products, pricing, locations |
| `customercontent` | Marketing team via Studio | Menu items, promotions, campaigns |

**Cross-dataset references** connect them without duplicating data. Marketing teams can enrich product data with images, taglines, and promotions — without touching the operational product catalog.

---

## Key Features

### ⚡ Functions (The Critical Feature)

Solves the #1 customer pain point. Functions run **server-side on every write** — including direct API calls from external PIM systems.

**What gets validated:**
- ⚠️ Allergen information (FDA compliance — blocks write if missing)
- ⚠️ Nutrition facts (FDA compliance — blocks write if missing)
- ❌ SKU format (`XX0000` pattern)
- ❌ Price range ($0–$100)
- ❌ Category assignment
- ❌ Product name

**Try the live demo** at `/admin/validation` — click "Write Invalid Product" to see the Function reject a write in real time.

### 🔗 Cross-Dataset References

Menu items in `customercontent` reference products in `productcatalog` via `crossDatasetReference`. This means:
- PIM controls product data; marketing cannot accidentally overwrite it
- Marketing can add customer-facing content (images, taglines, badges) independently
- A single GROQ query can combine both datasets

### 📍 Regional Pricing

Products have a base price in the PIM, but location-specific pricing overrides exist for each store. The Georgia stores have value-tier pricing (~$0.50 less per item).

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+
- Sanity project access (project ID: `a09jbdjz`)

### Install & Run

```bash
# From monorepo root
pnpm install

# Start everything
pnpm dev:burger-haven

# Or individually:
pnpm dev:burger-haven-studio    # Studio at :3340
pnpm dev:burger-haven-frontend  # Frontend at :3005
```

### Environment Setup

```bash
cd apps/burger-haven/frontend
cp .env.local.example .env.local
# Edit .env.local and add your SANITY_API_TOKEN
```

Get a token at: https://www.sanity.io/manage/project/a09jbdjz/api#tokens
(Editor or higher permissions needed for the validation demo write calls)

### Deploy Functions

```bash
cd apps/burger-haven
pnpm dlx sanity blueprints deploy --config functions/burger-haven.blueprint.ts
```

---

## Project Structure

```
apps/burger-haven/
├── studio/
│   ├── sanity.config.ts         # Two-workspace configuration
│   └── src/schemaTypes/
│       ├── catalog/             # product, productPricing, storeLocation, pimSyncLog
│       └── content/             # menuItem, promotion, seasonalCampaign, region
│
├── frontend/                    # Next.js 15 App Router
│   └── src/
│       ├── app/
│       │   ├── page.tsx         # Menu board (/)
│       │   ├── admin/page.tsx   # Dashboard (/admin)
│       │   ├── admin/validation/ # Validation demo (/admin/validation)
│       │   └── api/sanity-write/ # API route simulating PIM writes
│       ├── components/
│       │   ├── MenuBoard/       # ProductCard, CategoryNav, RegionSelector
│       │   └── Admin/           # DataFlowDiagram, SyncStatusCard, ValidationDemo
│       └── lib/
│           ├── sanity.ts        # Clients for both datasets
│           ├── queries.ts       # GROQ queries
│           └── types.ts         # TypeScript interfaces
│
└── functions/
    ├── validate-catalog-writes.ts   # Primary: reject invalid PIM writes
    ├── sync-audit-trail.ts          # Secondary: audit logging
    └── burger-haven.blueprint.ts    # Blueprint configuration
```

---

## Demo Script (15 minutes)

### 1. Studio Walkthrough (4 min)

Open `localhost:3340` — notice **two workspaces** in the top bar.

**Product Catalog workspace** (`/catalog`):
- Show a product — point out the allergen field: *"This is REQUIRED. Functions reject writes without it."*
- Show `pimMetadata` section: *"This tracks where data came from and sync status."*
- Show productPricing documents: *"Location-specific pricing from the PIM."*

**Customer Content workspace** (`/content`):
- Open a Menu Item — show the product cross-dataset reference: *"This links to the product catalog without duplicating data."*
- Show the marketing fields: name, tagline, description, image, badges: *"Marketing adds what customers see; PIM controls the product data."*
- Show a Promotion: *"Marketing controls these independently from product data."*

### 2. Functions Demo ⭐ KEY MOMENT (5 min)

Navigate to `localhost:3005/admin/validation`

1. Click **"✅ Write Valid Product"** — show it succeeds
2. Click **"❌ Write Invalid Product (no allergens)"** — show the Function rejection

**Say:** *"This is what happens when your PIM system writes to Sanity via API. The Function runs server-side — there is no way to bypass it. Studio, API, webhooks — all go through the same validation."*

Show the payload difference: valid has `allergens`, invalid doesn't.
Show the error message: it calls out the FDA compliance issue explicitly.

### 3. Menu Board (3 min)

Navigate to `localhost:3005`

- Switch region from California to Georgia — prices drop by ~$0.50 on the burgers
- Point out the allergen icons: *"This data comes from the PIM via the catalog dataset."*
- Point out promotional badges: *"These come from the marketing team in the content dataset."*
- Point out featured items: *"Marketing controls what's featured — no PIM involvement needed."*

### 4. Admin Dashboard (3 min)

Navigate to `localhost:3005/admin`

- Show the **Data Flow Diagram**: *"External PIM → Product Catalog → Customer Content → Apps"*
- Show **sync statistics**: products synced, active promotions
- Show **talking points card**: four key value props

---

## Key Talking Points

> ✅ **"Functions enforce validation on ALL writes — API, Studio, webhooks"**
> The external PIM cannot bypass compliance rules. Same rules apply everywhere.

> ✅ **"Cross-dataset references separate operational data from marketing"**
> PIM controls products/pricing. Marketing adds customer-facing content. Clean separation of concerns.

> ✅ **"Single query combines data from multiple sources"**
> Product catalog + location pricing + marketing content + promotions in one response. No complex joins or multiple API calls.

> ✅ **"Complete audit trail of all PIM activity"**
> Sync status tracking, validation logs, error reporting — full visibility into what PIM wrote and when.

---

## Seeded Data

### productcatalog dataset
- **12 products** across 5 categories (burgers, chicken, breakfast, sides, drinks)
- **3 store locations** (Los Angeles CA, Atlanta GA, Houston TX)
- **7 Georgia-region pricing overrides** (value tier, ~$0.50 less per item)

### customercontent dataset
- **12 menu items** with marketing content (names, taglines, descriptions, badges)
- **3 regions** (California, Georgia, Texas)
- **2 promotions** (Summer Combo Deal, Fire Starter launch offer)
- **1 seasonal campaign** (Summer Menu 2026)

### Connecting Product References in Studio

The MCP seeding tool cannot write cross-dataset references programmatically. To link menu items to their products in Studio:

1. Open the Customer Content workspace at `localhost:3340/content`
2. Open each Menu Item
3. In the "Product (from Catalog)" field, search for and select the matching product
4. Publish the document

This is a one-time setup step. In production, this would be done via a migration script using the Sanity client with `crossDatasetReference` format.

---

## Troubleshooting

**Studio not loading?**
- Verify project ID `a09jbdjz` is correct in `studio/sanity.config.ts`
- Check you're authenticated: `sanity login`

**Frontend shows no menu items?**
- Check datasets exist: `productcatalog` and `customercontent`
- Verify documents are published (not just drafts)
- Note: Menu items won't show product data (price, allergens) until product references are linked in Studio

**Validation demo API returns 500?**
- Add `SANITY_API_TOKEN` to `frontend/.env.local`
- Token needs Editor or higher permissions on project `a09jbdjz`
- Note: Functions must be deployed to enforce server-side validation; without deployed functions, writes succeed regardless

**Functions not triggering?**
- Deploy functions: `pnpm dlx sanity blueprints deploy`
- Check Sanity Functions dashboard: https://www.sanity.io/manage/project/a09jbdjz/functions
