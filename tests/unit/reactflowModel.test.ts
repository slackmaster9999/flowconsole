import { describe, it, expect } from 'vitest';
import { DiagramIntermediateModel } from '../../src/web/languages/typescript/diagramRuntime';
import { buildReactFlowModel } from '../../src/web/languages/typescript/modelToReactflowMapper';

describe('buildReactFlowModel', () => {
  it('converts intermediate entities into nodes and edges', () => {
    const intermediate: DiagramIntermediateModel = {
      entities: [
        {
          id: 'sys',
          type: 'ComputerSystem',
          name: 'System',
          description: 'Root domain',
          parentId: undefined,
          tags: undefined,
          badge: undefined,
          tone: undefined,
          metadata: {},
        },
        {
          id: 'api',
          type: 'RestApi',
          name: 'Accounts',
          description: 'handles balances',
          parentId: 'sys',
          tags: ['rest'],
          badge: 'beta',
          tone: undefined,
          metadata: { framework: 'Express' },
        },
        {
          id: 'user',
          type: 'User',
          name: 'Customer',
          description: 'Reads data',
          parentId: undefined,
          tags: undefined,
          badge: undefined,
          tone: undefined,
          metadata: {},
        },
      ],
      relationships: [
        {
          id: 'rel-1',
          sourceId: 'user',
          targetId: 'api',
          label: 'call',
          detail: 'fetch',
          kind: 'sync',
          icon: undefined,
          muted: false,
        },
      ],
      flows: []
    };

    const model = buildReactFlowModel(intermediate);
    expect(model.nodes).toHaveLength(3);
    const containerNode = model.nodes.find((node) => node.id === 'sys');
    expect(containerNode?.type).toBe('container');
    const apiNode = model.nodes.find((node) => node.id === 'api');
    expect(apiNode?.type).toBe('element');
    expect(apiNode?.data.subtitle).toBe('Express');

    expect(model.edges).toHaveLength(1);
    expect(model.edges[0]?.data?.label).toBe('call');
  });
});
