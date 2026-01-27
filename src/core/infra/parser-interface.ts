import type { SgNode } from '@ast-grep/napi';
import { ParseResult, NodeInfo, FlowStep, SupportedLanguage } from '../types/common';

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
  collectFlows(root: SgNode, objects: Map<string, NodeInfo>): FlowStep[];
  getPatterns(): LanguagePatterns;
}
