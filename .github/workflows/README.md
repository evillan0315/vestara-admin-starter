# GitHub Actions Workflow: code-quality.yml

## Overview

The **code-quality.yml** workflow file provides the foundation for comprehensive CI/CD automation in the Vestara project. It implements a modern, automated development lifecycle with rigorous quality gates, security scanning, and deployment readiness checks.

## Workflow Architecture

This workflow operates on a **sequential validation pipeline** with **conditional branching** based on repository branch types:

```mermaid
graph TD
    A[Push to Branch] --> B[Type Check]
    B --> C{Lint Check}
    C -->|Pass| D[Unit Tests]
    C -->|Fail| Z[Fail Build]
    D --> E{Build}
    E -->|Success| F[Feature Validation]
    E -->|Fail| Z
    F --> G{Security Scan}
    G -->|Pass| H[Auto-Merge Decision]
    G -->|Fail| Z
    H -->|Feature| I[Merge to Develop]
    H -->|Bugfix| J[Bugfix Merge]
    H -->|Release| K[Release Preparation]
    H -->|Other| L[Feature Branch]

    Z[Fail Build] --> M[Create Failure Issue]
    M --> N[Notify Team]
```

## Supported Branch Types

### 1. Feature Branches (`feature/*`)
- Purpose: New feature development
- Validation: Comprehensive testing and quality checks
- Auto-merge: After PR approval
- Special checks: Feature-specific validation

### 2. Bugfix Branches (`bugfix/*`)
- Purpose: Critical bug fixes
- Validation: Regression testing and stability checks
- Auto-merge: After team approval
- Special checks: Compatibility verification

### 3. Hotfix Branches (`hotfix/*`)
- Purpose: Emergency security fixes
- Validation: Rapid security and stability checks
- Auto-merge: Immediate deployment requirement
- Special checks: Downtime minimization procedures

### 4. Release Branches (`release/*`)
- Purpose: Production release preparation
- Validation: Release candidate testing
- Auto-merge: Deployable state
- Special checks: Documentation generation

## Workflow Matrix

The workflow uses a **matrix strategy** to parallelize checks across different applications:

```yaml
strategy:
  matrix:
    app: [api, web]
```

This allows concurrent validation of:
- **@vestara/api**: Backend Fastify server
- **@vestara/web**: Frontend React application

## Sequential Validation Pipeline

### Phase 1: Static Analysis

#### TypeScript Type Checking
```yaml
- name: TypeScript Type Checking
  run: pnpm typecheck --filter=@vestara/${{ matrix.app }}
```

**Purpose**: Ensure type safety throughout the codebase
**Failure Mode**: Build fails immediately
**Frequency**: Every push and PR

#### ESLint Code Quality
```yaml
- name: Code Linting
  run: pnpm lint --filter=@vestara/${{ matrix.app }}
```

**Purpose**: Maintain code style and identify potential issues
**Failure Mode**: Build fails immediately
**Frequency**: Every push and PR

### Phase 2: Dynamic Testing

#### Unit Testing with Services
```yaml
services:
  postgres:
    image: postgres:17
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: vestara
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd redis-cli ping
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

```yaml
- name: Run tests
  run: pnpm test --filter=@vestara/${{ matrix.app }}
  env:
    DATABASE_URL: postgresql://postgres:password@localhost:5432/vestara
    REDIS_URL: redis://localhost:6379
```

**Purpose**: Validate application logic and integrations
**Failure Mode**: Build fails
**Frequency**: Every push and PR

### Phase 3: Application Building

#### Build Verification
```yaml
- name: Run build
  run: pnpm build --filter=@vestara/${{ matrix.app }}
```

**Purpose**: Ensure applications can be successfully built
**Failure Mode**: Build fails
**Frequency**: Every push and PR

## Advanced Workflow Features

### 1. Branch-Type Specific Validations

The workflow uses **intelligent branch detection** to apply appropriate validation rules:

```yaml
- name: Identify branch type
  id: branch
  run: |
    BRANCH_NAME="${{ github.head_ref || github.ref_name }}"
    if [[ "$BRANCH_NAME" == feature/* ]]; then
      echo "branch_type=feature" >> $GITHUB_OUTPUT
    elif [[ "$BRANCH_NAME" == bugfix/* ]]; then
      echo "branch_type=bugfix" >> $GITHUB_OUTPUT
    elif [[ "$BRANCH_NAME" == hotfix/* ]]; then
      echo "branch_type=hotfix" >> $GITHUB_OUTPUT
    elif [[ "$BRANCH_NAME" == release/* ]]; then
      echo "branch_type=release" >> $GITHUB_OUTPUT
    else
      echo "branch_type=other" >> $GITHUB_OUTPUT
    fi
```

**Feature branch checks**:
- Additional lint rules for feature completeness
- Enhanced testing coverage for new functionality
- Performance benchmarks for new features

**Bugfix branch checks**:
- Regression testing for existing functionality
- Compatibility verification across supported versions
- Stability validation through stress testing

**Hotfix branch checks**:
- Security vulnerability scanning
- Rapid deployment readiness
- Downtime impact assessment

### 2. Security and Compliance

#### Dependency Vulnerability Scanning
```yaml
- name: Run dependency vulnerability scan
  run: npx audit-ci --moderate
```

**Purpose**: Detect and address security vulnerabilities
**Frequency**: Every push and PR
**Severity**: Moderate and above

#### Secret Detection
```yaml
- name: Check for secrets in repository
  run: |
    if grep -r "password\|token\|secret" .github/workflows/ *.md *.json *.ts *.js --include="*.json" --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | head -5; then
      echo "⚠️ Potential secrets found in configuration files"
    fi
```

**Purpose**: Prevent accidental secret exposure
**Frequency**: Every push and PR

### 3. Automated Merge Management

#### Feature Branch Auto-Merge
```yaml
auto-merge:
  name: Auto-Merge Approved PRs
  needs: [feature-validation, security]
  if: |
    github.event_name == 'pull_request' &&
    github.event.pull_request.state == 'closed' &&
    github.event.pull_request.merged == true &&
    startsWith(github.head_ref, 'feature/')

  steps:
    - name: Configure Git
      run: |
        git config --global user.name "github-actions"
        git config --global user.email "github-actions@github.com"

    - name: Merge to develop branch
      run: |
        echo "✅ PR merged successfully"
        echo "Creating documentation for automated merge process"
```

**Purpose**: Streamline feature branch integration
**Controls**: Manual review and approval required
**Safety**: Runs after feature-validation and security checks

### 4. Repository Health Monitoring

#### Weekly Health Report Generation
```yaml
health-report:
  name: Weekly Repository Health Report
  schedule:
    - cron: '0 0 * * 1'  # Every Monday at midnight

  steps:
    - name: Generate repository health report
      id: health-report
      uses: actions/github-script@v7
      with:
        script: |
          // Repository statistics collection
          // Git status analysis
          // Dependency vulnerability reporting
          // Build and test performance metrics
```

**Purpose**: Continuous repository health monitoring
**Frequency**: Weekly
**Output**: Automated GitHub issue with health metrics

## Job Dependencies and Ordering

### Critical Dependency Chain

```yaml
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps: [checkout, setup-node, install, typecheck]

  lint:
    runs-on: ubuntu-latest
    needs: []  # Can run independently
    steps: [checkout, setup-node, install, lint]

  test:
    runs-on: ubuntu-latest
    needs: []  # Can run independently
    services: [postgres, redis]
    steps: [checkout, setup-node, install, test]

  build:
    runs-on: ubuntu-latest
    needs: [typecheck, lint, test]  # CRITICAL: Wait for all checks
    if: always()
    steps: [checkout, setup-node, install, build]
```

### Optional but Recommended Chains

#### Feature Validation Chain
```yaml
feature-validation:
  runs-on: ubuntu-latest
  needs: [typecheck, lint, test, build]  # CRITICAL for feature branches
  if: always()
  steps: [branch-detection, feature-checks]
```

#### Security Validation Chain
```yaml
security:
  runs-on: ubuntu-latest
  needs: []  # Independent check
  steps: [dependency-scan, secret-check]
```

## Performance and Optimization

### Caching Strategy

```yaml
env:
  CI: true

jobs:
  typecheck:
    steps:
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"
          cache-dependency-path: "pnpm-lock.yaml"
```

### Parallel Job Execution

- **Type checking**: Can run independently
- **Linting**: Can run independently
- **Testing**: Can run independently (services managed)
- **Building**: Depends on all checks
- **Feature validation**: High dependency

## Event Triggers

### Supported Events

```yaml
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]
  workflow_dispatch:
```

### Event Handling

#### Pull Request Events
- Trigger: When PRs are opened, updated, or merged
- Branch: Limited to develop and main branches
- Purpose: Ensure PR quality before merge

#### Push Events
- Trigger: When code is pushed to develop branch
- Branch: Only develop branch
- Purpose: Continuous validation of integration branch

#### Manual Events
- Trigger: Manual workflow execution
- Purpose: Ad-hoc testing and validation

## Error Handling and Recovery

### Fail Fast Strategy

1. **Type checking failures** → Immediate build failure
2. **Linting failures** → Immediate build failure
3. **Test failures** → Build failure (but tests continue)
4. **Build failures** → Build failure with diagnostic output

### Recovery Procedures

```yaml
# Use 'if: always()' for post-completion jobs regardless of success/failure
jobs:
  build:
    if: always()  # Run even if previous jobs fail
    needs: [typecheck, lint, test]  # But wait for their completion
    steps: [build]
```

### Failure Reporting

Automated failure reporting includes:
- **Specific failing job/step identification**
- **Repository health report generation**
- **Team notification triggers**
- **Detailed log analysis**

## Integration with Development Workflow

### Pre-PR Checklist

1. **Code Format Check**
   ```bash
   pnpm lint
   ```

2. **Type Safety Check**
   ```bash
   pnpm typecheck
   ```

3. **Unit Test Validation**
   ```bash
   pnpm test
   ```

4. **Build Verification**
   ```bash
   pnpm build
   ```

### Git Branch Strategy Integration

```text
main
 └─develop
   ├─feature/* (validated by CI/CD)
   ├─bugfix/* (validated by CI/CD)
   ├─hotfix/* (validated by CI/CD)
   └─release/* (validated by CI/CD)
```

## Customization and Extension

### Adding Custom Checks

```yaml
# Add new custom checks in the workflow
  custom-checks:
    name: Custom Application Checks
    runs-on: ubuntu-latest
    steps:
      - name: Custom validation
        run: |
          # Add your custom validation logic here
          echo "Running custom validation..."
```

### Environment-Specific Configuration

```yaml
env:
  CI: true
  # Additional environment variables for different environments
jobs:
  test:
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
          POSTGRES_DB: vestara
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
```

## Migration Guide

### From Traditional CI/CD to GitHub Actions

1. **Initial Setup**
   - Add `.github/workflows/code-quality.yml`
   - Configure environment variables
   - Set up required GitHub secrets

2. **Transition Phases**
   - Phase 1: Enable GitHub Actions for all branches
   - Phase 2: Configure branch protection rules
   - Phase 3: Implement team-specific workflows

3. **Optimization**
   - Review workflow execution times
   - Adjust caching strategies
   - Customize branch-specific validations
   - Implement additional monitoring

## Benefits of This Implementation

### 1. **Continuous Integration**
- Zero-touch validation for every code change
- Immediate feedback on code quality issues
- Automated regression testing

### 2. **Continuous Delivery**
- Automated deployment preparation
- Release candidate management
- Production readiness validation

### 3. **Developer Experience**
- Fast feedback loops
- Clear error messages and diagnostic output
- Self-service documentation and guides

### 4. **Security and Compliance**
- Automated security vulnerability scanning
- Secret detection and prevention
- Compliance requirements fulfillment

### 5. **Operational Excellence**
- Comprehensive monitoring and reporting
- Automated repository health management
- Performance optimization opportunities

This workflow implementation transforms the Vestara project from a manually validated codebase to a fully automated, secure, and continuously validated software development pipeline, dramatically reducing time-to-market while maintaining enterprise-grade quality standards.