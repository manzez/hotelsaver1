# Vercel Setup Guide

This guide walks through setting up the HotelSaver deployment on Vercel with proper environment separation.

## Prerequisites

- Vercel CLI installed: `npm install -g vercel`
- Vercel account with project created
- GitHub repository connected to Vercel

## Step 1: Project Configuration in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project `hotelsaver1`
3. Go to **Settings** → **Git**

### Configure Git Integration

- **Production Branch**: `main` (set to manual deployments)
- **Preview Branches**: `develop`, `feature/*`
- **Deploy on push**: 
  - Disable for `main` 
  - Enable for `develop`

## Step 2: Environment Variables

Go to **Settings** → **Environment Variables**

### Add the following variables:

**All Environments:**
```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://hotelsaver1.vercel.app
```

**Production Only:**
```
NEXT_PUBLIC_BASE_URL=https://hotelsaver.ng
ENVIRONMENT=production
```

**Staging/Preview Only:**
```
NEXT_PUBLIC_BASE_URL=https://hotelsaver1-staging.vercel.app
ENVIRONMENT=staging
```

### Protected Variables (marked with lock icon):
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- All API keys and secrets

## Step 3: GitHub Actions Secrets

To enable GitHub Actions CI/CD, add these secrets to your GitHub repository:

Go to **Settings** → **Secrets and variables** → **Actions**

```
VERCEL_TOKEN=<your_vercel_token>
VERCEL_ORG_ID=<your_org_id>
VERCEL_PROJECT_ID=<your_project_id>
```

### Get these values:

**VERCEL_TOKEN:**
```bash
vercel tokens create
```

**VERCEL_ORG_ID & VERCEL_PROJECT_ID:**
```bash
vercel project list
vercel project select hotelsaver1
cat .vercel/project.json
```

## Step 4: Configure Auto-Deployments

### For Staging (develop branch):

1. In Vercel, go to **Deployments**
2. Ensure `develop` branch is set to auto-deploy
3. Set environment to **Staging**

### For Production (main branch):

1. Disable auto-deploy on `main`
2. Production requires manual deployment via:
   - `npm run deploy:production` (locally)
   - Or GitHub Actions (with workflow_dispatch trigger)
   - Or Vercel CLI: `vercel deploy --prod`

## Step 5: Verify Setup

Test the deployment process:

### Test Staging Auto-Deploy
```bash
git checkout develop
echo "test" >> test.txt
git add test.txt
git commit -m "test: verify staging auto-deploy"
git push origin develop
# Check Vercel dashboard - should auto-deploy
```

### Test Production Manual Deploy
```bash
git checkout main
npm version patch
git push origin main --tags
npm run deploy:production
# Verify on https://hotelsaver1.vercel.app
```

## Step 6: Monitor Deployments

### Vercel Dashboard
- Check build logs
- View deployment history
- Monitor performance metrics

### GitHub Actions
- View workflow runs: https://github.com/manzez/hotelsaver1/actions
- Check deployment logs for each run

### Command Line
```bash
# View deployments
vercel ls

# Watch logs
vercel logs hotelsaver1 --follow

# Rollback if needed
vercel rollback hotelsaver1
```

## Troubleshooting

### Build Fails
1. Check `.next` directory exists locally after `npm run build`
2. Ensure all environment variables are set in Vercel
3. Review build logs in Vercel dashboard

### Preview Deployments Not Working
1. Ensure GitHub integration is connected
2. Check that branch is in `Preview Branches` setting
3. Verify workflow file `.github/workflows/deploy.yml` is valid

### Production Deployment Issues
1. Manually test build locally: `npm run build && npm start`
2. Check environment variables for production
3. Review `DEPLOYMENT_HISTORY.md` for recent deployments

### Version Mismatch
If versions don't match between git tag and package.json:
```bash
git tag -d v1.0.5  # Delete incorrect tag locally
git push origin --delete v1.0.5  # Delete from GitHub
npm version patch  # Create correct version
git push origin main --tags
```

## Maintenance Tasks

### Monthly Checks
- Review deployment history
- Check for failed deployments
- Monitor build times and performance
- Verify all environment variables are current

### Before Major Release
- Run full test suite: `npm run test:all`
- Test staging deployment
- Verify database migrations
- Check API integrations

### After Production Deployment
- Monitor error logs (Sentry)
- Check analytics for anomalies
- Verify all critical flows work
- Monitor infrastructure costs

## Rollback Procedure

If production deployment fails:

```bash
# Find previous working version
vercel ls

# Rollback to previous deployment
vercel promote <previous-deployment-id>

# Or manually redeploy previous commit
git revert <bad-commit>
npm version patch
npm run deploy:production
```

## Additional Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- GitHub Actions: https://docs.github.com/en/actions
- HotelSaver DEPLOYMENT.md: See project documentation

## Support Contacts

- Vercel Support: https://vercel.com/help
- GitHub Support: https://support.github.com
- Internal Team: [Your team contact info]
