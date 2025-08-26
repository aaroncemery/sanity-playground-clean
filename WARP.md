# Sanity Playground Clean - Warp Documentation

## Project Overview
This is a clean Sanity Studio playground built with Turbo monorepo architecture. It includes:

- **Sanity Studio** (`apps/studio/`) - Content management system
- **Web App** (`apps/web/`) - Frontend application  
- **Docs** (`apps/docs/`) - Documentation site
- **Functions** (`functions/`) - Serverless functions
- **Packages** (`packages/`) - Shared packages and configurations

## Sanity Studio Configuration

### Project Details
- **Project ID**: `a09jbdjz`
- **Dataset**: `production`
- **Auto-updates**: Enabled

### Plugins Enabled
- Structure Tool (content management interface)
- Vision Tool (query testing)
- Presentation Tool (live preview)

### Workflow System
Custom document actions implemented for workflow management:
- `SmartPublishAction` - Intelligent publishing
- `ApproveAction` - Content approval
- `RejectAction` - Content rejection  
- `ResetToDraftAction` - Reset to draft state

Currently enabled for `product` document type.

## Development Commands

From the studio directory (`apps/studio/`):
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run deploy   # Deploy to Sanity
```

From the root directory:
```bash
npm run dev      # Start all apps in development
npm run build    # Build all packages
```

## Recent Development Notes
- This is a clean version without the Vite import issues experienced in the turbo version
- All dependencies should resolve correctly
- Schema definitions are properly structured

## Schema Structure
The schema types are organized in `apps/studio/src/schemaTypes/`:
- Document types
- Field definitions  
- Block content types
- Custom validation rules

## Presentation Tool
Configured with live preview capabilities connecting to the web application for real-time content preview.

## Development Guidelines

### Cursor Rules
This project includes comprehensive Cursor AI rules in `.cursor/rules` that provide:

- **Schema Best Practices**: Use `defineType`, `defineField`, `defineArrayMember` functions
- **Content Modeling**: Model what things are, not what they look like
- **Field Guidelines**: Radio layouts for small lists, hotspot for images, arrays for references
- **Schema Organization**: Each type in its own file with named exports
- **GROQ Query Standards**: SCREAMING_SNAKE_CASE variables, proper projections, parameters
- **TypeScript Generation**: Schema extraction and type generation workflows

### Key Development Patterns
- Always use helper functions from `sanity` package
- Include icons and rich previews for document types
- Use groups and fieldsets for complex schemas
- Write validation rules with helpful error messages
- Extract schemas and generate types after changes

---
*Created: August 26, 2025*
*Last Updated: August 26, 2025*
