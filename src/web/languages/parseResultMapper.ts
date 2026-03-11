import type { ArchitectureDiagramModel, ArchitectureEdge, ArchitectureNode } from '../diagram/types';
import type { ElementShape, ElementTone, RelationshipKind } from '../diagram/types';

type NodeRenderConfig = {
  nodeType: 'element' | 'container';
  shape?: ElementShape;
  tone?: ElementTone;
  icon?: string;
};

type ParseNode = {
  id: string;
  name: string;
  className: string;
  description?: string;
  parentId?: string;
  tags?: string[];
  badge?: string;
  icon?: string;
};

type ParseFlow = {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string | null;
  detail?: string;
  kind?: RelationshipKind;
  icon?: string;
};

export type ParseResult = {
  nodes: ParseNode[];
  flows: ParseFlow[];
};

const CLASS_NODE_STYLES: Record<string, NodeRenderConfig> = {
  User: { nodeType: 'element', shape: 'person', tone: 'primary' },
  ComputerSystem: { nodeType: 'container' },
  Container: { nodeType: 'container' },
  ReactApp: { nodeType: 'element', shape: 'service' },
  RestApi: { nodeType: 'element', shape: 'service' },
  Redis: { nodeType: 'element', shape: 'database', tone: 'muted' },
  Postgres: { nodeType: 'element', shape: 'database', tone: 'muted' },
  KafkaTopic: { nodeType: 'element', shape: 'queue', tone: 'warning' },
  MessageQueue: { nodeType: 'element', shape: 'queue', tone: 'primary' },
  ExternalService: { nodeType: 'element', shape: 'service', tone: 'muted' },
  BackgroundJob: { nodeType: 'element', shape: 'service', tone: 'primary' },
};

export function mapParseResultToDiagramModel(result: ParseResult): ArchitectureDiagramModel {
  const nodes: ArchitectureNode[] = result.nodes.map((node) => buildNode(node));
  const nodeIds = new Set(nodes.map((node) => node.id));

  const edges: ArchitectureEdge[] = result.flows
    .filter((flow) => nodeIds.has(flow.sourceId) && nodeIds.has(flow.targetId))
    .map((flow) => buildEdge(flow));

  return { nodes, edges };
}

function buildNode(node: ParseNode): ArchitectureNode {
  const renderConfig = CLASS_NODE_STYLES[node.className] ?? { nodeType: 'element' };
  const base = {
    id: node.id,
    position: { x: 0, y: 0 },
    parentId: node.parentId,
  } as const;

  if (renderConfig.nodeType === 'container') {
    return {
      ...base,
      type: 'container',
      data: {
        title: node.name,
        description: node.description,
        tags: node.tags,
        badge: node.badge,
        expanded: true,
      },
    } as ArchitectureNode;
  }

  return {
    ...base,
    type: 'element',
    data: {
      title: node.name,
      description: node.description,
      tags: node.tags,
      badge: node.badge,
      tone: renderConfig.tone,
      shape: renderConfig.shape,
      icon: node.icon ?? renderConfig.icon,
    },
  } as ArchitectureNode;
}

function buildEdge(flow: ParseFlow): ArchitectureEdge {
  return {
    id: flow.id,
    type: 'relationship',
    source: flow.sourceId,
    target: flow.targetId,
    data: {
      label: flow.label ?? undefined,
      detail: flow.detail,
      kind: flow.kind ?? 'sync',
      icon: flow.icon,
    },
  };
}
