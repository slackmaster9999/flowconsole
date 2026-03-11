import { describe, it, expect, vi } from 'vitest';
import { DiagramRuntime } from '../../src/web/languages/typescript/diagramRuntime';

function createEntity(runtime: DiagramRuntime, type: Parameters<DiagramRuntime['createEntityInvoker']>[0], value: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return runtime.createEntityInvoker(type, value) as any;
}

describe('DiagramRuntime', () => {
  it('registers entities, parents, and relationships', () => {
    const runtime = new DiagramRuntime();
    const system = createEntity(runtime, 'ComputerSystem', { name: 'Core Platform' }) as Record<string, unknown>;
    const backend = createEntity(runtime, 'Container', { name: 'Services', system }) as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const duplicateBackend = createEntity(runtime, 'Container', { name: 'Services', system });
    const api = createEntity(runtime, 'RestApi', { name: 'Accounts API', belongsTo: backend });
    const user = createEntity(runtime, 'User', { name: 'Customer' });

    user.sendsRequestTo?.(api, 'login');
    api.getDataFrom?.(backend, 'query');

    const snapshot = runtime.snapshot();
    expect(snapshot.entities).toHaveLength(5);
    const containerRecords = snapshot.entities.filter((entity) => entity.name === 'Services');
    expect(containerRecords.map((record) => record.id)).toContain('services-2');
    const apiRecord = snapshot.entities.find((entity) => entity.name === 'Accounts API');
    const systemRecord = snapshot.entities.find((entity) => entity.name === 'Core Platform');
    expect(apiRecord?.parentId).toBe(containerRecords[0]?.id);
    expect(systemRecord?.id).toBeDefined();

    expect(snapshot.relationships).toHaveLength(2);
    const firstConnection = snapshot.relationships[0];
    expect(firstConnection.label).toBe('login');
  });

  it('supports chained flows with executesRequest and parallel branches', () => {
    const runtime = new DiagramRuntime();
    const system = createEntity(runtime, 'ComputerSystem', { name: 'Workflow' }) as Record<string, unknown>;
    const worker = createEntity(runtime, 'BackgroundJob', { name: 'Worker', belongsTo: system });
    const queue = createEntity(runtime, 'MessageQueue', { name: 'Queue', belongsTo: system });

    worker
      .sendsRequestTo?.(queue, 'enqueue', { kind: 'event' })
      ?.executesRequest?.('process')
      ?.inParallel?.(
        () => worker.getDataFrom?.(queue, 'poll'),
        () => worker.sendsRequestTo?.(queue, 'ack')
      );

    const snapshot = runtime.snapshot();
    expect(snapshot.relationships.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.relationships[0]?.kind).toBe('event');
  });

  it('validates entities and preserves explicit ids/tags', () => {
    const runtime = new DiagramRuntime();
    const entity = runtime.createEntityInvoker('User', {
      id: 'custom-id',
      name: '  Alice ',
      tags: ['a', 1, 'b'],
    }) as Record<string, unknown>;
    const snapshot = runtime.snapshot();
    expect(snapshot.entities[0]?.id).toBe('custom-id');
    expect(snapshot.entities[0]?.tags).toEqual(['a', 'b']);
    expect(entity).toHaveProperty('sendsRequestTo');
  });

  it('throws when entity value is not an object', () => {
    const runtime = new DiagramRuntime();
    expect(() => runtime.createEntityInvoker('User', null as unknown as Record<string, unknown>)).toThrow();
  });

  it('returns empty id when adding connection without meta', () => {
    const runtime = new DiagramRuntime();
    // @ts-expect-error testing invalid handle
    const id = runtime.addConnection({}, {}, 'login', 'sync');
    expect(id).toBe('');
    expect(runtime.snapshot().relationships).toHaveLength(0);
  });

  it('keeps flow name from first hint and ignores later updates', () => {
    const runtime = new DiagramRuntime();
    runtime.addFlowStep('flow-1', { edgeId: 'e1', sourceId: 'a', targetId: 'b', label: 'first' });
    runtime.addFlowStep('flow-1', { edgeId: 'e2', sourceId: 'a', targetId: 'b', label: 'second' });
    const flow = runtime.snapshot().flows.find((f) => f.id === 'flow-1');
    expect(flow?.name).toBe('first');
    expect(flow?.steps).toHaveLength(2);
  });

  it('handles errors inside parallel branches without breaking flow', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runtime = new DiagramRuntime();
    const worker = createEntity(runtime, 'BackgroundJob', { name: 'Worker' });
    worker
      .executesRequest?.('start')
      ?.inParallel?.(
        () => {
          throw new Error('boom');
        },
        () => worker.executesRequest?.('noop')
      );
    expect(warn).toHaveBeenCalled();
    expect(runtime.snapshot().flows.length).toBeGreaterThanOrEqual(1);
    warn.mockRestore();
  });
});
