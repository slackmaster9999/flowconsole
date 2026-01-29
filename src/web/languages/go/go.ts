import type { LanguageDefinition } from '../types';
import { PlaygroundRuntime } from '../runtime';

const goSamples = [
  {
    id: 'unit-test-go',
    title: 'Unit Test Sample (Go)',
    description: 'Sample from core parser tests.',
    code: `package main

import "github.com/slackmaster9999/flowconsole"

user := flowconsole.NewUser(&flowconsole.UserArgs{
    Name:        "user",
    Description: "Administrator user",
    Tags:        []string{"admin", "user"},
    Badge:       "gold",
})

app := flowconsole.NewReactApp(&flowconsole.ReactAppArgs{
    Name: "app",
})

api := flowconsole.NewRestApi(&flowconsole.RestApiArgs{
    Name: "api",
})

user.SendsRequest(app, "Load App")
app.Then(api)
`,
  },
] satisfies LanguageDefinition['samples'];

const runtime = new PlaygroundRuntime();

export const goLanguage: LanguageDefinition = {
  id: 'go',
  label: 'Go',
  monacoLanguage: 'go',
  monacoSetup: () => import('monaco-editor/esm/vs/basic-languages/go/go.contribution'),
  samples: goSamples,
  defaultSampleId: goSamples[0]?.id,
  evaluate: (source: string, context) =>
    runtime.ParseDiagrammingCode(source, 'go', context.apiBaseUrl),
};
