# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Turbo monorepo** combining a Sanity Studio with a Next.js web application. The project demonstrates Sanity's Visual Editing, custom workflows, serverless functions (blueprints), and redirect management.

**Package Manager:** pnpm (workspace protocol for monorepo dependencies)

**Sanity Project:**
- Project ID: `a09jbdjz`
- Dataset: `production`
- Studio runs on port 3333

## Development Commands

### Root Level (Turborepo)
```bash
pnpm dev                 # Start all apps in development
pnpm build               # Build all apps and packages
pnpm lint                # Lint all apps
pnpm format              # Format code with Prettier
pnpm check-types         # Type check all apps
pnpm deploy:studio       # Deploy Sanity Studio
pnpm deploy:functions    # Deploy Sanity blueprints/functions
```

### Studio (`apps/marketing/studio`)
```bash
cd apps/marketing/studio
pnpm dev                 # Start Studio dev server (port 3333)
pnpm build               # Build Studio
pnpm deploy              # Deploy Studio to Sanity hosting
pnpm typegen             # Extract schema and generate types
pnpm deploy-graphql      # Deploy GraphQL API
```

### Web App (`apps/marketing/web`)
```bash
cd apps/marketing/web
pnpm dev                 # Start Next.js dev server with Turbopack
pnpm build               # Build Next.js app with Turbopack
pnpm start               # Start production server
pnpm lint                # Run ESLint
```

### Type Generation Workflow
After schema changes:
```bash
cd apps/marketing/studio
pnpm typegen             # Extracts schema + generates TypeScript types
```

## Architecture

### Monorepo Structure
```
apps/
├── marketing/
│   ├── studio/          # Sanity Studio (port 3333)
│   │   ├── src/
│   │   │   ├── schemaTypes/ # Content schemas
│   │   │   │   ├── documents/   # Document types (page, blog, product, etc.)
│   │   │   │   ├── definitions/ # Reusable field definitions
│   │   │   │   └── blocks/      # Block content types
│   │   │   ├── actions/     # Custom document actions (workflow)
│   │   │   ├── components/  # Studio UI components
│   │   │   └── utils/       # Helper functions
│   │   ├── sanity.config.ts # Studio configuration
│   │   └── location.ts      # Presentation tool locations
│   │
│   └── web/             # Next.js 15 frontend
│       ├── src/
│       │   ├── app/     # App Router pages
│       │   │   ├── api/draft-mode/ # Draft mode endpoints
│       │   │   └── blog/    # Blog pages
│       │   ├── components/  # React components
│       │   ├── lib/sanity/  # Sanity client, queries, types
│       │   └── middleware.ts # Redirect handling
│       └── next.config.ts
│
functions/               # Sanity blueprints (serverless functions)
├── auto-increment/      # Auto-increment ID function
└── test-function/       # Example function

packages/                # Shared packages (using workspace:* protocol)
├── ui/                  # Shared UI components
├── eslint-config/       # ESLint configurations
└── typescript-config/   # TypeScript configurations
```

### Schema Organization

The Studio uses a well-organized schema structure:

**`apps/marketing/studio/src/schemaTypes/index.ts`** - Combines all schemas:
- `definitions/` - Reusable field definitions
- `documents/` - Document types (top-level content)
- `blocks/` - Block content types

**Key document types:**
- `blog` - Blog posts with portable text, authors, categories
- `product` - Products with workflow system
- `productAutoIncrement` - Products with auto-generated IDs
- `redirect` - URL redirects (internal/external)
- `counter` - Simple counter example

### Web App Integration

**Sanity Client:** `apps/marketing/web/src/lib/sanity/`
- `client.ts` - Base Sanity client
- `live.ts` - Live preview setup
- `queries.ts` - GROQ queries
- `sanity.types.ts` - Generated types from Studio schema
- `image.ts` - Image URL builder
- `token.ts` - Token management

**Visual Editing:**
- Draft mode API routes in `app/api/draft-mode/`
- Presentation tool configured in Studio
- Real-time content preview integration

**Middleware:**
- `src/middleware.ts` - Handles redirects from Sanity `redirect` documents
- Queries Sanity on every request matching config
- Supports internal (relative) and external (absolute) redirects

### Custom Workflow System

**Location:** `apps/marketing/studio/src/actions/workflowAction.ts`

Custom document actions for content approval workflow:
- `SmartPublishAction` - Replaces default publish, checks workflow state
- `ApproveAction` - Approve content for publication
- `RejectAction` - Reject content with reason
- `ResetToDraftAction` - Reset rejected content to draft

**Enabled for:** `product` document type (configurable in `sanity.config.ts`)

**Workflow states tracked in document metadata:**
- Submission status
- Approval/rejection state
- Reviewer information
- Timestamps

### Sanity Blueprints (Functions)

**Configuration:** `sanity.blueprint.ts` at root

**Functions:**
- `auto-increment` - Automatically assigns sequential IDs to `productAutoIncrement` documents on creation
- Triggered by document events (create, update, delete)
- Deployed with `pnpm deploy:functions`

## Key Technical Details

### Studio Configuration

**Plugins enabled** (`apps/marketing/studio/sanity.config.ts`):
- `structureTool` - Content management interface
- `visionTool` - GROQ query testing
- `presentationTool` - Live preview with Next.js integration

**Presentation Tool setup:**
- Custom location resolver in `location.ts`
- Preview URL points to web app
- Draft mode integration for real-time editing

**Custom document actions:**
- Configured per document type in config
- Replaces/augments default Studio actions
- Currently applies workflow to `product` type

### Next.js 15 Features

**App Router structure:**
- Server components by default
- Draft mode for previews
- API routes for draft mode toggle
- Middleware for redirects

**Turbopack:** Enabled for both dev and build
- Faster builds and HMR
- Configured in package.json scripts

**Dependencies:**
- `next-sanity` - Sanity client for Next.js
- `@sanity/visual-editing` - Visual editing overlay
- `@portabletext/react` - Render portable text
- `@sanity/image-url` - Image URL builder

## Development Guidelines

### Schema Development

1. **Location:** Add new schemas to appropriate folder:
   - `documents/` for top-level content types
   - `definitions/` for reusable field definitions
   - `blocks/` for block content types

2. **Best practices** (from `.cursor/rules`):
   - Use `defineType`, `defineField`, `defineArrayMember`
   - One type per file with named export
   - Include `icon` and `preview` configuration
   - Use groups/fieldsets for complex schemas
   - Add validation with helpful messages

3. **After changes:**
   ```bash
   cd apps/studio
   npm run typegen  # Updates types for web app
   ```

### GROQ Query Standards

- Use `SCREAMING_SNAKE_CASE` for query variables
- Always use proper projections (no `{ ... }` without fields)
- Pass parameters for dynamic values
- Generate types with `defineQuery` wrapper

### Adding Document Actions

To add workflow to new document type:

1. Add type name to `workflowEnabledTypes` array in `sanity.config.ts`
2. Actions automatically replace default publish button
3. Document metadata tracks workflow state

### Blueprints/Functions

1. Define in `sanity.blueprint.ts`
2. Implement in `functions/[name]/index.ts`
3. Deploy with `pnpm deploy:functions`
4. Test using Studio or API

## Important Notes

- **Package Manager:** This project uses pnpm with workspace protocol for monorepo dependencies
- **Monorepo:** This is a Turborepo. Run commands from root or app directory as needed.
- **Workspace Dependencies:** Internal packages use `workspace:*` protocol (e.g., `@repo/ui: "workspace:*"`)
- **Git branch:** Currently on `feat/sanity-next` testing Sanity's next version
- **Type safety:** Web app uses generated types from Studio schema
- **Preview mode:** Uses Next.js draft mode, toggled via API routes
- **Redirects:** Managed in Sanity, executed by Next.js middleware
- **Workflow:** Custom approval system for content, currently on `product` type only
