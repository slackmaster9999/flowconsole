import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { SupportedLanguage, LanguagePatterns } from '../core/parser-interface';

export class TypeScriptParser extends BaseParser {
  constructor() {
    super('TypeScript');
  }

  getLanguage(): SupportedLanguage {
    return 'typescript';
  }

  getPatterns(): LanguagePatterns {
    return {
      objectInstantiation: [
        'const $NAME = new $CLASS($$$ARGS)',
        'let $NAME = new $CLASS($$$ARGS)',
        'var $NAME = new $CLASS($$$ARGS)',
      ],
      methodCall: '$CALLEE($$$ARGS)',
    };
  }

  protected extractClassName(node: SgNode): string | null {
    return node.getMatch('CLASS')?.text() || null;
  }
}
