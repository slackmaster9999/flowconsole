import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { LanguagePatterns } from '../infra/parser-interface';
import { NodeInfo, SupportedLanguage } from '../types/common';
import { uuidv7 } from 'uuidv7';

export class PythonParser extends BaseParser {
  protected extractObjectDetails(node: SgNode): NodeInfo {
    // For variadic patterns ($$$ARGS), use getMultipleMatches
    const argsNodes = node.getMultipleMatches('ARGS');

    return {
      id: uuidv7(),
      name: node.getMatch('NAME')?.text() || '',
      className: this.extractClassName(node) || '',
      sourceLine: `${node.range().start.line + 1} - ${node.range().end.line + 1}`,
      description: this.findPythonArgValue(argsNodes, 'description'),
      parentId: this.findPythonArgValue(argsNodes, 'belongsTo'),
      tags: this.findPythonArgArrayValue(argsNodes, 'tags'),
      badge: this.findPythonArgValue(argsNodes, 'badge'),
      icon: this.findPythonArgValue(argsNodes, 'icon')
    };
  }

  private findPythonArgValue(argsNodes: SgNode[], argName: string): string | undefined {
    // Python keyword_argument has 'name' and 'value' fields
    const kwArg = argsNodes.find(n =>
      n.kind() === 'keyword_argument' && n.field('name')?.text() === argName
    );
    if (!kwArg) return undefined;
    const value = kwArg.field('value')?.text();
    // Remove quotes from string
    return value?.replace(/^['"`](.*)['"`]$/, '$1');
  }

  private findPythonArgArrayValue(argsNodes: SgNode[], argName: string): string[] | undefined {
    const kwArg = argsNodes.find(n =>
      n.kind() === 'keyword_argument' && n.field('name')?.text() === argName
    );
    if (!kwArg) return undefined;
    const listNode = kwArg.field('value');
    if (!listNode || listNode.kind() !== 'list') return undefined;

    return listNode.children()
      .filter(c => c.kind() === 'string')
      .map(c => c.text().replace(/^['"`](.*)['"`]$/, '$1'));
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
