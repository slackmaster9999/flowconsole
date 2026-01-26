import type { SgNode } from '@ast-grep/napi';
import { BaseParser } from './base-parser';
import type { LanguagePatterns } from '../infra/parser-interface';
import { NodeInfo, SupportedLanguage } from '../types/common';
import { uuidv7 } from 'uuidv7';

export class CSharpParser extends BaseParser {
  protected extractObjectDetails(node: SgNode): NodeInfo {
    const argsNodes = node.getMultipleMatches('ARGS');

    return {
      id: uuidv7(),
      name: node.getMatch('NAME')?.text() || '',
      className: this.extractClassName(node) || '',
      sourceLine: `${node.range().start.line + 1} - ${node.range().end.line + 1}`,
      description: this.findCSharpFieldValue(argsNodes, 'Description'),
      parentId: this.findCSharpFieldValue(argsNodes, 'BelongsTo'),
      tags: this.findCSharpArrayFieldValue(argsNodes, 'Tags'),
      badge: this.findCSharpFieldValue(argsNodes, 'Badge'),
      icon: this.findCSharpFieldValue(argsNodes, 'Icon')
    };
  }

  private findCSharpFieldValue(argsNodes: SgNode[], fieldName: string): string | undefined {
    const assignment = this.findInitializerAssignment(argsNodes, fieldName);
    if (!assignment) return undefined;

    const valueNode = this.getAssignmentValueNode(assignment);
    if (!valueNode) return undefined;

    if (valueNode.kind() === 'string_literal') {
      return this.stripStringLiteral(valueNode.text());
    }

    return valueNode.text();
  }

  private findCSharpArrayFieldValue(argsNodes: SgNode[], fieldName: string): string[] | undefined {
    const assignment = this.findInitializerAssignment(argsNodes, fieldName);
    if (!assignment) return undefined;

    const valueNode = this.getAssignmentValueNode(assignment);
    if (!valueNode) return undefined;

    const initializer = this.getInitializerFromValue(valueNode);
    if (!initializer) return undefined;

    const values = initializer.children()
      .filter(c => c.kind() === 'string_literal')
      .map(c => this.stripStringLiteral(c.text()));

    return values.length ? values : undefined;
  }

  private findInitializerAssignment(argsNodes: SgNode[], fieldName: string): SgNode | null {
    const initializer = this.getInitializerExpression(argsNodes);
    if (!initializer) return null;

    return initializer.children().find(child => {
      if (child.kind() !== 'assignment_expression') return false;
      const nameNode = child.children().find(c => c.kind() === 'identifier');
      return nameNode?.text() === fieldName;
    }) || null;
  }

  private getInitializerExpression(argsNodes: SgNode[]): SgNode | null {
    for (const arg of argsNodes) {
      const objectCreation = this.getObjectCreationExpression(arg);
      if (!objectCreation) continue;

      const initializer = objectCreation.children().find(c => c.kind() === 'initializer_expression');
      if (initializer) return initializer;
    }
    return null;
  }

  private getObjectCreationExpression(arg: SgNode): SgNode | null {
    if (arg.kind() === 'object_creation_expression') return arg;
    return arg.children().find(c => c.kind() === 'object_creation_expression') || null;
  }

  private getAssignmentValueNode(assignment: SgNode): SgNode | null {
    const children = assignment.children();
    const eqIndex = children.findIndex(c => c.kind() === '=');
    if (eqIndex === -1) return null;
    return children[eqIndex + 1] || null;
  }

  private getInitializerFromValue(valueNode: SgNode): SgNode | null {
    if (valueNode.kind() === 'initializer_expression') return valueNode;
    return valueNode.children().find(c => c.kind() === 'initializer_expression') || null;
  }

  private stripStringLiteral(text: string): string {
    return text.replace(/^@?\"(.*)\"$/, '$1');
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
