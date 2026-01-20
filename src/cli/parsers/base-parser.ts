import { parse } from '@ast-grep/napi';
import type { SgNode } from '@ast-grep/napi';
import type { LanguageParser, LanguagePatterns } from '../core/parser-interface';
import type { ParseResult, NodeInfo, Flow, SupportedLanguage } from '../types/common';

export abstract class BaseParser implements LanguageParser {
  protected langName: string;

  constructor(langName: string) {
    this.langName = langName;
  }

  abstract getLanguage(): SupportedLanguage;
  abstract getPatterns(): LanguagePatterns;
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

  collectObjects(root: SgNode): Map<string, NodeInfo> {
    const patterns = this.getPatterns().objectInstantiation;
    const objects = new Map<string, NodeInfo>();

    for (const pattern of patterns) {
      root.findAll(pattern).forEach((node) => {
        const name = node.getMatch('NAME')?.text();
        const className = this.extractClassName(node);

        if (name && className) {
          objects.set(name, { name, className });
        }
      });
    }

    return objects;
  }

  collectFlows(root: SgNode, objects: Map<string, NodeInfo>): Flow[] {
    const flows: Flow[] = [];
    const methodPattern = this.getPatterns().methodCall;

    root.findAll(methodPattern).forEach((callNode) => {
      const { base, method } = this.getBaseAndMethod(callNode);
      if (!base || !objects.has(base)) return;

      const argIds = this.collectIdentifierArgs(callNode);
      const targets = argIds.filter((id) => objects.has(id));

      flows.push({
        from: base,
        method,
        to: targets,
        text: callNode.text(),
      });
    });

    return flows;
  }

  protected getBaseAndMethod(callNode: SgNode): { base: string | null; method: string | null } {
    let func = callNode.field('function');
    let method: string | null = null;

    while (func) {
      if (func.is('member_expression') || func.is('attribute')) {
        const prop = func.field('property') || func.field('attribute');
        if (!method && prop) method = prop.text();
        func = func.field('object') || func.field('value');
        continue;
      }
      if (func.is('call_expression')) {
        func = func.field('function');
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
