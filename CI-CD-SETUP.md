# 🚀 CI/CD Pipeline Setup Guide

This guide will help you set up the complete CI/CD pipeline with regression testing for HotelSaver.ng.

## 📋 Prerequisites

### 1. GitHub Repository Setup
```bash
# If not already done, initialize Git repository
git init
git add .
git commit -m "Initial commit with CI/CD pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hotelsaver-ng.git
git push -u origin main
```

### 2. Vercel Account & Project Setup
1. **Create Vercel Account**: https://vercel.com/signup
2. **Import Project**: Connect your GitHub repository
3. **Get Required Tokens**:
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token with deployment permissions
   - Note your ORG_ID and PROJECT_ID from project settings

## 🔐 GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here  
VERCEL_PROJECT_ID=your_project_id_here
```

### How to Find Vercel IDs:
```bash
# Install Vercel CLI
npm i -g vercel

# Login and get project info
vercel login
vercel link  # Follow prompts to link your project

# Get IDs from .vercel/project.json
cat .vercel/project.json
```

## 🎯 Pipeline Overview

### **Stage 1: Regression Testing** 🧪
- **API Tests**: Backend endpoint validation
- **E2E Core Tests**: Search, negotiation, booking flows  
- **Mobile Tests**: Cross-device compatibility
- **Parallel Execution**: 3 test suites run simultaneously

### **Stage 2: Code Quality** 🔍
- **Linting**: Code style and best practices
- **Type Checking**: TypeScript validation
- **Security Audit**: Dependency vulnerability scan
- **Bundle Analysis**: Performance optimization checks

### **Stage 3: Staging Deployment** 🚀
- **Preview Deployment**: Vercel preview URL
- **Smoke Testing**: Basic functionality verification
- **PR Comments**: Automatic staging URL posting

### **Stage 4: Production Deployment** 🌟
- **Production Deployment**: Only on main branch
- **Post-Deploy Testing**: Live environment validation
- **Environment Protection**: Manual approval required

## 🛠️ Local Development Workflow

### Quick Regression Test (Before Pushing)
```bash
# Run the pre-deployment validation script
./pre-deploy-validation.sh

# Or run individual test suites
npm run test:regression
npm run test:api
npm run test
```

### Manual Testing Commands
```bash
# Setup testing environment
npm run ci:setup

# Run all tests with reports
npm run ci:test:all

# Test specific areas
npm run test:search    # Search functionality
npm run test:booking   # Negotiation + booking
npm run test:mobile    # Mobile experience

# Generate reports
npm run report:full
```

## 🔄 Workflow Triggers

### Automatic Triggers
- **Push to `main`**: Full pipeline → Production deployment
- **Push to `develop`**: Full pipeline → Staging deployment  
- **Pull Request**: Full pipeline → Staging deployment + PR comments

### Manual Triggers
```bash
# Manual deployment (after tests pass)
npm run deploy:staging
npm run deploy:production

# Manual testing
./pre-deploy-validation.sh
```

## 📊 Test Results & Reports

### GitHub Actions Dashboard
- **Workflow Runs**: See all pipeline executions
- **Test Artifacts**: Download detailed test reports
- **PR Comments**: Automatic test result summaries

### Local Reports
```bash
# View test reports
npm run test:report                    # Playwright UI
open tests/reports/latest-report.html  # HTML report
```

### Report Locations
- **HTML Reports**: `tests/playwright-report/`
- **JSON Results**: `tests/reports/`
- **Screenshots**: `tests/test-results/`
- **Videos**: Failure recordings automatically captured

## 🚦 Quality Gates

The pipeline enforces these quality gates before deployment:

### ✅ **Must Pass (Blocking)**
- **API Tests**: All backend endpoints functional
- **Core E2E Tests**: Search, negotiation, booking work
- **Build Process**: Application builds successfully
- **Type Safety**: No TypeScript errors

### ⚠️ **Should Pass (Non-blocking)**
- **Linting**: Code style consistency
- **Security Audit**: No high-severity vulnerabilities
- **Mobile Tests**: Cross-device compatibility
- **Bundle Size**: Performance within limits

## 🔧 Pipeline Customization

### Modify Test Strategy
Edit `.github/workflows/ci-cd-pipeline.yml`:

```yaml
# Add/remove test suites
strategy:
  matrix:
    test-suite: [api, e2e-core, e2e-mobile, e2e-performance]

# Adjust timeouts
timeout-minutes: 45  # Increase for slow environments

# Change Node.js version
NODE_VERSION: '20'
```

### Environment-Specific Configuration
```yaml
# Add staging/production environment variables
env:
  BASE_URL: ${{ github.ref == 'refs/heads/main' && 'https://your-domain.com' || 'https://staging.your-domain.com' }}
  API_TIMEOUT: 30000
```

## 🐛 Troubleshooting

### Common Issues

#### Tests Failing in CI but Passing Locally
```bash
# Check Node.js version consistency
node --version  # Should match NODE_VERSION in workflow

# Verify environment variables
echo $BASE_URL

# Run tests with same reporter
cd tests && npx playwright test --reporter=html
```

#### Deployment Failures
```bash
# Verify Vercel tokens
vercel whoami
vercel projects ls

# Check build logs
npm run build 2>&1 | tee build.log
```

#### Slow Test Execution
```bash
# Run tests in parallel locally
npx playwright test --workers=2

# Reduce test scope for debugging
npx playwright test tests/e2e/01-search-flow.spec.ts
```

### Debug Mode
```bash
# Run pipeline script locally with debug
DEBUG=true ./pre-deploy-validation.sh

# Playwright debug mode
cd tests && npx playwright test --debug
```

## 📈 Performance Optimization

### Pipeline Speed Improvements
- **Caching**: Node modules cached between runs
- **Parallel Testing**: Multiple test suites run simultaneously  
- **Selective Testing**: Only run relevant tests for specific changes
- **Artifact Optimization**: Compress and limit retention

### Test Optimization
```bash
# Run only changed test files
npx playwright test --grep="hotel search"

# Use test tags for grouping
npx playwright test --grep="@smoke"
```

## 🎉 Success Metrics

After setup, you should see:

### ✅ **Automated Quality Assurance**
- **Zero Manual Testing**: All regression testing automated
- **Fast Feedback**: Test results within 5-10 minutes
- **Confident Deployments**: No production bugs from untested code

### 📊 **Visibility & Reporting**
- **PR Comments**: Automatic test status on pull requests
- **Detailed Reports**: HTML reports with screenshots/videos
- **Trend Analysis**: Track test success rates over time

### 🚀 **Streamlined Deployment**
- **One-Click Deployment**: Automatic after tests pass
- **Rollback Safety**: Easy to revert problematic deployments
- **Environment Consistency**: Same tests run in all environments

---

## 🆘 Support

- **Pipeline Issues**: Check GitHub Actions logs and workflow files
- **Test Issues**: Review `tests/README.md` and Playwright documentation
- **Vercel Issues**: Check Vercel dashboard and deployment logs
- **Code Issues**: Review test reports and error screenshots

**Your CI/CD pipeline is now ready to ensure reliable, tested deployments! 🚀**