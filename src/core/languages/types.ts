import type { Monaco } from '@monaco-editor/react';
import type { ArchitectureDiagramModel } from '../../core/diagram/types';

export type CodeSample = {
  id: string;
  title: string;
  description: string;
  code: string;
};

export type EvaluationResult =
  | { ok: true; model: ArchitectureDiagramModel }
  | { ok: false; error: string };

export type LanguageDefinition = {
  id: string;
  label: string;
  monacoLanguage: string;
  monacoSetup?: (monaco: Monaco) => void;
  samples: CodeSample[];
  defaultSampleId?: string;
  evaluate: (source: string) => Promise<EvaluationResult>;
};
