import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { SupportedLanguage, LanguagePatterns } from '../core/parser-interface';

export class PythonParser extends BaseParser {
  constructor() {
    super('python');
  }

  getLanguage(): SupportedLanguage {
    return 'python';
  }

  getPatterns(): LanguagePatterns {
    return {
      objectInstantiation: [
        '$NAME = $CLASS($$$ARGS)',
      ],
      methodCall: '$CALLEE($$$ARGS)',
    };
  }

  protected extractClassName(node: SgNode): string | null {
    return node.getMatch('CLASS')?.text() || null;
  }
}
