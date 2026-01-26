import type { Monaco } from '@monaco-editor/react';
import type { LanguageDefinition } from '../types';
import { TypeScriptPlaygroundRuntime } from '../runtime';

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

const runtime = new TypeScriptPlaygroundRuntime();
const GO_LANGUAGE_ID = 'go';

export const goLanguage: LanguageDefinition = {
  id: 'go',
  label: 'Go',
  monacoLanguage: GO_LANGUAGE_ID,
  monacoSetup: (monaco: Monaco) => {
    const exists = monaco.languages.getLanguages().some((lang) => lang.id === GO_LANGUAGE_ID);
    if (!exists) {
      monaco.languages.register({ id: GO_LANGUAGE_ID });
    }
    void import('monaco-editor/esm/vs/basic-languages/go/go').then((mod) => {
      monaco.languages.setMonarchTokensProvider(GO_LANGUAGE_ID, mod.language);
      monaco.languages.setLanguageConfiguration(GO_LANGUAGE_ID, mod.conf);
    });
  },
  samples: goSamples,
  defaultSampleId: goSamples[0]?.id,
  evaluate: (source: string) => runtime.ParseDiagrammingCode(source, 'go'),
};
