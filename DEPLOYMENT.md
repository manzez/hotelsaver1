# HotelSaver Deployment Process

## Overview
This document outlines the proper deployment process for HotelSaver with separate development and production environments, semantic versioning, and deployment tracking.

## Branch Strategy

- **`main`** - Production-ready code (manual deployment only via GitHub UI or CLI)
- **`develop`** - Development branch (auto-deploys to staging on push)
- **Feature branches** - `feature/*` (reviewed via PR before merge to develop)

## Environments

### Development/Staging
- **URL**: https://hotelsaver1-staging.vercel.app
- **Branch**: `develop`
- **Auto-deploys**: Yes (on every push to `develop`)
- **For**: Testing, QA, feature validation
- **Preview URLs**: Generated for each PR

### Production
- **URL**: https://hotelsaver.ng (custom domain) or https://hotelsaver1.vercel.app
- **Branch**: `main`
- **Auto-deploys**: No (manual only)
- **For**: Live users
- **Deployment**: Manual via `npm run deploy:production` or GitHub UI

## Version Management

### Semantic Versioning
We use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes and patches

### Updating Version

Update `package.json` version before each production release:

```bash
# For patch releases (bug fixes)
npm version patch

# For minor releases (new features)
npm version minor

# For major releases (breaking changes)
npm version major
```

These commands automatically:
1. Update `package.json` version
2. Create a git tag
3. Generate a commit with the version bump

Then push with tags:
```bash
git push origin main --tags
```

## Deployment Process

### Development/Staging Deployment

**Automatic** - Happens automatically when you push to `develop` branch:

```bash
# Make changes on feature branch
git checkout -b feature/my-feature

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# Create PR, review, and merge to develop
# Vercel automatically deploys to staging
```

### Production Deployment

**Manual process with versioning**:

1. **Prepare release** - Update changelog and version:
   ```bash
   # Create a release branch
   git checkout main
   git pull origin main
   
   # Update version (choose one)
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   
   # Verify the version update
   git log -1
   ```

2. **Deploy to production**:
   ```bash
   npm run deploy:production
   ```

3. **Monitor deployment**:
   - Check https://vercel.com/dashboard
   - View logs: `vercel logs hotelsaver1`
   - Test the live site

4. **Rollback if needed**:
   ```bash
   # If deployment failed, rollback the version commit
   git reset HEAD~1
   git checkout package.json
   git checkout package-lock.json
   ```

## Deployment Tracking

### Deployment History
A `DEPLOYMENT_HISTORY.md` file tracks all deployments:

```markdown
## Deployment History

### v1.0.5 - 2024-11-12
- **Environment**: Production
- **Branch**: main
- **Changes**: Fixed search dropdown auto-close, improved performance with debouncing
- **Status**: ✅ Successful
- **URL**: https://hotelsaver1.vercel.app
- **Deployed By**: Your Name
- **Duration**: 2m 15s

### v1.0.4 - 2024-11-11
- **Environment**: Staging
- **Branch**: develop
- **Changes**: Added new hotel filters
- **Status**: ✅ Successful
- **URL**: https://hotelsaver1-staging.vercel.app
- **Deployed By**: Auto (GitHub Actions)
```

This file is automatically updated during CI/CD pipeline execution.

## GitHub Actions CI/CD Pipeline

The pipeline (`.github/workflows/deploy.yml`) handles:

1. **On PR to develop/main**:
   - Run linting
   - Run tests
   - Generate preview deployment
   - Post preview URL to PR comments

2. **On push to develop**:
   - Run full test suite
   - Build project
   - Deploy to staging
   - Record deployment in history

3. **On push to main (with tag)**:
   - Run full test suite
   - Build project
   - Deploy to production
   - Record deployment in history

## Environment Variables

### Staging (.env.staging)
```
NEXT_PUBLIC_BASE_URL=https://hotelsaver1-staging.vercel.app
ENVIRONMENT=staging
```

### Production (.env.production)
```
NEXT_PUBLIC_BASE_URL=https://hotelsaver.ng
ENVIRONMENT=production
```

## Vercel Configuration

### Project Settings
1. Go to https://vercel.com/hotelsaver1
2. Settings → Deployments
3. **Production Branch**: `main` (manual deployment)
4. **Preview Branches**: `develop`, `feature/*`
5. **Auto-deploy on Push**: Disabled for `main`, Enabled for `develop`

### Environment Variables in Vercel
Set the following at https://vercel.com/hotelsaver1/settings/environment-variables:

- `NEXT_PUBLIC_BASE_URL` - Different per environment
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - NextAuth secret
- Other required secrets

## Rollback Procedure

If production deployment has issues:

```bash
# 1. Identify previous working version
git log --oneline | grep "v1.0"

# 2. Revert to previous tag
git checkout v1.0.4

# 3. Deploy that version
npm run deploy:production

# 4. After fixing, increment version again
npm version patch
```

## Release Checklist

Before deploying to production:

- [ ] All tests pass (`npm run test:all`)
- [ ] Code reviewed and approved
- [ ] Changelog updated
- [ ] Version bumped (`npm version patch/minor/major`)
- [ ] Environment variables configured in Vercel
- [ ] Database migrations run (if any)
- [ ] Smoke tests pass on staging
- [ ] Team notified of upcoming deployment

## Monitoring After Deployment

Post-deployment:

1. Check Sentry for errors: https://sentry.io
2. Monitor Vercel metrics: https://vercel.com/dashboard
3. Test critical user flows
4. Monitor real-time logs: `vercel logs hotelsaver1 --follow`
5. Check analytics for normal traffic patterns

## Quick Reference

```bash
# View deployment history
cat DEPLOYMENT_HISTORY.md

# Check current version
grep '"version"' package.json

# Staging deployment (automatic)
git push origin develop

# Production deployment (manual, after version bump)
npm version patch
git push origin main --tags
npm run deploy:production

# Check deployment logs
vercel logs hotelsaver1

# View Vercel deployments
vercel ls
```

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Check Vercel build logs
3. Contact DevOps team
