import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { SupportedLanguage, LanguagePatterns } from '../infra/parser-interface';
import { NodeInfo } from '../types/common';

export class JavaParser extends BaseParser {
  protected extractObjectDetails(node: SgNode): NodeInfo {
    throw new Error('Method not implemented.');
  }
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
