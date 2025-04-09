
# Web Deployment Instructions

This document provides instructions for building and deploying the web version of the application.

## Building for Web

To build the application for web deployment:

```bash
# Run the Vite build process
npm run build

# Or use the deployment prep script (recommended)
node scripts/deploy-web.js
```

## Deployment

After building, you'll have a `dist` folder containing the compiled application. Deploy these files to your preferred web hosting service:

### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages, etc.)
1. Upload the contents of the `dist` folder to your hosting provider
2. Configure the hosting service for a single-page application (SPA)
3. Ensure all routes redirect to `index.html` (for client-side routing)

### Option 2: Manual Server Deployment
1. Copy the `dist` folder to your server
2. Configure your web server (nginx, Apache, etc.) to serve the files
3. Set up URL rewriting for SPA routing

## Environment Configuration

For production environments, ensure you've configured:

1. Correct Supabase project URL and API keys
2. OAuth providers (Google, Apple) with the correct callback URLs
3. Any other environment variables needed for your deployment

## Running Locally

To test the web version locally before deployment:

```bash
npm run dev
```

This will start a local development server that mirrors the production build behavior.

## Troubleshooting

If you encounter issues with authentication callbacks:
1. Verify that your Supabase OAuth callback URLs include your web domain
2. Check that Google/Apple OAuth settings include the correct redirect URLs
3. Ensure your application handles URL parameters correctly

For other deployment issues, check the browser console for specific errors.
