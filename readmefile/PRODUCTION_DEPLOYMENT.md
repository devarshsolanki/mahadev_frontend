# Production Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Run `npm run lint` - all linting rules pass
- [ ] Run `npm run test` - all tests pass
- [ ] No console logs or debugger statements
- [ ] All environment variables configured

### Security
- [ ] `.env` files in `.gitignore`
- [ ] No sensitive data in source code
- [ ] HTTPS enabled for API calls
- [ ] CORS properly configured
- [ ] Security headers set in `public/_headers`

### Performance
- [ ] Bundle size analyzed and optimized
- [ ] Code splitting enabled
- [ ] Images optimized and served
- [ ] No unused dependencies
- [ ] Lazy loading implemented for routes

### Build & Deployment
- [ ] Production build succeeds: `npm run build:production`
- [ ] Build output in `dist/` directory
- [ ] Static assets compressed (.gzip)
- [ ] Source maps disabled for production
- [ ] CSP headers configured

## Build Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test

# Build for production
npm run build:production

# Build for staging
npm run build:staging

# Preview build
npm preview
```

## Environment Setup

### Production (.env.production)
```
VITE_API_BASE=https://api.ganeshmart.com/api/v1
VITE_USE_HTTP_ONLY_COOKIES=true
```

### Staging (.env.staging)
```
VITE_API_BASE=https://staging-api.ganeshmart.com/api/v1
VITE_USE_HTTP_ONLY_COOKIES=true
```

## Security Headers (Already configured in public/_headers)
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Cache-Control: Proper cache strategy by content type

## Deployment Platforms

### Netlify
1. Build command: `npm run build:production`
2. Publish directory: `dist`
3. Environment variables configured in Netlify UI
4. Automatic SSL/HTTPS enabled
5. `public/_redirects` handles SPA routing

### Vercel
1. Build command: `npm run build:production`
2. Output directory: `dist`
3. Environment variables in Vercel dashboard
4. Automatic SSL/HTTPS
5. Auto-generated `vercel.json` for SPA routing

### GitHub Pages
1. Configure repository settings
2. Enable GitHub Pages from `dist` branch
3. Run: `npm run build:production`
4. Deploy: `git push origin main`

## Error Tracking Setup (Recommended)

Add Sentry for production error monitoring:

```bash
npm install @sentry/react @sentry/tracing
```

Initialize in `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

## Monitoring

- Set up performance monitoring (Core Web Vitals)
- Configure uptime monitoring
- Set up error alerting via Sentry
- Monitor API response times
- Track bundle size changes

## Rollback Plan

1. Keep previous build artifacts
2. Maintain git tags for each release
3. Database migrations must be reversible
4. Keep API backward compatibility
