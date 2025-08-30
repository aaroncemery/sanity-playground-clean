# Environment Configuration

This studio is configured to work with multiple Sanity datasets for different environments.

## Datasets Available

- **development**: For local development and testing
- **production**: For live/production content

## Environment Files

- `.env.local`: Contains your local environment settings (automatically uses `development` dataset)
- `.env.production`: Contains production environment settings (uses `production` dataset)

## Available Scripts

### Development
- `npm run dev` - Start development server with development dataset
- `npm run dev:prod` - Start development server with production dataset

### Building
- `npm run build` - Build with development dataset
- `npm run build:prod` - Build with production dataset

### Deployment
- `npm run deploy` - Deploy to production (automatically switches to production dataset)
- `npm run deploy:dev` - Deploy development version with source maps

## Switching Between Environments

### For Development (Default)
The studio will automatically use the development dataset when you run:
```bash
npm run dev
```

### For Production Access
To work with production data locally:
```bash
npm run dev:prod
```

### Manual Environment Switching
You can also manually switch environments by copying the appropriate env file:
```bash
# Switch to production
cp .env.production .env.local

# Switch back to development  
cp .env.development .env.local  # If you create this file
```

## Notes

- The `.env.local` file is git-ignored to prevent accidental commits of local settings
- Always ensure you're working in the correct dataset before making changes
- The development dataset is completely separate from production, so feel free to experiment
