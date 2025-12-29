import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { ArchitectureDiagram } from '../../src/core/components/ArchitectureDiagram';
import { ArchitectureDiagramModel } from '../../src/core/diagram/types';

let nodesState: any[] = [];
let edgesState: any[] = [];
let navProps: any = null;
const setCenter = vi.fn();
const fitView = vi.fn();

vi.mock('@xyflow/react', () => {
  const useNodesState = (initial: any[] = []) => {
    const [nodes, setNodes] = React.useState(initial);
    React.useEffect(() => {
      nodesState = nodes;
    }, [nodes]);
    return [nodes, setNodes, vi.fn()];
  };
  const useEdgesState = (initial: any[] = []) => {
    const [edges, setEdges] = React.useState(initial);
    React.useEffect(() => {
      edgesState = edges;
    }, [edges]);
    return [edges, setEdges, vi.fn()];
  };

  return {
    __esModule: true,
    ReactFlow: ({ children }: { children: React.ReactNode }) => <div data-testid="reactflow">{children}</div>,
    Background: () => null,
    BackgroundVariant: { Dots: 'dots' },
    MiniMap: () => null,
    Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    applyNodeChanges: (changes: any, nds: any[]) => nds,
    useNodesState,
    useEdgesState,
    useReactFlow: () => ({ fitView, setCenter }),
    Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
  };
});

vi.mock('../../src/core/diagram/graphvizLayoutService', () => ({
  layoutWithGraphviz: vi.fn(async (model) => model),
}));

vi.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({ resolvedScheme: 'light' }),
}));

vi.mock('../../src/core/diagram/utils/scopedModel', () => ({
  buildScopedModel: (model: ArchitectureDiagramModel) => model,
  scopeTrail: (model: ArchitectureDiagramModel, scopeId: string | undefined) =>
    scopeId ? [{ id: scopeId, data: { title: 'Child' } }] : [],
}));

vi.mock('../../src/core/diagram/reactflow/edges/FloatingConnectionLine', () => ({
  FloatingConnectionLine: () => null,
}));

vi.mock('../../src/core/components/NavigationPanel', () => ({
  __esModule: true,
  default: (props: any) => {
    navProps = props;
    return <div data-testid="nav-panel" />;
  },
}));

describe('ArchitectureDiagram', () => {
  const model = {
    nodes: [
      {
        id: 'parent',
        type: 'container',
        data: { title: 'Parent' },
        position: { x: 0, y: 0 },
      },
      {
        id: 'child',
        type: 'element',
        data: { title: 'Child' },
        position: { x: 0, y: 0 },
        parentId: 'parent',
      },
    ],
    edges: [
      { id: 'e1', source: 'child', target: 'child', data: {} },
    ],
    flows: [
      { id: 'flow-1', name: 'Flow', steps: [{ id: 'step-1', edgeId: 'e1', sourceId: 'child', targetId: 'child', label: 'act' }] },
    ],
  };

  let originalRaf: typeof globalThis.requestAnimationFrame;
  let originalCancel: typeof globalThis.cancelAnimationFrame;

  beforeEach(() => {
    nodesState = [];
    edgesState = [];
    navProps = null;
    fitView.mockClear();
    setCenter.mockClear();
    originalRaf = globalThis.requestAnimationFrame;
    originalCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof globalThis.requestAnimationFrame;
    globalThis.cancelAnimationFrame = () => undefined as unknown as void;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancel;
  });

  it('applies parent sizing and child extent when autoLayout is false', async () => {
    render(<ArchitectureDiagram model={model} autoLayout={false} />);
    await act(async () => Promise.resolve());
    const parent = nodesState.find((n) => n.id === 'parent');
    const child = nodesState.find((n) => n.id === 'child');
    expect(child.extent).toBe('parent');
    expect(child.expandParent).toBe(true);
    expect(parent.style.width).toBeGreaterThan(200);
    expect(parent.style.height).toBeGreaterThan(160);
  });

  it('uses graphviz layout when autoLayout is true', async () => {
    const { layoutWithGraphviz } = await import('../../src/core/diagram/graphvizLayoutService');
    (layoutWithGraphviz as any).mockResolvedValue({
      nodes: [{ id: 'x', data: { title: 'X' }, position: { x: 1, y: 1 } }],
      edges: [{ id: 'e2', source: 'x', target: 'x', data: {} }],
      flows: [],
    });
    render(<ArchitectureDiagram model={{ nodes: [], edges: [], flows: [] }} autoLayout />);
    await act(async () => Promise.resolve());
    expect(nodesState.some((n) => n.id === 'x')).toBe(true);
    expect(edgesState.some((e) => e.id === 'e2')).toBe(true);
  });

  it('highlights edges when flow is selected', async () => {
    render(<ArchitectureDiagram model={model} autoLayout={false} />);
    await act(async () => Promise.resolve());
    navProps.onSelectFlow('flow-1');
    await act(async () => Promise.resolve());
    const edge = edgesState.find((e) => e.id === 'e1');
    expect(edge.data.flowHighlighted).toBe(true);
  });

  it('marks current flow step and updates node roles', async () => {
    render(<ArchitectureDiagram model={model} autoLayout={false} />);
    await act(async () => Promise.resolve());
    await act(async () => {
      navProps.onToggleFlowPanel();
    });
    await act(async () => {
      navProps.onSelectFlow('flow-1');
      navProps.onFlowStepChange(0);
    });
    await act(async () => Promise.resolve());
    const edge = edgesState.find((e) => e.id === 'e1');
    expect(edge.data.flowCurrent).toBe(true);
    const childNode = nodesState.find((n) => n.id === 'child');
    expect(childNode.data.flowHighlighted).toBe(true);
    expect(childNode.data.flowCurrent).toBe('source');
  });

  it('fits view when root focus is requested', async () => {
    render(<ArchitectureDiagram model={model}  autoLayout={false} />);
    await act(async () => Promise.resolve());
    expect(fitView).toHaveBeenCalled();
    expect(setCenter).not.toHaveBeenCalled();
  });
});
