import { describe, it, expect } from 'vitest';
import { ArchitectureDiagramModel } from '../../src/web/diagram/types';
import { buildScopedModel, scopeTrail } from '../../src/web/diagram/utils/scopedModel';

const baseModel: ArchitectureDiagramModel = {
  nodes: [
    {
      id: 'root',
      type: 'container',
      data: { title: 'Root', expanded: true },
      position: { x: 0, y: 0 },
    },
    {
      id: 'module',
      type: 'container',
      parentId: 'root',
      data: { title: 'Module', expanded: true },
      position: { x: 0, y: 0 },
    },
    {
      id: 'service-a',
      type: 'element',
      parentId: 'module',
      data: { title: 'Service A' },
      position: { x: 0, y: 0 },
    },
    {
      id: 'service-b',
      type: 'element',
      parentId: 'module',
      data: { title: 'Service B' },
      position: { x: 0, y: 0 },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      type: 'relationship',
      source: 'service-a',
      target: 'service-b',
      data: { label: 'calls' },
    },
    {
      id: 'edge-2',
      type: 'relationship',
      source: 'service-a',
      target: 'service-b',
      data: { label: 'calls' },
    },
  ],
};

describe('buildScopedModel', () => {
it('annotates child counts in the root view', () => {
  const scoped = buildScopedModel(baseModel);
  const rootNode = scoped.nodes.find((node) => node.id === 'root');
  expect(rootNode?.type).toBe('container');
  if (rootNode?.type === 'container') {
    expect(rootNode.data.childCount).toBe(1);
  }
});

it('aggregates duplicate edges within the scoped view', () => {
  const scoped = buildScopedModel(baseModel, 'module');
  expect(scoped.edges).toHaveLength(1);
  expect(scoped.edges[0]?.data?.detail).toContain('2 links');
});

  it('keeps scope trail information for nested scopes', () => {
    const scoped = buildScopedModel(baseModel, 'module');
    expect(scoped.nodes.some((node) => node.id === 'module')).toBe(true);
    const trail = scopeTrail(baseModel, 'module');
    expect(trail.map((node) => node.id)).toEqual(['root', 'module']);
  });
});
