# GitHub Repository Setup

## Files to Configure

### 1. GitHub Workflows (.github/workflows/)
Create CI/CD pipelines for automated testing and deployment.

### 2. Code Coverage
- [ ] Add coverage badges to README
- [ ] Configure coverage thresholds

### 3. Branch Protection Rules
Settings > Branches > main:
- [ ] Require pull request reviews (2)
- [ ] Require status checks to pass:
  - Type checking (tsc)
  - Linting (eslint)
  - Tests (vitest)
  - Build (vite build)
- [ ] Require branches to be up to date
- [ ] Include administrators

### 4. Issue Templates
Create in `.github/ISSUE_TEMPLATE/`:
- Bug report
- Feature request
- Documentation

### 5. Pull Request Template
Create `.github/pull_request_template.md`:
- Description of changes
- Type of change (fix/feature/docs)
- Related issues
- Testing performed
- Screenshots (if UI changes)

## Repository Information

### README.md Updates Required
- [ ] Project overview
- [ ] Quick start guide
- [ ] Deployment instructions
- [ ] Contributing guidelines
- [ ] License information
- [ ] Contributors

### Documentation Files
- [ ] CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md
- [ ] SECURITY.md
- [ ] LICENSE

## CI/CD Pipeline

### Essential GitHub Actions
1. **Build and Test** (on push/PR)
   - Run type checking
   - Run linting
   - Run tests
   - Build artifacts

2. **Deploy** (on tag/release)
   - Build for production
   - Deploy to production environment

## Release Process

1. Create release branch: `release/v1.0.0`
2. Update version in package.json
3. Update CHANGELOG.md
4. Create pull request
5. After merge, create git tag: `v1.0.0`
6. Push tag triggers deployment
