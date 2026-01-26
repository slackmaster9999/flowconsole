import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { LanguagePatterns } from '../infra/parser-interface';
import { NodeInfo, SupportedLanguage } from '../types/common';

export class CSharpParser extends BaseParser {
  protected extractObjectDetails(node: SgNode): NodeInfo {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('csharp', 'µ');
  }

  getLanguage(): SupportedLanguage {
    return 'csharp';
  }

  getPatterns(): LanguagePatterns {
    return {
      objectInstantiation: [
        'var $NAME = new $CLASS($$$ARGS)',
        '$TYPE $NAME = new $CLASS($$$ARGS)',
      ],
      methodCall: '$CALLEE($$$ARGS)',
    };
  }

  protected extractClassName(node: SgNode): string | null {
    return node.getMatch('CLASS')?.text() || null;
  }
}
