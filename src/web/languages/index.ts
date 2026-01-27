/// <reference path="./monaco-langs.d.ts" />
import { typescriptLanguage } from './typescript/typescript';
import { pythonLanguage } from './python/python';
import { csharpLanguage } from './csharp/csharp';
import { javaLanguage } from './java/java';
import { goLanguage } from './go/go';
import type { LanguageDefinition } from './types';

export const LANGUAGES: LanguageDefinition[] = [
  typescriptLanguage,
  pythonLanguage,
  csharpLanguage,
  javaLanguage,
  goLanguage,
];

export const DEFAULT_LANGUAGE = typescriptLanguage;

export function findLanguage(id: string | undefined): LanguageDefinition {
  const match = LANGUAGES.find((lang) => lang.id === id);
  return match ?? DEFAULT_LANGUAGE;
}
