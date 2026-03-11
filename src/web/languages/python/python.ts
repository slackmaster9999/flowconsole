import type { LanguageDefinition } from '../types';
import { PlaygroundRuntime } from '../runtime';

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

const runtime = new PlaygroundRuntime();

export const pythonLanguage: LanguageDefinition = {
  id: 'python',
  label: 'Python',
  monacoLanguage: 'python',
  monacoSetup: () => import('monaco-editor/esm/vs/basic-languages/python/python.contribution'),
  samples: pythonSamples,
  defaultSampleId: pythonSamples[0]?.id,
  evaluate: (source: string, context) =>
    runtime.ParseDiagrammingCode(source, 'python', context.apiBaseUrl),
};
