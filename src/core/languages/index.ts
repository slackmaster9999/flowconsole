import { typescriptLanguage } from './typescript/typescript';
import type { LanguageDefinition } from './types';

export const LANGUAGES: LanguageDefinition[] = [typescriptLanguage];

export const DEFAULT_LANGUAGE = typescriptLanguage;

export function findLanguage(id: string | undefined): LanguageDefinition {
  const match = LANGUAGES.find((lang) => lang.id === id);
  return match ?? DEFAULT_LANGUAGE;
}
