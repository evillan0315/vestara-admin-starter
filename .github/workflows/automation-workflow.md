# GitHub Workflow Automation

This repository contains GitHub Actions workflows to automate the development lifecycle, including commits, push operations, and pull request management.

## Workflows

### `code-quality.yml`
Main CI/CD pipeline that validates code quality and runs tests for both frontend and backend applications. Integrates with the existing TypeScript, ESLint, and test infrastructure.

## Usage

1. Push code to the repository
2. GitHub Actions will automatically run validation checks
3. Feature branches create PRs with automated commit messages
4. Approved feature branches merge to develop
5. Release branches prepare for production deployment

## Key Features

- Automated commit generation
- Branch protection and validation
- PR creation and management
- Automated merging for feature branches
- Weekly health checks

```yaml
gitbash
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test
      - name: Build applications
        run: pnpm build
```
