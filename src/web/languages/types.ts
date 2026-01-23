import type { Monaco } from '@monaco-editor/react';
import type { ArchitectureDiagramModel } from '../diagram/types';
import type { SupportedLanguage } from '@flowconsole/core';

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
  evaluate: (source: string, language: SupportedLanguage) => Promise<EvaluationResult>;
};
