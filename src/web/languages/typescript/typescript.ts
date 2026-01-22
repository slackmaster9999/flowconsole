import { DSL_DECLARATIONS } from './dsl';
import { evaluateDiagramCode } from './evaluateDiagramCode';
import { codeSamples, defaultSampleId } from './samples';
import type { LanguageDefinition } from '../types';

export const typescriptLanguage: LanguageDefinition = {
  id: 'typescript',
  label: 'TypeScript',
  monacoLanguage: 'typescript',
  monacoSetup: (monaco) => {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      DSL_DECLARATIONS,
      'ts:diagram-dsl.d.ts'
    );
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      DSL_DECLARATIONS,
      'ts:diagram-dsl-js.d.ts'
    );
  },
  samples: codeSamples,
  defaultSampleId,
  evaluate: evaluateDiagramCode,
};
