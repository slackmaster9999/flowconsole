import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { LanguagePatterns } from '../infra/parser-interface';
import { NodeInfo, SupportedLanguage } from '../types/common';
import { uuidv7 } from 'uuidv7';

export class JavaParser extends BaseParser {
  protected extractObjectDetails(node: SgNode): NodeInfo {
    const argsNodes = node.getMultipleMatches('ARGS');

    return {
      id: uuidv7(),
      name: node.getMatch('NAME')?.text() || '',
      className: this.extractClassName(node) || '',
      sourceLine: `${node.range().start.line + 1} - ${node.range().end.line + 1}`,
      description: this.findJavaBuilderValue(argsNodes, 'description'),
      parentId: this.findJavaBuilderValue(argsNodes, 'belongsTo'),
      tags: this.findJavaBuilderArrayValue(argsNodes, 'tags'),
      badge: this.findJavaBuilderValue(argsNodes, 'badge'),
      icon: this.findJavaBuilderValue(argsNodes, 'icon')
    };
  }

  private findJavaBuilderValue(argsNodes: SgNode[], methodName: string): string | undefined {
    const valueNode = this.findBuilderMethodArg(argsNodes, methodName);
    if (!valueNode) return undefined;

    if (valueNode.kind() === 'string_literal') {
      return this.stripStringLiteral(valueNode.text());
    }

    return valueNode.text();
  }

  private findJavaBuilderArrayValue(argsNodes: SgNode[], methodName: string): string[] | undefined {
    const valueNode = this.findBuilderMethodArg(argsNodes, methodName);
    if (!valueNode) return undefined;

    if (valueNode.kind() === 'method_invocation') {
      const args = valueNode.field('arguments') || valueNode.field('argument_list');
      if (!args) return undefined;
      const values = args.children()
        .filter(child => child.kind() === 'string_literal')
        .map(child => this.stripStringLiteral(child.text()));
      return values.length ? values : undefined;
    }

    return undefined;
  }

  private findBuilderMethodArg(argsNodes: SgNode[], methodName: string): SgNode | null {
    for (const arg of argsNodes) {
      const invocation = this.getMethodInvocation(arg);
      if (!invocation) continue;

      let current: SgNode | null = invocation;
      while (current && current.kind() === 'method_invocation') {
        const nameNode = current.field('name');
        const name = nameNode?.text();
        if (name && name !== 'build' && name !== 'builder') {
          if (name === methodName) {
            return this.getFirstArgument(current);
          }
        }
        current = current.field('object') || null;
      }
    }
    return null;
  }

  private getMethodInvocation(node: SgNode): SgNode | null {
    if (node.kind() === 'method_invocation') return node;
    return node.children().find(child => child.kind() === 'method_invocation') || null;
  }

  private getFirstArgument(invocation: SgNode): SgNode | null {
    const args = invocation.field('arguments') || invocation.field('argument_list');
    if (!args) return null;
    for (const child of args.children()) {
      const kind = child.kind();
      if (kind === '(' || kind === ')' || kind === ',') continue;
      return child;
    }
    return null;
  }

  private stripStringLiteral(text: string): string {
    return text.replace(/^\"(.*)\"$/, '$1');
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
      methodCall: '$OBJ.$METHOD($$$ARGS)',
    };
  }

  protected extractClassName(node: SgNode): string | null {
    return node.getMatch('CLASS')?.text() || null;
  }
}
