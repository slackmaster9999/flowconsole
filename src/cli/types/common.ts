export type ConnectionKind = 'sync' | 'async' | 'event' | 'dependency';

export type NodeInfo = {
  id: string;
  name: string;
  className: string;
  description?: string;
  parentId?: string;
  tags?: string[];
  badge?: string;
  icon?: string;
};

export type FlowStep = {
  id: string;
  sourceId: string;
  targetId: string;
  label: string | null;
  detail?: string;
  kind: ConnectionKind;
  icon?: string;
  text: string;
};

export type ParseResult = {
  nodes: NodeInfo[];
  flows: FlowStep[];
};

export type SupportedLanguage =
  | 'typescript'
  | 'python'
  | 'csharp'
  | 'java'
  | 'go';
