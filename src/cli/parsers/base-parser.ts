import { parse } from '@ast-grep/napi';
import type { SgNode } from '@ast-grep/napi';
import { uuidv7 } from 'uuidv7';
import type { LanguageParser, LanguagePatterns } from '../core/parser-interface';
import type { ParseResult, NodeInfo, FlowStep, SupportedLanguage, ConnectionKind } from '../types/common';

export abstract class BaseParser implements LanguageParser {
  protected langName: string;
  protected metaVarChar: string;

  constructor(langName: string, metaVarChar = '$') {
    this.langName = langName;
    this.metaVarChar = metaVarChar;
  }

  abstract getLanguage(): SupportedLanguage;
  abstract getPatterns(): LanguagePatterns;

  protected abstract extractObjectDetails(node: SgNode): NodeInfo;
  protected abstract extractClassName(node: SgNode): string | null;

  parse(source: string): ParseResult {
    const ast = parse(this.langName, source);
    const root = ast.root();

    const objects = this.collectObjects(root);
    const flows = this.collectFlows(root, objects);

    return {
      nodes: Array.from(objects.values()),
      flows,
    };
  }

  findArgValue<T extends string | string[]>(args: SgNode | null, argName: string, removeQuotes = true)
  : T {
    var argValue = args?.children().find(c => c.field("key")?.text() === argName)
      ?.field("value");

    switch (argValue?.kind()) {
      case 'string': return removeQuotes ? argValue.text().replace(/^['"`](.*)['"`]$/, '$1') as T : argValue.text() as T;
      case 'array': {
        return argValue?.children().filter(c => c.is('string')).map(c => c.text().replace(/^['"`](.*)['"`]$/, '$1')) as T;
      }
      default: return argValue?.text() as T;
    }
  }

  collectObjects(root: SgNode): Map<string, NodeInfo> {
    const patterns = this.getPatterns().objectInstantiation.map((pattern) => this.patternForLang(pattern));
    const objects = new Map<string, NodeInfo>();

    for (const pattern of patterns) {
      root.findAll(pattern).forEach((node) => {
        const name = node.getMatch('NAME')?.text();
        const className = this.extractClassName(node);

        if (name && className) {
          const obj = this.extractObjectDetails(node);
          objects.set(name, obj);
        }
      });
    }

    return objects;
  }

  collectFlows(root: SgNode, objects: Map<string, NodeInfo>): FlowStep[] {
    const flows: FlowStep[] = [];
    const methodPattern = this.patternForLang(this.getPatterns().methodCall);

    root.findAll(methodPattern).forEach((callNode) => {
      const { base, method } = this.getBaseAndMethod(callNode);
      if (!base || !objects.has(base)) return;

      const argIds = this.collectIdentifierArgs(callNode);
      const targets = argIds.filter((id) => objects.has(id));
      const text = callNode.text();
      const kind = this.inferConnectionKind(method);
      const sourceNode = objects.get(base);

      for (const targetName of targets) {
        const targetNode = objects.get(targetName);
        if (!sourceNode || !targetNode) continue;

        flows.push({
          id: uuidv7(),
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          label: method,
          kind,
          text,
        });
      }
    });

    return flows;
  }

  protected inferConnectionKind(method: string | null): ConnectionKind {
    if (!method) return 'sync';

    const lowerMethod = method.toLowerCase();

    if (lowerMethod.includes('event') || lowerMethod.includes('publish') || lowerMethod.includes('emit')) {
      return 'event';
    }
    if (lowerMethod.includes('async') || lowerMethod.includes('queue') || lowerMethod.includes('send')) {
      return 'async';
    }
    if (lowerMethod.includes('get') || lowerMethod.includes('fetch') || lowerMethod.includes('read') || lowerMethod.includes('data')) {
      return 'dependency';
    }

    return 'sync';
  }

  protected patternForLang(pattern: string): string {
    if (this.metaVarChar === '$') return pattern;
    return pattern.replaceAll('$', this.metaVarChar);
  }

  protected getBaseAndMethod(callNode: SgNode): { base: string | null; method: string | null } {
    if (callNode.is && callNode.is('method_invocation')) {
      const baseNode = callNode.field('object');
      const nameNode = callNode.field('name');
      return {
        base: baseNode ? baseNode.text() : null,
        method: nameNode ? nameNode.text() : null,
      };
    }

    let func = callNode.field('function');
    let method: string | null = null;

    while (func) {
      if (
        func.is('member_expression') ||
        func.is('attribute') ||
        func.is('selector_expression') ||
        func.is('field_access')
      ) {
        const prop =
          func.field('property') ||
          func.field('attribute') ||
          func.field('field') ||
          func.field('name');
        if (!method && prop) method = prop.text();
        func = func.field('object') || func.field('value') || func.field('operand');
        continue;
      }
      if (func.is('call_expression') || func.is('method_invocation')) {
        func = func.field('function') || func.field('object');
        continue;
      }
      if (func.is('identifier')) {
        return { base: func.text(), method };
      }
      break;
    }
    return { base: null, method };
  }

  protected collectIdentifierArgs(node: SgNode): string[] {
    const argsNode = node.field('arguments');
    if (!argsNode) return [];

    const result: string[] = [];
    const stack = [argsNode];

    while (stack.length) {
      const cur = stack.pop();
      if (!cur) continue;

      if (cur.is && cur.is('identifier')) {
        result.push(cur.text());
      }

      if (cur.children) {
        cur.children().forEach((child: SgNode) => stack.push(child));
      }
    }

    return result;
  }
}
