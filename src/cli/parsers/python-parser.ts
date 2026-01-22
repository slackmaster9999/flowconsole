import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { SupportedLanguage, LanguagePatterns } from '../core/parser-interface';
import { NodeInfo } from '../types/common';

export class PythonParser extends BaseParser {
  protected extractObjectDetails(node: SgNode): NodeInfo {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('python', 'µ');
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
