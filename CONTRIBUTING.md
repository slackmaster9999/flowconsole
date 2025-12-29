# Contributing

Thanks for helping improve this project! Please read these guidelines before opening an issue or pull request.

## Tooling & setup
- Use **Node.js 18+** and **pnpm** (see `pnpm-lock.yaml`).
- Install dependencies: `pnpm install`.
- Useful scripts:
  - `pnpm dev` — local dev server (Vite).
  - `pnpm build` — type-check + production build.
  - `pnpm lint` — ESLint (see `eslint.config.js` for rules).
  - `pnpm lint:fix` — ESLint with auto-fix where possible.
  - `pnpm test:unit` — Vitest unit suite; `pnpm test:coverage` for coverage.
  - `pnpm test:e2e` — Playwright E2E (runs against `pnpm build` output).

## Coding standards
- Language: TypeScript/React with functional components and hooks.
- Follow existing patterns in `src/core` (e.g., hooks, state handled with `useMemo`/`useCallback`, React Testing Library for tests).
- Keep styles consistent with current CSS variables and theming (Mantine + custom CSS). Prefer using the theme hooks (`useTheme`) and shared components (e.g., `VerticalSplit`, `ArchitectureDiagram`) instead of bespoke UI.
- Keep code lint-clean; add small inline comments only when intent is non-obvious.
- Tests: add or update unit tests for new behavior; for UI changes prefer RTL + Vitest.
- Write clear commit messages (Conventional Commit style preferred).

## Submitting changes
1. Fork and create a feature branch.
2. Make your changes with tests/docs.
3. Run `pnpm lint` (or `pnpm lint:fix`) and `pnpm test:unit` (and `pnpm test:e2e` if you touched flows, routing, or integration paths).
4. Open a PR on GitHub with:
   - A summary of the change and rationale.
   - Notes on testing performed.
   - Any breaking or behavioral changes called out explicitly.

## Filing issues
- For bugs, include reproduction steps, expected vs actual behavior, environment (OS, browser/Node version), and logs/screenshots where helpful.
- For features, describe the use case and any prior art or alternatives considered.

## Code of conduct
Please review `CODE_OF_CONDUCT.md`; by participating you agree to abide by it.
