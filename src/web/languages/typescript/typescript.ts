import { evaluateDiagramCode } from './evaluateDiagramCode';
import { codeSamples, defaultSampleId } from './samples';
import type { LanguageDefinition } from '../types';
import { DSL_DECLARATIONS } from './dsl';

const SDK_MODULE_URI = 'file:///node_modules/@flowconsole/sdk/index.d.ts';
const SDK_DECLARATIONS = `declare module '@flowconsole/sdk' {\n${DSL_DECLARATIONS}\n}`;

export const typescriptLanguage: LanguageDefinition = {
  id: 'typescript',
  label: 'TypeScript',
  monacoLanguage: 'typescript',
  monacoSetup: (monaco: any) => {
    const tsCompilerOptions = {
      ...(monaco.languages.typescript.typescriptDefaults.getCompilerOptions() ?? {}),
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      baseUrl: '.',
      paths: { '@flowconsole/sdk': [SDK_MODULE_URI] },
      allowSyntheticDefaultImports: true,
    };
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(tsCompilerOptions);
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(tsCompilerOptions);

    monaco.languages.typescript.typescriptDefaults.addExtraLib(SDK_DECLARATIONS, SDK_MODULE_URI);
    monaco.languages.typescript.javascriptDefaults.addExtraLib(SDK_DECLARATIONS, SDK_MODULE_URI);
  },
  samples: codeSamples,
  defaultSampleId,
  evaluate: evaluateDiagramCode,
};
