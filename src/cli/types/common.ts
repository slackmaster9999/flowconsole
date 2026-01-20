export type NodeInfo = {
  name: string;
  className: string;
};

export type Flow = {
  from: string;
  method: string | null;
  to: string[];
  text: string;
};

export type ParseResult = {
  nodes: NodeInfo[];
  flows: Flow[];
};

export type SupportedLanguage =
  | 'typescript'
  | 'python'
  | 'csharp'
  | 'java'
  | 'go';
