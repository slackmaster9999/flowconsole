import type { ArchitectureDiagramModel, ArchitectureEdge, ArchitectureNode, ContainerNodeData } from '../types';

function buildIndex(model: ArchitectureDiagramModel) {
  const byId = new Map<string, ArchitectureNode>();
  const children = new Map<string, ArchitectureNode[]>();

  model.nodes.forEach((node) => {
    byId.set(node.id, node);
    if (!node.parentId) return;
    const bucket = children.get(node.parentId) ?? [];
    bucket.push(node);
    children.set(node.parentId, bucket);
  });

  return { byId, children };
}

function isDescendant(nodeId: string, ancestorId: string, index: Map<string, ArchitectureNode>) {
  let current = index.get(nodeId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = index.get(current.parentId);
  }
  return false;
}

function representativeFor(
  nodeId: string,
  scopeId: string | undefined,
  index: Map<string, ArchitectureNode>
) {
  const cache = representativeFor as unknown as { _cache?: Map<string, string | undefined> };
  cache._cache ??= new Map<string, string | undefined>();
  if (cache._cache.has(nodeId)) return cache._cache.get(nodeId);

  const node = index.get(nodeId);
  if (!node) {
    cache._cache.set(nodeId, undefined);
    return undefined;
  }

  if (scopeId && nodeId === scopeId) {
    cache._cache.set(nodeId, nodeId);
    return nodeId;
  }

  // Root-level view: bubble up to the top-most ancestor.
  if (!scopeId) {
    let current = node;
    while (current.parentId && index.has(current.parentId)) {
      current = index.get(current.parentId)!;
    }
    cache._cache.set(nodeId, current.id);
    return current.id;
  }

  // Scoped view: if the node is inside the scope, surface the direct child of the scope.
  if (isDescendant(nodeId, scopeId, index)) {
    let current = node;
    while (current.parentId && current.parentId !== scopeId) {
      const parent = index.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    cache._cache.set(nodeId, current.id);
    return current.id;
  }

  // Outside the scope: surface a nearby sibling if they share a parent with the scope,
  // otherwise bubble up to the top-most ancestor.
  const scopeParent = index.get(scopeId ?? '')?.parentId;
  if (scopeParent) {
    let current = node;
    while (current.parentId && current.parentId !== scopeParent) {
      const parent = index.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    if (current.parentId === scopeParent) {
      cache._cache.set(nodeId, current.id);
      return current.id;
    }
  }

  let current = node;
  while (current.parentId && index.has(current.parentId)) {
    current = index.get(current.parentId)!;
  }
  cache._cache.set(nodeId, current.id);
  return current.id;
}

function normalizeParentIds(
  nodes: ArchitectureNode[],
  visibleIds: Set<string>
): ArchitectureNode[] {
  return nodes.map((node) => {
    if (!node.parentId || visibleIds.has(node.parentId)) return node;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { parentId: _parentId, extent: _extent, expandParent: _expandParent, ...rest } = node;
    return rest as ArchitectureNode;
  });
}

export function buildScopedModel(
  model: ArchitectureDiagramModel,
  scopeId?: string
): ArchitectureDiagramModel {
  // Clear the memoized cache for representativeFor between runs.
  (representativeFor as unknown as { _cache?: Map<string, string | undefined> })._cache = new Map();

  const { byId } = buildIndex(model);

  const expandedIds = new Set<string>();
  if (scopeId) {
    let current = byId.get(scopeId);
    while (current) {
      expandedIds.add(current.id);
      if (!current.parentId) break;
      current = byId.get(current.parentId);
    }
  }

  const visibleIds = new Set<string>();
  const childCounts = new Map<string, number>();

  model.nodes.forEach((node) => {
    const rep = representativeFor(node.id, scopeId, byId);
    if (rep) visibleIds.add(rep);
    if (node.parentId) {
      childCounts.set(node.parentId, (childCounts.get(node.parentId) ?? 0) + 1);
    }
  });

  if (scopeId) visibleIds.add(scopeId);

  const nodes: ArchitectureNode[] = Array.from(visibleIds)
    .map((id) => byId.get(id))
    .filter((node): node is ArchitectureNode => Boolean(node))
    .map((node) => {
      if (node.type === 'container') {
        const expanded = scopeId ? expandedIds.has(node.id) : false;
        const data: ContainerNodeData = {
          ...node.data,
          childCount: childCounts.get(node.id) ?? 0,
          expanded,
          showOpenButton: scopeId ? node.id !== scopeId : true,
        };
        return { ...node, data };
      }
      return { ...node };
    });

  const edgesMap = new Map<
    string,
    {
      edge: ArchitectureEdge;
      count: number;
    }
  >();

  model.edges.forEach((edge) => {
    const source = representativeFor(edge.source, scopeId, byId);
    const target = representativeFor(edge.target, scopeId, byId);
    if (!source || !target || source === target) return;

    const key = `${source}|${target}|${edge.data?.kind ?? ''}`;
    const existing = edgesMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.edge.data!.originalEdgeIds =
        existing.edge.data?.originalEdgeIds?.concat(edge.id) ?? [edge.id];
    } else {
      edgesMap.set(key, {
        edge: {
          ...edge,
          id: `agg:${key}`,
          source,
          target,
          data: { ...edge.data, originalEdgeIds: [edge.id] },
        },
        count: 1,
      });
    }
  });

  const edges: ArchitectureEdge[] = Array.from(edgesMap.values()).map(({ edge, count }) => {
    if (count <= 1) return edge;
    const detail = [edge.data?.detail, `${count} links`].filter(Boolean).join(' · ');
    return {
      ...edge,
      data: { ...edge.data, detail },
    };
  });

  return {
    nodes: normalizeParentIds(nodes, visibleIds),
    edges,
  };
}

export function scopeTrail(model: ArchitectureDiagramModel, scopeId?: string) {
  if (!scopeId) return [];
  const { byId } = buildIndex(model);
  const trail: ArchitectureNode[] = [];
  let current = byId.get(scopeId);

  while (current) {
    trail.unshift(current);
    if (!current.parentId) break;
    current = byId.get(current.parentId);
  }

  return trail;
}
