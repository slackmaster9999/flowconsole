import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { SupportedLanguage, LanguagePatterns } from '../core/parser-interface';

export class GoParser extends BaseParser {
  constructor() {
    super('go');
  }

  getLanguage(): SupportedLanguage {
    return 'go';
  }

  getPatterns(): LanguagePatterns {
    return {
      objectInstantiation: [
        '$NAME := $PACKAGE.New$CLASS($$$ARGS)',
        '$NAME := New$CLASS($$$ARGS)',
      ],
      methodCall: '$CALLEE($$$ARGS)',
    };
  }

  protected extractClassName(node: SgNode): string | null {
    const classMatch = node.getMatch('CLASS')?.text();
    return classMatch || null;
  }
}
