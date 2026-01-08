# FlowConsole SDK

FlowConsole SDK contains the typed DSL for describing systems, components, and flows that the FlowConsole engine renders. It is built with `jsii`, so the same definitions are published to npm, PyPI, Maven, NuGet, and Go modules.

## Install
- Node.js: `npm install @flowconsole/sdk`
- Python (PyPI): `pip install flowconsole-sdk`
- .NET: `dotnet add package FlowConsole.Sdk`
- Maven:
  ```xml
  <dependency>
    <groupId>flowconsole</groupId>
    <artifactId>sdk</artifactId>
    <version>0.0.1</version>
  </dependency>
  ```
- Go: `go get github.com/slackmaster9999/flowconsole`

## Quick start (TypeScript)
When executed inside the FlowConsole runtime (as used by the playground/app), the SDK attaches flow helpers to your entities so you can describe interactions fluently:

```ts
import { User, ReactApp, RestApi, Postgres } from '@flowconsole/sdk';

const user: User = { name: 'Customer', description: 'end user' };
const frontApp: ReactApp = { name: 'Customer Dashboard', description: 'React app' };
const restApi: RestApi = { name: 'Backend', description: 'Java REST API' };
const db: Postgres = { name: 'main_db', description: 'Database' };

user
  .sendsRequestTo(frontApp, 'opens in browser')
  .then(frontApp)
  .sendsRequestTo(restApi, 'GET /api/v1/dashboard/:id')
  .then(restApi)
  .sendsRequestTo(db, 'fetch dashboard data');
```

## Python package
- Package name: `flowconsole-sdk`, import module: `flowconsole`.
- Generated via `jsii-pacmak`; property names mirror the TypeScript definitions.
- The package ships the DSL types; use it alongside the FlowConsole engine that evaluates the objects you build.

## Building multi-language packages
1. Install dependencies from the repo root: `pnpm install`.
2. Build the TypeScript sources: `pnpm --filter @flowconsole/sdk build`.
3. Generate language-specific artifacts (including PyPI): `pnpm --filter @flowconsole/sdk package`. Artifacts are written to `src/sdk/dist/` (for JavaScript) and language subfolders such as `dist/python` (PyPI wheel/sdist). This README is used as the long description on PyPI.

## License
MIT — see `src/sdk/LICENSE`.
