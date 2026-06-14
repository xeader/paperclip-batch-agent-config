# Contributing to Batch Agent Config

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Fork** the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/batch-agent-config.git
   cd batch-agent-config
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development mode:**

   ```bash
   npm run dev
   ```

4. **Run tests:**

   ```bash
   npm run test
   ```

5. **Build for production:**

   ```bash
   npm run build
   ```

## Branch Workflow

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes and commit (see commit conventions below).
3. Push your branch and open a Pull Request against `main`.

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

Examples:

- `feat(ui): add bulk select checkbox`
- `fix(worker): handle empty agent list`
- `docs: update installation instructions`

## Pull Request Process

1. Ensure your code passes all checks:

   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```

2. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely.
3. Link any related issues.
4. Request a review from a maintainer.
5. Once approved, a maintainer will merge your PR.

## Code Style

- **TypeScript** — All source code must be written in TypeScript.
- **React 18** — UI components use React functional components with hooks.
- Follow the existing code patterns and naming conventions in the project.
- Run `npm run typecheck` to ensure there are no type errors.

## Reporting Bugs & Requesting Features

- Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template for bugs.
- Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template for new ideas.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

Thank you for helping make Batch Agent Config better! 🎉
