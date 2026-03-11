import type { LanguageDefinition } from "../types";
import { PlaygroundRuntime } from "../runtime";

const csharpSamples = [
  {
    id: 'unit-test-csharp',
    title: 'Unit Test Sample (C#)',
    description: 'Sample from core parser tests.',
    code: `using FlowConsole;

var user = new User(new UserArgs {
  Name = "user",
  Description = "Administrator user",
  Tags = new [] { "admin", "user" },
  Badge = "gold",
});

var app = new ReactApp(new ComponentArgs {
  Name = "app",
});

var api = new RestApi(new ComponentArgs {
  Name = "api",
  BelongsTo = app,
  Icon = "api-icon",
});

user.SendsRequest(app, "Load App");
app.Then(api);
`,
  },
] satisfies LanguageDefinition['samples'];

const runtime = new PlaygroundRuntime();

export const csharpLanguage: LanguageDefinition = {
  id: 'csharp',
  label: 'C#',
  monacoLanguage: 'csharp',
  monacoSetup: () => import('monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution'),
  samples: csharpSamples,
  defaultSampleId: csharpSamples[0]?.id,
  evaluate: (source: string, context) =>
    runtime.ParseDiagrammingCode(source, 'csharp', context.apiBaseUrl),
};
