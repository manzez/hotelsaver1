# Deployment Quick Reference

## Current Version
```
1.0.5
```

## Quick Commands

### Check Current Version
```bash
npm run check:version
```

### Staging Deployment (Automatic)
Happens automatically when you push to `develop` branch:
```bash
git checkout develop
git merge main  # If needed
git push origin develop
```

### Production Deployment (Manual, Main Branch Only)

**Step 1: Update version** (run ONE of these)
```bash
npm version patch    # Bug fixes
npm version minor    # New features
npm version major    # Breaking changes
```

**Step 2: Deploy to production**
```bash
npm run deploy:production
```

**Step 3: Verify**
- Check https://hotelsaver1.vercel.app
- Monitor logs: `vercel logs hotelsaver1`

## Environment URLs

- **Production**: https://hotelsaver1.vercel.app
- **Staging**: https://hotelsaver1-staging.vercel.app
- **Development**: http://localhost:3001

## Branch Strategy

| Branch | Environment | Auto-Deploy | Manual Deploy |
|--------|-------------|-------------|---------------|
| `main` | Production | ❌ No | ✅ Yes (`npm run deploy:production`) |
| `develop` | Staging | ✅ Yes | N/A |
| `feature/*` | Preview | Via PR | N/A |

## Deployment Checklist

- [ ] Code reviewed and merged
- [ ] All tests passing
- [ ] Version bumped (if production)
- [ ] Deployed
- [ ] Verified on live site
- [ ] Checked logs for errors

## Rollback

If production deployment has issues:

```bash
# Find previous version
git log --oneline | grep "v1.0"

# Revert to working commit
git revert <bad-commit-hash>
git push origin main

# Or manually fix and bump patch version
npm version patch
npm run deploy:production
```

## Monitoring

**Vercel Dashboard**: https://vercel.com/dashboard

**Real-time Logs**:
```bash
vercel logs hotelsaver1 --follow
```

**Deployment List**:
```bash
vercel ls
```

## Notes

- Production deployments are MANUAL ONLY for safety
- Staging automatically deploys from `develop` on each push
- All versions are tracked in `DEPLOYMENT_HISTORY.md`
- Each deployment records version, date, status, and changes

## See Also

- `DEPLOYMENT.md` - Full deployment process documentation
- `DEPLOYMENT_HISTORY.md` - Complete deployment history
- `.github/workflows/deploy.yml` - GitHub Actions CI/CD configuration
