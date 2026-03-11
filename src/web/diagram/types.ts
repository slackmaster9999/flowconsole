import type { Edge, EdgeTypes, Node, NodeTypes, Position } from '@xyflow/react';

export type ElementShape = 'person' | 'service' | 'database' | 'queue' | 'storage' | 'boundary';

export type ElementTone = 'primary' | 'muted' | 'success' | 'warning' | 'danger';

export type ElementStatus = 'operational' | 'degraded' | 'down';

type BaseNodeData = {
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  badge?: string;
  tone?: ElementTone;
  status?: ElementStatus;
  flowHighlighted?: boolean;
  flowCurrent?: 'source' | 'target';
};

export type ElementNodeData = BaseNodeData & {
  shape?: ElementShape;
  icon?: string;
  clickable?: boolean;
};

export type ContainerNodeData = BaseNodeData & {
  shape?: 'container';
  footer?: string;
  muted?: boolean;
  expanded?: boolean;
  childCount?: number;
  showOpenButton?: boolean;
};

export type ArchitectureNodeData =
  | ElementNodeData
  | ContainerNodeData;

export type RelationshipKind = 'sync' | 'async' | 'event' | 'dependency';

export type RelationshipEdgeData = {
  label?: string;
  detail?: string;
  kind?: RelationshipKind;
  muted?: boolean;
  hovered?: boolean;
  direction?: 'forward' | 'both' | 'none';
  icon?: string;
  labelSide?: 'above' | 'below' | 'left' | 'right';
  layoutPoints?: { x: number; y: number }[];
  labelPos?: { x: number; y: number };
  controlPoints?: { x: number; y: number }[];
  sourceAnchor?: {
    position: Position;
    offset: number;
  };
  targetAnchor?: {
    position: Position;
    offset: number;
  };
  flowHighlighted?: boolean;
  flowCurrent?: boolean;
  originalEdgeIds?: string[];
  flowTick?: number;
};

export type ElementNodeType = Node<ElementNodeData, 'element'>;
export type ContainerNodeType = Node<ContainerNodeData, 'container'>;
export type RelationshipEdgeType = Edge<RelationshipEdgeData, 'relationship'>;

export type ArchitectureNode = ElementNodeType | ContainerNodeType;
export type ArchitectureEdge = RelationshipEdgeType;

export type FlowStep = {
  id: string;
  edgeId: string;
  sourceId: string;
  targetId: string;
  label?: string;
};

export type FlowDefinition = {
  id: string;
  name?: string;
  steps: FlowStep[];
};

export type ArchitectureNodeTypes = NodeTypes;
export type ArchitectureEdgeTypes = EdgeTypes;

export type ArchitectureDiagramModel = {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  flows?: FlowDefinition[];
};
