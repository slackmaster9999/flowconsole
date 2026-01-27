import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { getBezierPath, Position, useInternalNode, useReactFlow } from '@xyflow/react';
import { RelationshipEdge } from '../../src/web/reactflow/edges/RelationshipEdge';

vi.mock('@xyflow/react', () => {
  const reactFlowInstance = {
    setEdges: vi.fn(),
    screenToFlowPosition: vi.fn(),
  };

  const getBezierPath = vi.fn(() => ['bezier-path', 10, 20]);
  const useInternalNode = vi.fn();
  const useReactFlow = vi.fn(() => reactFlowInstance);

  const Position = {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  } as const;

  const BaseEdge = ({
    id,
    path,
    markerEnd,
    markerStart,
    style,
    className,
    onContextMenu,
  }: any) => (
    <path
      data-testid="base-edge"
      data-id={id}
      data-style={JSON.stringify(style ?? {})}
      data-marker-end={markerEnd}
      data-marker-start={markerStart}
      className={className}
      d={path}
      onContextMenu={onContextMenu}
    />
  );

  const EdgeLabelRenderer = ({ children }: any) => <>{children}</>;

  return {
    __esModule: true,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    Position,
    useInternalNode,
    useReactFlow,
  };
});

vi.mock('d3-shape', () => {
  const line = () => {
    const api: any = () => 'smooth-path';
    api.curve = () => api;
    api.x = () => api;
    api.y = () => api;
    return api;
  };
  return {
    __esModule: true,
    curveCatmullRomOpen: { alpha: () => ({}) },
    line,
  };
});

type EdgeData = NonNullable<Parameters<typeof RelationshipEdge>[0]['data']>;

describe('RelationshipEdge', () => {
  const baseProps = {
    id: 'edge-1',
    source: 's',
    target: 't',
    sourceX: 0,
    sourceY: 0,
    targetX: 50,
    targetY: 0,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    selected: false,
  };

  let nodes: Record<string, any>;
  const useInternalNodeMock = vi.mocked(useInternalNode);
  const getBezierPathMock = vi.mocked(getBezierPath);
  const reactFlow = useReactFlow() as any;

  beforeEach(() => {
    nodes = {};
    vi.clearAllMocks();
    useInternalNodeMock.mockImplementation((id: string) => nodes[id]);
    reactFlow.setEdges.mockImplementation((updater: any) => {
      if (typeof updater === 'function') {
        reactFlow.lastEdges = updater([{ id: 'edge-ctx', data: {} }]);
      }
    });
    reactFlow.screenToFlowPosition.mockImplementation(({ x, y }: { x: number; y: number }) => ({ x, y }));
    getBezierPathMock.mockReturnValue(['bezier-path', 10, 20]);
  });

  const renderEdge = (data: EdgeData = {}, extra: Partial<typeof baseProps> = {}) =>
    render(<RelationshipEdge {...baseProps} data={data} {...extra} />);

  const parseStyle = (el: HTMLElement) => JSON.parse(el.getAttribute('data-style') ?? '{}');

  it('renders directional edge with label and icon', () => {
    renderEdge({ label: 'Main', detail: 'Detail', icon: '★', kind: 'sync' });
    const baseEdge = screen.getByTestId('base-edge');
    const style = parseStyle(baseEdge);
    expect(baseEdge.getAttribute('data-marker-end')).toBe('url(#edge-1-end)');
    expect(baseEdge.getAttribute('data-marker-start')).toBeNull();
    expect(baseEdge.getAttribute('class')).toContain('relationship-path--directional');
    expect(style.strokeWidth).toBe(2.4);
    expect(style.stroke).toBe('var(--diagram-primary)');
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('applies bidirectional markers and animation when hovered', () => {
    renderEdge({ direction: 'both', hovered: true, kind: 'async' });
    const baseEdge = screen.getByTestId('base-edge');
    const style = parseStyle(baseEdge);
    expect(baseEdge.getAttribute('data-marker-start')).toBe('url(#edge-1-start)');
    expect(baseEdge.getAttribute('data-marker-end')).toBe('url(#edge-1-end)');
    expect(style.strokeDasharray).toBe('8 10');
    expect(style.animationDirection).toBe('alternate');
    expect(baseEdge.getAttribute('class')).toContain('relationship-path--animated');
    expect(style.stroke).toBe('var(--diagram-success)');
  });

  it('omits markers and animation when direction is none', () => {
    renderEdge({ direction: 'none', hovered: true });
    const baseEdge = screen.getByTestId('base-edge');
    const style = parseStyle(baseEdge);
    expect(baseEdge.getAttribute('data-marker-start')).toBeNull();
    expect(baseEdge.getAttribute('data-marker-end')).toBeNull();
    expect(style.strokeDasharray).toBeUndefined();
    expect(baseEdge.getAttribute('class')).not.toContain('relationship-path--animated');
    expect(baseEdge.getAttribute('class')).not.toContain('relationship-path--directional');
  });

  it('uses anchor points from nodes when provided', () => {
    nodes = {
      [baseProps.source]: {
        measured: { width: 100, height: 50 },
        internals: { positionAbsolute: { x: 10, y: 20 } },
      },
      [baseProps.target]: {
        measured: { width: 60, height: 40 },
        internals: { positionAbsolute: { x: 200, y: 100 } },
      },
    };
    renderEdge({
      sourceAnchor: { position: Position.Right, offset: 1 },
      targetAnchor: { position: Position.Left, offset: 0.25 },
    });
    expect(getBezierPathMock).toHaveBeenCalled();
    const call = getBezierPathMock.mock.calls[0][0];
    expect(call.sourceX).toBe(110); // 10 + 100
    expect(call.sourceY).toBe(70); // 20 + 1 * 50
    expect(call.targetX).toBe(200); // left anchor at x
    expect(call.targetY).toBe(110); // 100 + 0.25 * 40
  });

  it('prefers graphviz layout path when provided', () => {
    renderEdge({
      label: 'Graphviz',
      layoutPoints: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
      labelPos: { x: 5, y: 5 },
    });
    const baseEdge = screen.getByTestId('base-edge');
    expect(baseEdge.getAttribute('d')).toBe('M 0,0 C 40,-20 40,-10 50,0');
    const label = screen.getByText('Graphviz').parentElement as HTMLElement;
    expect(label.style.transform).toContain('translate(5px, 23px)');
  });

  it('prefers manual control points over graphviz path', () => {
    renderEdge({
      controlPoints: [{ x: 10, y: 10 }],
      layoutPoints: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
    });
    const baseEdge = screen.getByTestId('base-edge');
    expect(baseEdge.getAttribute('d')).toBe('smooth-path');
  });

  it('shows control points on hover when data has controlPoints', () => {
    const { container } = renderEdge({ controlPoints: [{ x: 10, y: 10 }] });
    expect(container.querySelector('.relationship-control-point')).toBeNull();
    fireEvent.mouseEnter(container.querySelector('.relationship-path-interaction') as Element);
    expect(container.querySelector('.relationship-control-point')).not.toBeNull();
  });

  it('adds control point via context menu', () => {
    const props = { ...baseProps, id: 'edge-ctx' };
    render(
      <RelationshipEdge
        {...props}
        data={{
          controlPoints: [],
        }}
      />
    );
    fireEvent.contextMenu(screen.getByTestId('base-edge'));
    expect(reactFlow.setEdges).toHaveBeenCalled();
    const updated = reactFlow.lastEdges?.[0]?.data?.controlPoints;
    expect(updated).toBeDefined();
    expect(updated).toHaveLength(1);
  });

  it('removes control point on right-click of handler', () => {
    const props = { ...baseProps, id: 'edge-ctx' };
    const { container } = render(
      <RelationshipEdge
        {...props}
        selected
        data={{
          controlPoints: [{ x: 5, y: 5 }],
        }}
      />
    );
    const controlPoint = container.querySelector('.relationship-control-point') as HTMLElement;
    fireEvent.pointerDown(controlPoint, { button: 2 });
    const updated = reactFlow.lastEdges?.[0]?.data?.controlPoints;
    expect(updated).toEqual([]);
  });
});
