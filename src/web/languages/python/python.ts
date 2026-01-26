import type { Monaco } from '@monaco-editor/react';
import type { LanguageDefinition } from '../types';
import { TypeScriptPlaygroundRuntime } from '../runtime';

const pythonSamples = [
  {
    id: 'unit-test-python',
    title: 'Unit Test Sample (Python)',
    description: 'Sample from core parser tests.',
    code: `from flowconsole import User, ReactApp, RestApi

user = User(name='Alice', role='admin', description='Administrator user', tags=['admin', 'user'], badge='gold')
app = ReactApp(name='Dashboard')
api = RestApi(name='Backend API')

user.sendsRequest(app, 'Load App')
app.then(api)
`,
  },
] satisfies LanguageDefinition['samples'];

const runtime = new TypeScriptPlaygroundRuntime();
const PYTHON_LANGUAGE_ID = 'python';

export const pythonLanguage: LanguageDefinition = {
  id: 'python',
  label: 'Python',
  monacoLanguage: PYTHON_LANGUAGE_ID,
  monacoSetup: (monaco: Monaco) => {
    const exists = monaco.languages.getLanguages().some((lang: any) => lang.id === PYTHON_LANGUAGE_ID);
    if (!exists) {
      monaco.languages.register({ id: PYTHON_LANGUAGE_ID });
    }
    void import('monaco-editor/esm/vs/basic-languages/python/python').then((mod) => {
      monaco.languages.setMonarchTokensProvider(PYTHON_LANGUAGE_ID, mod.language);
      monaco.languages.setLanguageConfiguration(PYTHON_LANGUAGE_ID, mod.conf);
    });
  },
  samples: pythonSamples,
  defaultSampleId: pythonSamples[0]?.id,
  evaluate: (source: string) => runtime.ParseDiagrammingCode(source, 'python'),
};
