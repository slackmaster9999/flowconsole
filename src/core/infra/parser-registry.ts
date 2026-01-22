import type { LanguageParser } from './parser-interface';
import type { SupportedLanguage } from '../types/common';

export class ParserRegistry {
  private parsers: Map<SupportedLanguage, LanguageParser>;

  constructor() {
    this.parsers = new Map();
  }

  register(parser: LanguageParser): void {
    this.parsers.set(parser.getLanguage(), parser);
  }

  getParser(language: SupportedLanguage): LanguageParser | undefined {
    return this.parsers.get(language);
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return Array.from(this.parsers.keys());
  }
}
