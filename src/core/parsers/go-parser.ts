import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { LanguagePatterns } from '../infra/parser-interface';
import { NodeInfo, SupportedLanguage } from '../types/common';
import { uuidv7 } from 'uuidv7';

export class GoParser extends BaseParser {
  protected extractObjectDetails(node: SgNode): NodeInfo {
    const argsNodes = node.getMultipleMatches('ARGS');

    return {
      id: uuidv7(),
      name: node.getMatch('NAME')?.text() || '',
      className: this.extractClassName(node) || '',
      sourceLine: `${node.range().start.line + 1} - ${node.range().end.line + 1}`,
      description: this.findGoFieldValue(argsNodes, 'Description'),
      parentId: this.findGoFieldValue(argsNodes, 'BelongsTo'),
      tags: this.findGoArrayFieldValue(argsNodes, 'Tags'),
      badge: this.findGoFieldValue(argsNodes, 'Badge'),
      icon: this.findGoFieldValue(argsNodes, 'Icon')
    };
  }

  // Navigate into struct literal to find keyed_elements
  private getKeyedElements(argsNodes: SgNode[]): SgNode[] {
    for (const arg of argsNodes) {
      if (arg.kind() === 'keyed_element') {
        return argsNodes.filter(n => n.kind() === 'keyed_element');
      }
      // Navigate: unary_expression -> composite_literal -> literal_value
      const compositeLit = arg.kind() === 'unary_expression'
        ? arg.children().find(c => c.kind() === 'composite_literal')
        : (arg.kind() === 'composite_literal' ? arg : null);
      if (compositeLit) {
        const literalValue = compositeLit.children().find(c => c.kind() === 'literal_value');
        if (literalValue) {
          return literalValue.children().filter(c => c.kind() === 'keyed_element');
        }
      }
    }
    return [];
  }

  private findGoFieldValue(argsNodes: SgNode[], fieldName: string): string | undefined {
    const keyedElements = this.getKeyedElements(argsNodes);
    // keyed_element children: [literal_element (name), :, literal_element (value)]
    const element = keyedElements.find(el => {
      const children = el.children();
      const nameNode = children.find(c => c.kind() === 'literal_element');
      return nameNode?.text() === fieldName;
    });
    if (!element) return undefined;

    // Value is the third child (literal_element) which contains interpreted_string_literal
    const children = element.children();
    const valueNode = children.filter(c => c.kind() === 'literal_element')[1];
    const stringLit = valueNode?.children().find(c => c.kind() === 'interpreted_string_literal');
    return stringLit?.text().replace(/^"(.*)"$/, '$1');
  }

  private findGoArrayFieldValue(argsNodes: SgNode[], fieldName: string): string[] | undefined {
    const keyedElements = this.getKeyedElements(argsNodes);
    const element = keyedElements.find(el => {
      const children = el.children();
      const nameNode = children.find(c => c.kind() === 'literal_element');
      return nameNode?.text() === fieldName;
    });
    if (!element) return undefined;

    // Value literal_element contains composite_literal for arrays
    const children = element.children();
    const valueNode = children.filter(c => c.kind() === 'literal_element')[1];
    const compositeLit = valueNode?.children().find(c => c.kind() === 'composite_literal');
    const literalValue = compositeLit?.children().find(c => c.kind() === 'literal_value');
    if (!literalValue) return undefined;

    // Array elements are literal_element containing interpreted_string_literal
    return literalValue.children()
      .filter(c => c.kind() === 'literal_element')
      .map(litEl => {
        const strLit = litEl.children().find(c => c.kind() === 'interpreted_string_literal');
        return strLit?.text().replace(/^"(.*)"$/, '$1') || litEl.text().replace(/^"(.*)"$/, '$1');
      });
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
        '$NAME := $PACKAGE.$METHOD($$$ARGS)', // flowconsole.NewUser(...)
        '$NAME := $METHOD($$$ARGS)', // NewUser(...) with dot import
      ],
      methodCall: '$CALLEE($$$ARGS)',
    };
  }

  protected extractClassName(node: SgNode): string | null {
    // METHOD is like "NewUser" - extract "User" by removing "New" prefix
    const method = node.getMatch('METHOD')?.text();
    if (method?.startsWith('New')) {
      return method.slice(3);
    }
    return method || null;
  }
}
