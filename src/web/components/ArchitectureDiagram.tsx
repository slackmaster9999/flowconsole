import { useEffect, useCallback, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  applyNodeChanges,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type NodeChange,
  MiniMap,
  Panel,
} from '@xyflow/react';
import type {
  ArchitectureDiagramModel,
  ArchitectureEdgeTypes,
  ArchitectureNode,
  ArchitectureNodeTypes,
  ArchitectureEdge,
  FlowDefinition,
} from '../diagram/types';
import './styles.css';
import { FloatingConnectionLine } from '../reactflow/edges/FloatingConnectionLine';
import { buildScopedModel, scopeTrail } from '../diagram/utils/scopedModel';
import { layoutWithGraphviz } from '../diagram/graphvizLayoutService';
import NavigationPanel from './NavigationPanel';
import type { ThemeControls } from '../types/theme';

type ArchitectureDiagramProps = {
  model: ArchitectureDiagramModel;
  nodeTypes?: ArchitectureNodeTypes;
  edgeTypes?: ArchitectureEdgeTypes;
  editable?: boolean;
  autoLayout?: boolean;
  viewId?: string;
  viewTitle?: string;
  viewDescription?: string;
  resolvedScheme?: 'light' | 'dark';
  themeControls?: ThemeControls;
};

const PADDING = 32;

function withParentAutoResize(nodes: ArchitectureDiagramModel['nodes']) {
  return nodes.map((node) =>
    node.parentId
      ? {
          ...node,
          extent: node.extent ?? 'parent',
          expandParent: node.expandParent ?? true,
        }
      : node
  );
}

function sizeOf(node: ArchitectureDiagramModel['nodes'][number]) {
  const w =
    node.width ??
    (typeof node.style?.width === 'number' ? node.style.width : undefined) ??
    node.initialWidth ??
    140;
  const h =
    node.height ??
    (typeof node.style?.height === 'number' ? node.style.height : undefined) ??
    node.initialHeight ??
    100;
  return { width: w, height: h };
}

function autoResizeParents(nodes: ArchitectureDiagramModel['nodes']) {
  const next = nodes.map((n) => ({ ...n }));

  const byParent = new Map<string, ArchitectureDiagramModel['nodes']>();
  next.forEach((node) => {
    if (!node.parentId) return;
    const list = byParent.get(node.parentId) ?? [];
    list.push(node);
    byParent.set(node.parentId, list);
  });

  next.forEach((node, idx) => {
    if (!byParent.has(node.id)) return;
    const children = byParent.get(node.id)!;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    children.forEach((child) => {
      const { width, height } = sizeOf(child);
      minX = Math.min(minX, child.position.x);
      minY = Math.min(minY, child.position.y);
      maxX = Math.max(maxX, child.position.x + width);
      maxY = Math.max(maxY, child.position.y + height);
    });

    const { width: baseW, height: baseH } = sizeOf(node);
    const newWidth = Math.max(baseW, maxX - minX + PADDING * 2);
    const newHeight = Math.max(baseH, maxY - minY + PADDING * 2);

    next[idx] = {
      ...node,
      style: { ...node.style, width: newWidth, height: newHeight },
    };
  });

  return next;
}

export function ArchitectureDiagram({
  model,
  nodeTypes = {},
  edgeTypes = {},
  editable = true,
  autoLayout = true,
  viewId,
  viewTitle,
  viewDescription,
  themeControls,
}: ArchitectureDiagramProps) {
  const effectiveScheme = themeControls?.resolvedScheme;
  const [scopeId, setScopeId] = useState<string | undefined>();
  const modelToRender = useMemo(() => buildScopedModel(model, scopeId), [model, scopeId]);
  const [nodes, setNodes] = useNodesState<ArchitectureNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ArchitectureEdge>([]);
  const trail = useMemo(() => scopeTrail(model, scopeId), [model, scopeId]);
  const ROOT_FOCUS_ID = '__root__';
  const [pendingFocus, setPendingFocus] = useState<string | string[] | undefined>(ROOT_FOCUS_ID);
  const flows = model.flows ?? [];
  const [isFlowPanelVisible, setFlowPanelVisible] = useState(false);
  const defaultFlow = useMemo(
    () => ({ id: '__all__', name: 'All flows', steps: [] as FlowDefinition['steps'] }),
    []
  );
  const flowOptions = useMemo(() => [defaultFlow, ...flows], [defaultFlow, flows]);
  const [activeFlowId, setActiveFlowId] = useState<string | undefined>(defaultFlow.id);
  const [activeFlowStep, setActiveFlowStep] = useState(-1);
  const [flowAnimationTick, setFlowAnimationTick] = useState(0);
  const nodeTitles = useMemo(() => {
    const map = new Map<string, string>();
    model.nodes.forEach((n) => map.set(n.id, n.data.title));
    return map;
  }, [model.nodes]);
  const nodeIndex = useMemo(() => {
    const map = new Map<string, ArchitectureNode>();
    model.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [model.nodes]);
  const visibleNodeMap = useMemo(() => {
    const map = new Map<string, ArchitectureNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  useEffect(() => {
    setScopeId(undefined);
  }, [model]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (!detail?.id) return;
      setScopeId(detail.id);
    };
    window.addEventListener('container:open', handler as EventListener);
    return () => {
      window.removeEventListener('container:open', handler as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const update = async () => {
      const baseModel = autoLayout ? await layoutWithGraphviz(modelToRender) : modelToRender;
      if (cancelled) return;
      setNodes(autoResizeParents(withParentAutoResize(baseModel.nodes)));
      setEdges(baseModel.edges);
    };

    void update();
    
    return () => {
      cancelled = true;
    };
  }, [modelToRender, autoLayout, setNodes, setEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange<ArchitectureNode>[]) => {
      setNodes((nds) =>
        autoResizeParents(
          withParentAutoResize(applyNodeChanges<ArchitectureNode>(changes, nds))
        )
      );
    },
    [setNodes]
  );

  useEffect(() => {
    setEdges(modelToRender.edges);
  }, [modelToRender.edges, setEdges]);

  useEffect(() => {
    setPendingFocus(scopeId ?? ROOT_FOCUS_ID);
    setFlowAnimationTick((tick) => tick + 1);
  }, [scopeId]);

  useEffect(() => {
    if (!activeFlowId && flows.length) {
      setActiveFlowId(flows[0]?.id);
    }
  }, [activeFlowId, flows]);

  useEffect(() => {
    const flow = flows.find((f) => f.id === activeFlowId);
    if (!isFlowPanelVisible) {
      if (activeFlowStep !== -1) {
        setActiveFlowStep(-1);
      }
      return;
    }
    if (!flow) {
      if (activeFlowStep !== 0) {
        setActiveFlowStep(0);
      }
      return;
    }
    const bounded = Math.min(Math.max(activeFlowStep, 0), Math.max(flow.steps.length - 1, 0));
    if (bounded !== activeFlowStep) {
      setActiveFlowStep(bounded);
    }
  }, [activeFlowId, flows, activeFlowStep, isFlowPanelVisible]);

  useEffect(() => {
    // On close: reset active step and fit the view to show the whole diagram.
    if (!isFlowPanelVisible) {
      setPendingFocus(ROOT_FOCUS_ID);
    }
  }, [isFlowPanelVisible]);


  useEffect(() => {
    const flow = flows.find((f) => f.id === activeFlowId);
    const currentStep = flow?.steps[activeFlowStep];
    setEdges((eds) => {
      let changed = false;
      const next = eds.map((edge) => {
        const originalIds = edge.data?.originalEdgeIds ?? [edge.id];
        const inFlow = flow?.steps.some((s) => originalIds.includes(s.edgeId)) ?? false;
        const isCurrent = currentStep ? originalIds.includes(currentStep.edgeId) : false;
        const flowTick = isCurrent ? flowAnimationTick : edge.data?.flowTick;
        const nextData = {
          ...(edge.data ?? {}),
          flowHighlighted: inFlow || undefined,
          flowCurrent: isCurrent || undefined,
          flowTick,
        };
        if (
          edge.data?.flowHighlighted === nextData.flowHighlighted &&
          edge.data?.flowCurrent === nextData.flowCurrent
        ) {
          return edge;
        }
        changed = true;
        return { ...edge, data: nextData };
      });
      return changed ? next : eds;
    });
  }, [activeFlowId, activeFlowStep, flows, setEdges, scopeId, flowAnimationTick]);

  useEffect(() => {
    const flow = flows.find((f) => f.id === activeFlowId);
    const currentStep = flow?.steps[activeFlowStep];
    const involved = new Set<string>();
    flow?.steps.forEach((s) => {
      involved.add(s.sourceId);
      involved.add(s.targetId);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setNodes((nds: any) => {
      let changed = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const next = nds.map((node: any) => {
        const highlighted = involved.has(node.id);
        const currentRole =
          currentStep?.sourceId === node.id
            ? 'source'
            : currentStep?.targetId === node.id
              ? 'target'
              : undefined;
        const nextData = {
          ...node.data,
          flowHighlighted: highlighted || undefined,
          flowCurrent: currentRole,
        } as typeof node.data;
        if (
          node.data.flowHighlighted === nextData.flowHighlighted &&
          node.data.flowCurrent === nextData.flowCurrent
        ) {
          return node;
        }
        changed = true;
        return { ...node, data: nextData };
      });
      return changed ? next : nds;
    });
  }, [activeFlowId, activeFlowStep, flows, setNodes, scopeId]);

  useEffect(() => {
    const flow = flows.find((f) => f.id === activeFlowId);
    const currentStep = flow?.steps[activeFlowStep];
    if (currentStep) {
      const resolveVisible = (id: string | undefined) => {
        if (!id) return undefined;
        let currentId: string | undefined = id;
        while (currentId) {
          if (visibleNodeMap.has(currentId)) return currentId;
          currentId = nodeIndex.get(currentId)?.parentId;
        }
        return undefined;
      };
      const targets = [resolveVisible(currentStep.sourceId), resolveVisible(currentStep.targetId)].filter(
        Boolean
      ) as string[];
      setPendingFocus((prev) => {
        if (Array.isArray(prev) && prev.length === targets.length && prev.every((id, idx) => id === targets[idx])) {
          return prev;
        }
        if (!Array.isArray(prev) && prev === targets[0] && targets.length === 1) return prev;
        if (targets.length === 0) return prev;
        return targets;
      });
    }
  }, [activeFlowId, activeFlowStep, flows, nodeIndex, visibleNodeMap]);


  const findClosestContainer = useCallback(
    (nodeId: string) => {
      let current = nodeIndex.get(nodeId);
      while (current?.parentId) {
        const parent = nodeIndex.get(current.parentId);
        if (!parent) break;
        if (parent.type === 'container') return parent.id;
        current = parent;
      }
      return undefined;
    },
    [nodeIndex]
  );

  const handleNavigate = useCallback(
    (nodeId: string) => {
      const target = nodeIndex.get(nodeId);
      if (!target) return;
      const targetScope =
        target.type === 'container' ? target.id : findClosestContainer(nodeId);
      if (targetScope !== scopeId) {
        setScopeId(targetScope);
      }
      setPendingFocus(nodeId);
    },
    [findClosestContainer, nodeIndex, scopeId]
  );

  const parentScopeId = trail.length > 1 ? trail[trail.length - 2].id : undefined;
  const minimapTheme = useMemo(
    () =>
      effectiveScheme === 'light'
        ? {
            background: '#f6f8fb',
            node: '#cbd5e1',
            stroke: '#0f172a',
            mask: 'rgba(15,23,42,0.08)',
          }
        : {
            background: '#0b0f1a',
            node: '#1f2a3d',
            stroke: '#f8fafc',
            mask: 'rgba(255,255,255,0.08)',
          },
    [effectiveScheme]
  );

  return (
    <ReactFlow
      className={`architecture-diagram theme-${effectiveScheme}`}
      fitView
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        elevateNodesOnSelect={false}
      selectNodesOnDrag={editable}
      nodesDraggable={editable}
      nodesConnectable={editable}
      elementsSelectable={editable}
      edgesReconnectable={editable}
      panOnDrag={editable}
      minZoom={0.1}
      maxZoom={2}
      connectionLineComponent={FloatingConnectionLine}
      panActivationKeyCode={'Shift'}
    >
      <MiniMap
        pannable
        zoomable
        style={{ background: minimapTheme.background, border: '1px solid var(--diagram-border)' }}
        nodeColor={() => minimapTheme.node}
        nodeStrokeColor={() => minimapTheme.stroke}
        maskColor={minimapTheme.mask}
      />
      <NavigationPanel
        model={model}
        viewId={viewId}
        viewTitle={viewTitle}
        viewDescription={viewDescription}
        flows={flows}
        activeFlowId={activeFlowId}
        activeFlowStep={activeFlowStep}
        nodeTitles={nodeTitles}
        onSelectFlow={(id) => {
          setActiveFlowId(id);
          setActiveFlowStep(-1);
        }}
        onFlowStepChange={(step) => setActiveFlowStep(step)}
        onNavigate={handleNavigate}
        onToggleFlowPanel={() => setFlowPanelVisible((v) => !v)}
        themeControls={themeControls}
      />
      {flows.length && isFlowPanelVisible ? (
        <Panel position="top-left" style={{ marginTop: 42 }}>
          <div className="flow-panel">
            <div className="flow-panel__row" style={{ justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 12 }}>Flow</strong>
              <select
                value={activeFlowId ?? ''}
                onChange={(e) => {
                  const nextId = e.target.value || undefined;
                  setActiveFlowId(nextId);
                  setActiveFlowStep(-1);
                }}
              >
                {flowOptions.map((f, idx) => (
                  <option key={f.id} value={f.id}>
                    {f.name || `Flow ${idx}`}
                  </option>
                ))}
              </select>
            </div>
            {(() => {
              const flow = flows.find((f) => f.id === activeFlowId);
              const steps = flow?.steps ?? [];
              const current =
                activeFlowStep >= 0 && steps.length
                  ? steps[Math.min(activeFlowStep, Math.max(steps.length - 1, 0))]
                  : undefined;
              return flow && current ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="flow-panel__row" style={{ justifyContent: 'space-between' }}>
                    <button
                      onClick={() => setActiveFlowStep((s) => Math.max(s - 1, 0))}
                      disabled={activeFlowStep <= 0}
                    >
                      Prev
                    </button>
                    <span style={{ fontSize: 12 }}>
                      Step {activeFlowStep + 1}/{steps.length}
                    </span>
                    <button
                      onClick={() =>
                        setActiveFlowStep((s) => {
                          const next = s < 0 ? 0 : s + 1;
                          return Math.min(next, Math.max(steps.length - 1, 0));
                        })
                      }
                      disabled={activeFlowStep >= steps.length - 1}
                    >
                      Next
                    </button>
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <div>
                      <strong>Source:</strong> {nodeTitles.get(current.sourceId) ?? current.sourceId}
                    </div>
                    <div>
                      <strong>Target:</strong> {nodeTitles.get(current.targetId) ?? current.targetId}
                    </div>
                    {current.label ? (
                      <div>
                        <strong>Action:</strong> {current.label}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--diagram-text-muted)' }}>
                  No steps in this flow
                </div>
              );
            })()}
          </div>
        </Panel>
      ) : null}
      <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
      {scopeId ? (
        <Panel position="top-right">
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              background: 'var(--diagram-surface)',
              color: 'var(--diagram-text)',
              borderRadius: 12,
              padding: '8px 12px',
              boxShadow: 'var(--diagram-card-shadow)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 12, opacity: 0.9 }}>
              View: {trail.map((p) => p.data.title).join(' / ')}
            </span>
            {parentScopeId ? (
              <button
                onClick={() => setScopeId(parentScopeId)}
                style={{
                  border: '1px solid var(--diagram-border)',
                  background: 'var(--diagram-surface-muted)',
                  color: 'var(--diagram-text)',
                  borderRadius: 8,
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                Go Up
              </button>
            ) : null}
            <button
              onClick={() => setScopeId(undefined)}
              style={{
                border: '1px solid var(--diagram-border)',
                background: 'transparent',
                color: 'var(--diagram-text-muted)',
                borderRadius: 8,
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Root view
            </button>
          </div>
        </Panel>
      ) : null}
      <ViewportController
        focusTarget={pendingFocus}
        onFocused={() => setPendingFocus(undefined)}
        nodes={nodes}
        rootMarker={ROOT_FOCUS_ID}
      />
    </ReactFlow>
  );
}

type ViewportControllerProps = {
  focusTarget?: string | string[];
  onFocused: () => void;
  nodes: ArchitectureNode[];
  rootMarker: string;
};

function ViewportController({
  focusTarget,
  onFocused,
  nodes,
  rootMarker,
}: ViewportControllerProps) {
  const reactFlow = useReactFlow<ArchitectureNode, ArchitectureEdge>();

  useEffect(() => {
    if (!focusTarget || !nodes.length) return;
    const frame = requestAnimationFrame(() => {
      const ids = Array.isArray(focusTarget) ? focusTarget : [focusTarget];
      if (ids.length === 1 && ids[0] === rootMarker) {
        reactFlow.fitView({ padding: 0.2, duration: 400 });
        onFocused();
        return;
      }
      const targets = nodes.filter((n) => ids.includes(n.id)).map((n) => ({ id: n.id }));
      if (!targets.length) return;
      if (targets.length === 1) {
        const node = nodes.find((n) => n.id === targets[0].id);
        if (!node) return;
        const { width, height } = sizeOf(node);
        const centerX = node.position.x + width / 2;
        const centerY = node.position.y + height / 2;
        reactFlow.setCenter(centerX, centerY, { zoom: 0.95, duration: 400 });
        onFocused();
        return;
      }
      reactFlow.fitView({ nodes: targets, padding: 0.3, duration: 400 });
      onFocused();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusTarget, nodes, onFocused, reactFlow, rootMarker]);

  return null;
}
