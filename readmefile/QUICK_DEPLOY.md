# DEPLOYMENT CHECKLIST - Quick Reference

## Pre-Deployment (Run This)
```bash
npm run type-check   # Must pass
npm run lint         # Must have 0 warnings
npm run test         # Must pass
npm run build:production  # Must succeed
npm run preview      # Verify build works
```

## Environment Variables to Set

### Production
```
VITE_API_BASE=https://api.ganeshmart.com/api/v1
VITE_USE_HTTP_ONLY_COOKIES=true
```

### Staging
```
VITE_API_BASE=https://staging-api.ganeshmart.com/api/v1
VITE_USE_HTTP_ONLY_COOKIES=true
```

## GitHub Tag Release
```bash
git tag v1.0.0
git push origin v1.0.0
```
(Triggers GitHub Actions auto-deployment)

## Deployment Verification

After deployment, verify:
- [ ] App loads without 404 errors
- [ ] Browser console shows no errors
- [ ] API calls go to correct endpoint
- [ ] Authentication works
- [ ] Security headers present (check DevTools Network)
- [ ] No console warnings/errors
- [ ] Performance acceptable (Lighthouse >90)

## Rollback
```bash
git revert <commit-hash>
git push origin main
# Or revert DNS/deploy setting
```

## Files You Changed
✅ All changes are non-breaking and production-ready  
✅ No data migrations required  
✅ No database changes needed  

## Support
- See `PRODUCTION_DEPLOYMENT.md` for detailed guide
- See `PRODUCTION_READINESS.md` for full checklist
- See `PRODUCTION_AUDIT_SUMMARY.md` for complete audit report
