import type { Monaco } from '@monaco-editor/react';
import type { LanguageDefinition } from "../types";
import { TypeScriptPlaygroundRuntime } from "../runtime";

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

const runtime = new TypeScriptPlaygroundRuntime();
const CSHARP_LANGUAGE_ID = 'csharp';

export const csharpLanguage: LanguageDefinition = {
  id: 'csharp',
  label: 'C#',
  monacoLanguage: CSHARP_LANGUAGE_ID,
  monacoSetup: (monaco: Monaco) => {
    const exists = monaco.languages.getLanguages().some((lang) => lang.id === CSHARP_LANGUAGE_ID);
    if (!exists) {
      monaco.languages.register({ id: CSHARP_LANGUAGE_ID });
    }
    void import('monaco-editor/esm/vs/basic-languages/csharp/csharp').then((mod) => {
      monaco.languages.setMonarchTokensProvider(CSHARP_LANGUAGE_ID, mod.language);
      monaco.languages.setLanguageConfiguration(CSHARP_LANGUAGE_ID, mod.conf);
    });
  },
  samples: csharpSamples,
  defaultSampleId: csharpSamples[0]?.id,
  evaluate: (source: string) => runtime.ParseDiagrammingCode(source, 'csharp'),
};
