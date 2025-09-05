# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Sanity Studio playground built on a Turborepo monorepo architecture. The project includes:

- **`apps/studio/`** - Sanity Studio CMS with document internationalization, workflow actions, and AI assist
- **`apps/web/`** - Next.js frontend application with Tailwind CSS and visual editing
- **`packages/ui/`** - Shared React component library
- **`packages/eslint-config/`** - ESLint configurations for the monorepo
- **`packages/typescript-config/`** - Shared TypeScript configurations
- **`functions/`** - Sanity serverless functions (auto-increment, test-function)

## Development Commands

### Root-level Commands
```bash
npm run dev                    # Start all apps in development mode
npm run build                  # Build all apps and packages
npm run lint                   # Lint all packages
npm run check-types            # Type check all packages
npm run format                 # Format code with Prettier
npm run deploy:studio          # Deploy Sanity Studio
npm run deploy:functions       # Deploy Sanity functions via blueprints
```

### Studio-specific Commands (from `apps/studio/`)
```bash
npm run dev                    # Start Studio development server
npm run dev:prod              # Start with production env
npm run build                 # Build Studio
npm run build:prod            # Build with production env
npm run deploy                # Deploy Studio to production
npm run deploy:dev            # Deploy with source maps
npm run typegen               # Generate TypeScript types from schema
npm run deploy-graphql        # Deploy GraphQL API
```

### Web App Commands (from `apps/web/`)
```bash
npm run dev                   # Start Next.js with Turbopack
npm run build                 # Build Next.js app with Turbopack
npm run start                 # Start production server
npm run lint                  # ESLint check
```

### UI Package Commands (from `packages/ui/`)
```bash
npm run lint                  # Lint UI components
npm run check-types          # Type check components
npm run generate:component   # Generate new React component via Turbo
```

## Architecture & Key Concepts

### Sanity Studio Configuration
- **Project ID**: `a09jbdjz`
- **Dataset**: `production` (configurable via env vars)
- **Plugins**: Structure Tool, Vision Tool, Presentation Tool, Document Internationalization, AI Assist
- **Workflow System**: Custom document actions (SmartPublishAction, ApproveAction, RejectAction, ResetToDraftAction) enabled for `product` documents
- **Internationalization**: Supports English, Spanish, Chinese, German, French, Portuguese
- **AI Translation**: Configured with formal/precise style guide

### Schema Organization
Schema types are located in `apps/studio/src/schemaTypes/`:
- **Documents**: `blog`, `counter`, `product`, `workflow-metadata`
- **Blocks**: `hero`, `left-right-content` for rich content composition
- All types use `defineType`, `defineField`, `defineArrayMember` helpers
- Each type exports a named const matching the filename

### Functions & Blueprints
- **Auto-increment function**: Handles document ID generation for `productAutoIncrement` type
- **Test function**: Development/testing function
- Deployed via `@sanity/blueprints` package

### Turbo Configuration
- Uses TUI interface (`"ui": "tui"`)
- Build outputs cached in `.next/**` (excluding cache directory)
- Development tasks run persistently without caching
- Lint and type-check tasks depend on upstream packages completing first

## Type Generation Workflow
1. Extract schema: `npx sanity@latest schema extract --enforce-required-fields`
2. Generate types: `npx sanity@latest typegen generate`
3. For monorepo setups, extract to web folder: `npx sanity@latest schema extract --path=../web/sanity/extract.json`

## Sanity Best Practices (from .cursor/rules)
- Content models should represent what things are, not what they look like
- Always use helper functions: `defineType`, `defineField`, `defineArrayMember`  
- String fields with <5 options must use `options.layout: "radio"`
- Images must include `options.hotspot: true`
- Avoid single reference fields - always use arrays
- Include icons and rich previews for document types
- Use groups and fieldsets for complex schemas
- Write GROQ queries with SCREAMING_SNAKE_CASE variables
- Always use `defineQuery` wrapper and parameters (never string interpolation)

## Linting & Formatting
- ESLint configuration extends base, Next.js, and Prettier configs
- Prettier settings: no semicolons, 100 char width, no bracket spacing, single quotes
- Format command: `prettier --write "**/*.{ts,tsx,md}"`
- Maximum warnings: 0 (strict mode)

## Environment Requirements  
- Node.js >= 18
- Package manager: npm@10.9.2
- TypeScript 5.9.2