# GitHub Actions Setup for Signal-Σ

This document explains how to set up GitHub Actions for automated testing, building, and publishing of the Signal-Σ library.

## Overview

We have two main workflows:

1. **CI Workflow** (`.github/workflows/ci.yml`) - Runs on every push and pull request
2. **Publish Workflow** (`.github/workflows/publish.yml`) - Runs when a release is published

## CI Workflow

The CI workflow runs on:
- Push to `main` or `master` branches
- Pull requests to `main` or `master` branches

### What it does:
- Tests on Node.js versions 16, 18, and 20
- Runs linting (`npm run lint`)
- Checks code formatting (`npm run format:check`)
- Builds the package (`npm run build`)
- Runs tests (`npm test`)
- Uploads coverage to Codecov (Node.js 18 only)

## Publish Workflow

The publish workflow runs when:
- A GitHub release is published

### What it does:
1. **Test Phase**: Runs the same tests as CI on all Node.js versions
2. **Publish Phase**: 
   - Builds the package
   - Verifies the package version matches the release tag
   - Publishes to NPM

## Setup Instructions

### 1. Repository Setup

Make sure your repository has:
- `main` or `master` as the default branch
- The workflow files in `.github/workflows/`

### 2. NPM Token Setup

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Go to Access Tokens in your account settings
3. Generate a new token with "Automation" type
4. In your GitHub repository, go to Settings → Secrets and variables → Actions
5. Add a new repository secret named `NPM_TOKEN` with your token value

### 3. Codecov Setup (Optional)

1. Go to [codecov.io](https://codecov.io) and sign up with your GitHub account
2. Add your repository to Codecov
3. No additional secrets needed - Codecov works with public repositories automatically

### 4. Package.json Requirements

Your `package.json` must have:
- Correct `name`, `version`, `description`
- `repository`, `homepage`, `bugs` URLs
- `files` array specifying what to publish
- Required scripts: `lint`, `format:check`, `build`, `test`

### 5. Release Process

To publish a new version:

1. **Update version in package.json**:
   ```bash
   npm version patch  # or minor, major
   ```

2. **Push changes**:
   ```bash
   git push origin main --tags
   ```

3. **Create GitHub Release**:
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Choose the tag you just pushed
   - Add release notes
   - Click "Publish release"

4. **Automatic Publishing**:
   - The publish workflow will automatically run
   - It will test the code and publish to NPM
   - Check the Actions tab for progress

## Troubleshooting

### Common Issues:

1. **Version Mismatch Error**:
   - Make sure the version in `package.json` matches your release tag
   - Tags can be `v1.0.0` or `1.0.0` format

2. **NPM Publish Fails**:
   - Check that your NPM_TOKEN secret is set correctly
   - Verify you have publish permissions for the package name

3. **Tests Fail**:
   - All tests must pass before publishing
   - Check the CI workflow logs for details

4. **Linting/Formatting Errors**:
   - Run `npm run fix` locally to auto-fix issues
   - Commit and push the fixes

## Scripts Used

The workflows expect these npm scripts:
- `lint` - Run ESLint
- `format:check` - Check Prettier formatting
- `build` - Build the package
- `test` - Run all tests

## File Structure

```
.github/
├── workflows/
│   ├── ci.yml          # Continuous Integration
│   └── publish.yml     # NPM Publishing
```

## Security

- NPM tokens are stored as GitHub secrets
- Workflows only run on specific events
- Version verification prevents accidental publishes
- All tests must pass before publishing
