# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowConsole is an architecture-as-code tool that lets developers model system architecture using a typed API and generates animated diagrams and system flows. The project uses a pnpm monorepo structure.

## Common Commands

```bash
# Install dependencies (from repo root or any workspace)
pnpm install

# Development (run from src/app or src/docs)
pnpm dev

# Build
pnpm build                    # Build current package
pnpm --filter flowconsole build  # Build core package specifically

# Linting
pnpm lint                     # Run ESLint
pnpm lint:fix                 # ESLint with auto-fix

# Testing
pnpm test:unit                # Run Vitest unit tests
pnpm test:coverage            # Unit tests with coverage report
pnpm test:e2e                 # Playwright E2E tests (builds app first)

# Run single test file
pnpm --filter flowconsole vitest run --config ../../vitest.config.ts tests/unit/<filename>.test.ts
```

## Workspace Structure

- **src/core** (`flowconsole`) - Core library with DSL, diagram rendering, and React components
- **src/app** (`flowconsole-app`) - Playground/demo application (Vite + React)
- **src/docs** (`flowconsole-docs`) - Documentation site (Next.js)
- **src/sdk** (`@flowconsole/sdk`) - Multi-language SDK using jsii (targets Java, Python, .NET, Go)
- **src/cli** (`@flowconsole/cli`) - CLI tool for architecture analysis

## Architecture

### DSL and Runtime (`src/core/languages/typescript/`)
- `dsl.ts` - TypeScript type declarations injected into the Monaco editor for autocompletion
- `diagramRuntime.ts` - `DiagramRuntime` class that tracks entities and connections; `FlowBuilder` handles chained flow definitions
- `evaluateDiagramCode.ts` - Evaluates user code with runtime injection to produce `DiagramIntermediateModel`
- `modelToReactflowMapper.ts` - Converts intermediate model to ReactFlow nodes/edges

### Core Components (`src/core/components/`)
- `Workbench/CodeDiagramWorkbench` - Monaco editor with live preview, debounced code evaluation
- `ArchitectureDiagram.tsx` - ReactFlow-based renderer with graphviz-wasm auto-layout
- `NavigationPanel/` - Flow and scope navigation controls for rendered diagrams

### Diagram Infrastructure (`src/core/diagram/`, `src/core/reactflow/`)
- Layout engine uses graphviz-wasm for automatic node positioning
- Custom ReactFlow nodes and edges with animation support

## Testing Conventions

- Unit tests: `tests/unit/` using Vitest + React Testing Library
- E2E tests: `tests/e2e/` using Playwright (runs against built app on port 4173)
- Test config: `vitest.config.ts` (root), `playwright.config.ts` (root)

## Code Style

- TypeScript/React with functional components and hooks
- UI: Mantine components + custom CSS variables for theming
- Linting: ESLint with typescript-eslint, react-hooks, and react-refresh plugins
- Prefer existing patterns in `src/core` for state management (useMemo/useCallback)
