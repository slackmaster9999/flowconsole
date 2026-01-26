import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { LanguagePatterns } from '../infra/parser-interface';
import { NodeInfo, SupportedLanguage } from '../types/common';

export class GoParser extends BaseParser {
  protected extractObjectDetails(node: SgNode): NodeInfo {
    throw new Error('Method not implemented.');
  }
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
