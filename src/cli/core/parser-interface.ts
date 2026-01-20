import type { SgNode } from '@ast-grep/napi';
import type { ParseResult, NodeInfo, Flow, SupportedLanguage } from '../types/common';

export type { SupportedLanguage };

export interface LanguagePatterns {
  objectInstantiation: string[];
  methodCall: string;
  classNameTransform?: (name: string) => string[];
  methodNameTransform?: (name: string) => string[];
}

export interface LanguageParser {
  getLanguage(): SupportedLanguage;
  parse(source: string): ParseResult;
  collectObjects(root: SgNode): Map<string, NodeInfo>;
  collectFlows(root: SgNode, objects: Map<string, NodeInfo>): Flow[];
  getPatterns(): LanguagePatterns;
}
