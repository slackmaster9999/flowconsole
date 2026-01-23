import sdkSource from '@flowconsole/sdk/flowconsole-sdk.ts?raw';

// Use the SDK source as the single source of truth for the DSL declarations.
// Strip `export` keywords so the code can run in the browser without module syntax.
export const DSL_DECLARATIONS = sdkSource.replace(/^export\\s+/gm, '');
