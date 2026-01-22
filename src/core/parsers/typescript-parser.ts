import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { SupportedLanguage, LanguagePatterns } from '../infra/parser-interface';
import { NodeInfo } from '../types/common';
import { uuidv7 } from 'uuidv7';

export class TypeScriptParser extends BaseParser {
  constructor() {
    super('typescript', '$');
  }

  getLanguage(): SupportedLanguage {
    return 'typescript';
  }

  getPatterns(): LanguagePatterns {
    return {
      objectInstantiation: [
        'const $NAME = new $CLASS($ARGS)',
        'let $NAME = new $CLASS($ARGS)',
        'var $NAME = new $CLASS($ARGS)',
      ],
      methodCall: '$CALLEE($$$ARGS)',
    };
  }

  extractObjectDetails(node: SgNode): NodeInfo {
    const args = node.getMatch('ARGS');
    return {
      id: uuidv7(),
      name: node.getMatch('NAME')?.text() || '',
      className: this.extractClassName(node) || '',
      sourceLine: `${node.range().start.line+1} - ${node.range().end.line+1}`,
      description: this.findArgValue<string>(args, 'description'),
      parentId: this.findArgValue<string>(args, 'belongsTo'),
      tags: this.findArgValue<string[]>(args, 'tags', false),
      badge: this.findArgValue<string>(args, 'badge'),
      icon: this.findArgValue<string>(args, 'icon')
    };
  }

  protected extractClassName(node: SgNode): string | null {
    return node.getMatch('CLASS')?.text() || null;
  }
}
