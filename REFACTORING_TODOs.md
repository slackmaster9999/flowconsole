## Documentation & Examples
- [ ] Expand the DSL sample library docs: describe each sample, its domain, and how to extend the fluent API; include screenshots or exported diagrams for newcomers.
- [ ] Document how to add new entity types/connection kinds so external contributors can evolve the DSL without reverse-engineering internal files.
- [ ] Provide instructions for running the WASM Graphviz layout (browser requirements, how to disable for debugging) and mention large-model performance considerations.

## Release Checklist
- [ ] Tag an initial release (e.g., `v0.1.0`) once the above items are resolved, and publish a changelog entry summarizing features/tests.
- [ ] Decide on a package publishing strategy (npm library vs. app template) or explicitly state that this is an app repo only.

## React Project Best Practices
- [ ] Introduce a `src/components/index.ts` barrel or feature-based directory structure (e.g., `components/navigation`, `components/layout`) to avoid deep relative imports and clarify ownership.
- [ ] Add Storybook or Ladle stories for key components (`NavigationPanel`, `ArchitectureDiagram`, DSL workbench) to document props visually and aid regression testing.
- [ ] Enforce hooks lint rules by extending `.eslintrc` with `eslint-plugin-react`/`react-refresh` settings and run `pnpm lint` in CI.
- [ ] Replace inline styles with CSS Modules or a design system tokens file so theming and RTL support can evolve without editing components.
- [ ] Ensure all components accept `className`/`style` overrides (where sensible) and forward refs when they wrap native elements, improving composability.
- [ ] Remove direct DOM usage (`window.dispatchEvent`, `new CustomEvent`) from components by using React Context or callback props; this makes unit testing easier and improves SSR compatibility.
- [ ] Add Suspense boundaries or skeleton loaders around async diagram evaluation to keep the UI responsive, and document error boundaries in `App.tsx`.
- [ ] Break down `CodeDiagramWorkbench` into smaller hooks (`useDslEvaluator`, `useSampleSelection`) to keep render logic minimal and improve testability.
- [ ] Publish a theming guide in `ThemeProvider.tsx` (and consider migrating to `MantineProvider` props) so consumers can override palette via context instead of editing source files.

## Clean & Maintainable Code Checklist
- [ ] Remove dead code and unused exports (`ContainerNodeData` import in `ArchitectureDiagram.tsx`, redundant comments in legacy files) to keep bundle size down and reduce confusion.
- [ ] Convert repeated inline styles to shared utility classes or `clsx` helpers, and centralize color tokens in `src/theme` so palette changes do not require sweeping edits.
- [ ] Prefer composition over global events: replace `window.dispatchEvent('container:open')` with callback props or context to keep components pure and test-friendly.
- [ ] Annotate complex hooks (`useNavigationHistory`, `useHoverPopover`, DSL evaluation hooks) with JSDoc describing invariants and expected side effects.
- [ ] Add TypeScript strictness upgrades (enable `noImplicitOverride`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) and fix resulting warnings to catch defects earlier.
- [ ] Ensure every async function handles cancellation/cleanup (e.g., `CodeDiagramWorkbench` debounce/evaluation) to avoid state updates after unmount.
- [ ] Introduce domain-specific interfaces (e.g., `DiagramEntityConfig`) rather than loose `Record<string, unknown>` so IDE hints stay accurate.
- [ ] Break overly long files (`CodeDiagramWorkbench.tsx`, `NavigationPanel.tsx`) into smaller components/hooks and colocate tests alongside them for clarity.

## Inspiration from Successful OSS Projects
- [ ] Provide a polished landing page + live demo (look at Supabase, Astro, Remix) so devs can try features without cloning the repo; host the current workbench on Vercel/Netlify and link it in README.
- [ ] Maintain a clear roadmap/projects board (e.g., GitHub Projects like `refine`, `shadcn/ui`) that shows near-term milestones, helping contributors align efforts.
- [ ] Publish regular release notes/blog posts summarizing features, bug fixes, and community highlights (similar to `Next.js` or `Vite`) to keep momentum.
- [ ] Offer an integrations directory/examples folder showing how to embed the DSL output into other stacks (React, Vue, Svelte) akin to what `Leaflet` and `TanStack` provide.
- [ ] Add badges and quick metrics (npm downloads, version, CI status) to README to build trust—popular projects like `Storybook` or `Tailwind` surface these prominently.
- [ ] Create a “Getting Started in 5 minutes” section with copy-paste commands, plus video/gif walkthroughs (see `T3 App`, `qwik`, `Expo` docs) to reduce onboarding friction.
- [ ] Set up a community space (Discord, GitHub Discussions) and document etiquette; highlight community plugins/samples similar to `SvelteKit` or `Prisma`.
- [ ] Automate triage labels (`good first issue`, `help wanted`) and contributor recognition (CLA bot or `all-contributors`) following projects like `Vitest`/`Solid`.
- [ ] Ensure every feature has end-to-end tests in place and move coverage status to README (citing `Playwright`, `Cypress` repos) to signal quality commitment.
- [ ] Provide an extensibility guide (like `shadcn/ui`'s component generator) so others can author DSL primitives or custom layouts, accelerating ecosystem growth.

### Launch & Community Playbook
- [ ] Prepare an announcement blog post + dev.to/Medium article describing the project’s vision, DSL examples, and screenshots. Share it on Hacker News, Reddit (`r/reactjs`, `r/webdev`), Product Hunt, and Lobsters—mirroring launches from projects like Supabase, Tauri, and Astro.
- [ ] Create official accounts on Twitter/X, LinkedIn, and Mastodon to drip content (release notes, tips, GIFs). Engage with relevant hashtags (#reactjs, #architecture, #opensource).
- [ ] Open GitHub Discussions and/or a Discord/Slack community for support; highlight these in README just like `Remix`, `Vitest`, or `SolidJS` do.
- [ ] Record a short demo for YouTube/loom showcasing the editor → diagram workflow. Successful OSS (Next.js, Bun, TurboRepo) lean on video to drive organic reach.
- [ ] Submit talks or lightning demos to virtual meetups (Reactiflux, Open Source Friday) and CFPs (React Summit, JSNation). Speaking slots often correlate with GitHub stars/downloads.
- [ ] Cross-post feature highlights to newsletters (StatusCode Weekly, JavaScript Weekly) and aggregator channels (Indie Hackers, Hashnode) to expand early readership.



## Repository Hygiene & Metadata
- [X] Add a proper `LICENSE` file (MIT/BSD/Apache etc.) and reference it from `package.json` so downstream users know redistribution terms.
- [X] Provide a `CONTRIBUTING.md` (and optionally `CODE_OF_CONDUCT.md`) that explains tooling (`pnpm`), coding standards, testing expectations, and how to submit issues/PRs.
- [X] Rework `README.md` into bilingual/English structure with sections for overview, quick start, scripts, architecture, and screenshots; move the existing Russian task list into a dedicated `ROADMAP.md`.

## Build & Test Tooling
- [X] Ensure Playwright E2E tests can run on CI by updating `playwright.config.ts` to start the preview server on a configurable port (use `process.env.PORT` or `start-server-and-test`) and document the `pnpm test:e2e` workflow.
- [X] Add a GitHub Actions workflow that runs `pnpm install`, `pnpm lint`, `pnpm test`, and the E2E suite on each PR/main push to keep the project green.
- [X] Consider adding `pnpm lint --fix` (or `biome/prettier`) to enforce consistent formatting before contributions land.