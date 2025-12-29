import type { ElementShape, ElementTone, ArchitectureDiagramModel, ArchitectureNode, ArchitectureEdge, FlowDefinition } from '../../diagram/types';
import type { ConnectionRecord, DiagramIntermediateModel, EntityRecord, EntityTypeName } from './diagramRuntime';

type NodeRenderConfig = {
  nodeType: 'element' | 'container';
  shape?: ElementShape;
  tone?: ElementTone;
  icon?: string;
};

const ENTITY_NODE_STYLES: Record<EntityTypeName, NodeRenderConfig> = {
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

export function buildReactFlowModel(intermediate: DiagramIntermediateModel): ArchitectureDiagramModel {
  const nodes: ArchitectureNode[] = intermediate.entities.map((entity) => buildNode(entity));
  const sortedNodes = nodes.sort((a, b) => {
    if (a.type === b.type) return 0;
    if (a.type === 'container') return -1;
    if (b.type === 'container') return 1;
    return 0;
  });

  const edges: ArchitectureEdge[] = intermediate.relationships.map((rel) => buildEdge(rel));

  const flows: FlowDefinition[] = (intermediate.flows ?? []).map((flow, idx) => ({
    id: flow.id,
    name: flow.name || `Flow ${idx + 1}`,
    steps: flow.steps.map((s) => ({
      id: s.id,
      edgeId: s.edgeId,
      sourceId: s.sourceId,
      targetId: s.targetId,
      label: s.label,
    })),
  }));

  return { nodes: sortedNodes, edges, flows };
}

function buildNode(entity: EntityRecord): ArchitectureNode {
  const renderConfig = ENTITY_NODE_STYLES[entity.type];
  const base = {
    id: entity.id,
    position: { x: 0, y: 0 },
    parentId: entity.parentId,
  } as const;

  if (renderConfig.nodeType === 'container') {
    return {
      ...base,
      type: 'container',
      data: {
        title: entity.name,
        description: entity.description,
        tags: entity.tags,
        badge: entity.badge,
        tone: (entity.tone as ElementTone | undefined),
        expanded: true,
      },
    } as ArchitectureNode;
  }

  const metadata = entity.metadata;
  const subtitle =
    pickString(metadata, 'technology') ??
    pickString(metadata, 'framework') ??
    pickString(metadata, 'vendor') ??
    pickString(metadata, 'schedule') ??
    undefined;

  return {
    ...base,
    type: 'element',
    data: {
      title: entity.name,
      subtitle,
      description: entity.description,
      tags: entity.tags,
      badge: entity.badge,
      tone: (entity.tone as ElementTone | undefined) ?? renderConfig.tone,
      shape: renderConfig.shape,
      icon: renderConfig.icon,
    },
  } as ArchitectureNode;
}

function buildEdge(rel: ConnectionRecord): ArchitectureEdge {
  return {
    id: rel.id,
    type: 'relationship',
    source: rel.sourceId,
    target: rel.targetId,
    data: {
      label: rel.label,
      detail: rel.detail,
      kind: rel.kind,
      icon: rel.icon,
      muted: rel.muted,
    },
  };
}

function pickString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === 'string' ? value : undefined;
}
