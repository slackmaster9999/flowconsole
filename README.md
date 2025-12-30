# FlowConsole

## Overview
- Code-first workbench for generating and exploring architecture diagrams.
- React + Vite frontend with Mantine theming and Monaco editor for the DSL.
- Uses XYFlow for interactive graph rendering and Graphviz WASM for layout, backed by a TypeScript DSL that compiles diagram definitions into React Flow models.

## Quick start
1. Prereqs: Node.js 18+ and `pnpm` installed.
2. Install deps: `pnpm install`.
3. Run dev server: `pnpm dev` (Vite).
4. Run unit tests: `pnpm test:unit` (Vitest + RTL).
5. Lint: `pnpm lint`.

## Scripts
- `pnpm dev` — start Vite dev server.
- `pnpm build` — type-check and build for production.
- `pnpm lint` — run ESLint (`eslint.config.js`).
- `pnpm lint:fix` — ESLint with auto-fix.
- `pnpm test:unit` / `pnpm test:coverage` — Vitest suites.
- `pnpm test:e2e` — Playwright against a built app.
- `pnpm build:wasm` — build the Graphviz WASM worker.

### E2E (Playwright)
- Default preview port is controlled by `PORT` (defaults to `4173`); `PLAYWRIGHT_BASE_URL` can override the target URL.
- Typical CI/local run: `pnpm build && PORT=4173 pnpm test:e2e`.
- Tests start `pnpm preview` automatically via `playwright.config.ts` and reuse an existing server when not on CI.

## Architecture
- `src/core/components/Workbench/CodeDiagramWorkbench`: Monaco-based editor + diagram preview, debounced evaluation.
- `src/core/components/ArchitectureDiagram`: XYFlow renderer with layout (`graphvizLayoutService`) and navigation panel.
- `src/core/languages/typescript`: DSL declarations, evaluator, and samples that compile authored code into diagram models.
- `src/theme/ThemeProvider`: Mantine provider + light/dark scheme handling.
- `src/core/components/NavigationPanel`: flow and scope navigation for rendered diagrams.

## Screenshots
- TODO: add UI captures of the workbench and rendered diagrams.

## Roadmap
- See `ROADMAP.md` for current milestones and nice-to-haves.

## Contributing
- See `CONTRIBUTING.md` for setup, standards, and how to file issues/PRs.
- Community expectations: `CODE_OF_CONDUCT.md`.

## License
- Core frontend code is distributed under AGPLv3 (see `LICENSE`).
- Some components or auxiliary parts may be under license; check file headers and/or a nearby NOTICE for those modules.
