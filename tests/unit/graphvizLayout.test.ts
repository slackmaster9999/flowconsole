import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  layoutMock: vi.fn(),
  loadWasmMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('graphviz-wasm', () => ({
  __esModule: true,
  default: {
    loadWASM: (...args: unknown[]) => mocks.loadWasmMock(...args),
    layout: (...args: unknown[]) => mocks.layoutMock(...args),
  },
}));

vi.mock('@xyflow/react', () => ({
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
}));

const makeJson = (objects: any[], edges: any[], bb = '0,0,0,0') =>
  JSON.stringify({ objects, edges, bb });

async function getLayoutWithGraphviz() {
  const mod = await import('../../src/core/diagram/graphvizLayoutService');
  return mod.layoutWithGraphviz;
}

describe('graphvizLayout', () => {
  beforeEach(() => {
    mocks.layoutMock.mockReset();
    mocks.loadWasmMock.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('builds DOT with clusters and ignores styled width for empty container', async () => {
    mocks.layoutMock.mockReturnValueOnce(makeJson([], []));
    const layoutWithGraphviz = await getLayoutWithGraphviz();
    const model = {
      nodes: [
        { id: 'empty-container', type: 'container', data: { title: 'Empty' }, position: { x: 0, y: 0 }, style: { width: 400 } },
        { id: 'parent', type: 'container', data: { title: 'Parent "quote"' }, position: { x: 0, y: 0 } },
        { id: 'child', type: 'element', data: { title: 'Child' }, position: { x: 0, y: 0 }, parentId: 'parent' },
      ],
      edges: [{ id: 'e', source: 'child', target: 'child', data: { label: 'edge' } }],
    };
    await layoutWithGraphviz(model as any);
    expect(mocks.loadWasmMock).toHaveBeenCalledTimes(1);
    const dot = mocks.layoutMock.mock.calls[0][0] as string;
    expect(dot).toContain('subgraph cluster_parent');
    expect(dot).toContain('"child";');
    expect(dot).toContain('label="Parent \\"quote\\""');
    // empty container width should fall back to default (~2.708 in)
    expect(dot).toMatch(/"empty-container"\s+\[label="Empty", width=2\.708/);
    // edge label preserved
    expect(dot).toContain('"child" -> "child" [id="e", label="edge"]');
  });

  it('parses layout json and applies anchors/label points', async () => {
    const inch100 = (100 / 96).toFixed(4);
    mocks.layoutMock.mockReturnValueOnce(
      makeJson(
        [
          { name: 'a', pos: '37.5,37.5', width: inch100, height: inch100 },
          { name: 'b', pos: '112.5,37.5', width: inch100, height: inch100 },
        ],
        [
          {
            id: 'edge-1',
            _draw_: [{ op: 'B', points: [[0, 37.5], [37.5, 37.5], [75, 37.5], [112.5, 37.5]] }],
            lp: '75,75',
          },
        ]
      )
    );
    const model = {
      nodes: [
        { id: 'a', type: 'element', data: { title: 'A' }, position: { x: 0, y: 0 } },
        { id: 'b', type: 'element', data: { title: 'B' }, position: { x: 0, y: 0 } },
      ],
      edges: [{ id: 'edge-1', source: 'a', target: 'b', data: {} }],
    };
    const layoutWithGraphviz = await getLayoutWithGraphviz();
    const laidOut = await layoutWithGraphviz(model as any);
    const edge = laidOut.edges[0];
    expect(edge.data?.layoutPoints?.length).toBeGreaterThanOrEqual(4);
    expect(edge.data?.labelPos).toMatchObject({ x: expect.any(Number), y: expect.any(Number) });
    expect(edge.data?.sourceAnchor).toEqual({ position: 'left', offset: 0.5 });
    expect(edge.data?.targetAnchor).toEqual({ position: 'left', offset: 0.5 });
  });

  it('positions child relative to parent cluster', async () => {
    const inch100 = (100 / 96).toFixed(4);
    const inch200 = (200 / 96).toFixed(4);
    mocks.layoutMock.mockReturnValueOnce(
      makeJson(
        [
          { name: 'parent', pos: '112.5,112.5', width: inch200, height: inch200 },
          { name: 'child', pos: '150,150', width: inch100, height: inch100 },
        ],
        []
      )
    );
    const model = {
      nodes: [
        { id: 'parent', type: 'container', data: { title: 'Parent' }, position: { x: 0, y: 0 } },
        { id: 'child', type: 'element', data: { title: 'Child' }, position: { x: 0, y: 0 }, parentId: 'parent' },
      ],
      edges: [],
    };
    const layoutWithGraphviz = await getLayoutWithGraphviz();
    const laidOut = await layoutWithGraphviz(model as any);
    const parent = laidOut.nodes.find((n) => n.id === 'parent')!;
    const child = laidOut.nodes.find((n) => n.id === 'child')!;
    expect(parent.position).toMatchObject({ x: expect.any(Number), y: expect.any(Number) });
    expect(child.position.x).toBeGreaterThan(0);
    expect(child.position.y).toBeGreaterThan(0);
  });

  it('loads wasm only once across calls', async () => {
    mocks.layoutMock.mockReturnValue(makeJson([], []));
    const model = { nodes: [], edges: [] };
    const layoutWithGraphviz = await getLayoutWithGraphviz();
    await layoutWithGraphviz(model as any);
    await layoutWithGraphviz(model as any);
    expect(mocks.loadWasmMock).toHaveBeenCalledTimes(1);
    expect(mocks.layoutMock).toHaveBeenCalledTimes(2);
  });
});
