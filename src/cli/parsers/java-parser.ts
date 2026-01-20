import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { SupportedLanguage, LanguagePatterns } from '../core/parser-interface';

export class JavaParser extends BaseParser {
  constructor() {
    super('java');
  }

  getLanguage(): SupportedLanguage {
    return 'java';
  }

  getPatterns(): LanguagePatterns {
    return {
      objectInstantiation: [
        '$TYPE $NAME = new $CLASS($$$ARGS)',
      ],
      methodCall: '$CALLEE($$$ARGS)',
    };
  }

  protected extractClassName(node: SgNode): string | null {
    return node.getMatch('CLASS')?.text() || null;
  }
}
