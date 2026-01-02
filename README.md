<p align="center">
  <a href="https://slackmaster9999.github.io/flowconsole/" target="_blank" rel="noopener noreferrer">
    <img src="src/docs/public/hero.png" alt="FlowConsole logo">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://img.shields.io/github/v/release/slackmaster9999/flowconsole"><img src="https://img.shields.io/github/v/release/slackmaster9999/flowconsole?include_prereleases&display_name=tag" alt="np"></a>
  <a href="https://github.com/slackmaster9999/flowconsole/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/slackmaster9999/flowconsole/ci.yml?logo=githubpages&label=Docs" alt="Docs build status"></a>
  <a href="https://github.com/slackmaster9999/flowconsole/actions/workflows/playground.yml"><img src="https://img.shields.io/github/actions/workflow/status/slackmaster9999/flowconsole/playground.yml?logo=cloudflarepages&label=Playground" alt="Playground build status"></a>
  <a href="https://discord.gg/23CkhhDz"><img src="https://img.shields.io/badge/Community-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
  <a href="https://github.com/slackmaster9999/flowconsole/blob/dev/LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-purple" alt="License"></a>
</p>
<p align="center">
    <a href="https://slackmaster9999.github.io/flowconsole/?utm_source=gh-hero">Docs</a>
    ·
    <a href="https://dev.flowconsole.pages.dev/?utm_source=gh-hero">Playground</a>
    ·
    <a href="#roadmap">Roadmap</a>
</p>

> FlowConsole(alpha) is a new breed of architecture as code tooling that significantly improves developers experience with architecture artifacts. You can model your architecture in code with powerful fluent API.

# Demo ⚡
<img src="src/docs/public/flowconsole_oss_demo.gif" alt="demo">

<br/>

> Features 
- ⚡️ Fully typed APIs
- 🥳 Auto positioning system
- 🛠️ Generates animated diagrams on the fly
- 👀 Generates animated system flows on the fly
- 🙌 C4 backed
- ▶️ Live Playground with examples

<p align="center"><span style="font-size:3.5em"><a href="https://dev.flowconsole.pages.dev/?utm_source=gh-try-it" target="_blank" rel="noopener noreferrer">Go to Playground</a> </span> </p>

## Roadmap
- VS Code extention
- Jetbrains IDEA/Rider extention
- CLI tool for CI/CD pipeline integration
- C#(WIP), Java, Go, Python support
- Add llm.txt
- Export in SVG
- Docs for architecture json scheme
- Docs for CLI tool


## Quick start scripts
0. Prereqs: Node.js 18+ and `pnpm` installed.
1. cd to src/docs or src/app
2. Install deps: `pnpm install`.
3. Run dev server: `pnpm dev`.
4. Build: `pnpm build`.

## Scripts (for docs and playgroud)
- `pnpm dev` — start Vite dev server.
- `pnpm build` — type-check and build for production.
- `pnpm lint` — run ESLint (`eslint.config.js`).
- `pnpm lint:fix` — ESLint with auto-fix.
- `pnpm test:unit` / `pnpm test:coverage` — Vitest suites.
- `pnpm test:e2e` — Playwright against a built app.

### Playground E2E tests (Playwright)
- Location: tests/e2e
- Default preview port is controlled by `PORT` (defaults to `4173`); `PLAYWRIGHT_BASE_URL` can override the target URL.
- Typical CI/local run: `pnpm build && PORT=4173 pnpm test:e2e`.
- Tests start `pnpm preview` automatically via `playwright.config.ts` and reuse an existing server when not on CI.
- `pnpm test:e2e` — to run tests.

## Architecture
- `src/core/components/Workbench/CodeDiagramWorkbench`: Monaco-based editor + model preview, debounced evaluation.
- `src/core/components/ArchitectureDiagram`: Reactflow renderer with autolayout navigation panel.
- `src/core/languages/typescript`: DSL declarations, evaluator, and samples that compile authored code into architecture models.
- `src/core/components/NavigationPanel`: flow and scope navigation for rendered models.

## Contributing
- See `CONTRIBUTING.md` for setup, standards, and how to file issues/PRs.
- Community expectations: `CODE_OF_CONDUCT.md`.

## License
- Core(src/core) frontend code is distributed under AGPLv3 (see `LICENSE`).
- Some components or auxiliary parts may be under license; check file headers and/or a nearby NOTICE for those modules.
