import sdkSource from '@flowconsole/sdk/flowconsole-sdk.ts?raw';
import { codeSamples, defaultSampleId } from './samples';
import type { LanguageDefinition } from '../types';
import { TypeScriptPlaygroundRuntime } from '../runtime';

const SDK_MODULE_URI = 'file:///node_modules/@flowconsole/sdk/index.ts';
const SDK_MODULE_SOURCE = sdkSource;

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

    monaco.languages.typescript.typescriptDefaults.addExtraLib(SDK_MODULE_SOURCE, SDK_MODULE_URI);
    monaco.languages.typescript.javascriptDefaults.addExtraLib(SDK_MODULE_SOURCE, SDK_MODULE_URI);
  },
  samples: codeSamples,
  defaultSampleId,
  evaluate: (source: string) => {
    const runtime = new TypeScriptPlaygroundRuntime();
    return runtime.ParseDiagrammingCode(source, 'typescript');
  },
};
