/* eslint-disable @typescript-eslint/no-explicit-any */
import graphviz from 'graphviz-wasm';
import { Position } from '@xyflow/react';
import type { ArchitectureDiagramModel, ArchitectureNode, ArchitectureEdge } from './types';

const DPI = 96;
const PT_TO_INCH = 1 / 72;
const GRAPH_CLUSTER_SPACE = 50.1; // px, same as GraphClusterSpace
const DEFAULT_NODESEP = 110;
const DEFAULT_RANKSEP = 120;
const DEFAULT_PAD = 15;
const CLUSTER_MARGIN = 36;
const CONTENT_PADDING = 20;

function escapeLabel(text: string) {
  return text.replace(/"/g, '\\"');
}

function pxToInch(px: number) {
  return px / DPI;
}

function pointToPx(pt: number) {
  return pt * PT_TO_INCH * DPI;
}

function inchToPx(inch: number) {
  return inch * DPI;
}

function estimateSize(
  node: ArchitectureDiagramModel['nodes'][number],
  options?: { allowStyledSize?: boolean }
) {
  const allowStyledSize = options?.allowStyledSize ?? true;
  const title = 'title' in node.data ? node.data.title ?? '' : '';
  const subtitle = node.data?.subtitle ?? '';
  const desc = node.data?.description ?? '';
  const tags = Array.isArray(node.data?.tags) ? (node.data?.tags as string[]) : [];
  const badge = node.data?.badge ?? '';

  const baseWidth =
    (allowStyledSize && typeof node.style?.width === 'number' && node.style.width) ||
    node.width || 240;
  const baseHeight = 90;

  const textWidth = Math.max(title.length * 7, subtitle.length * 6, 120);
  const tagsWidth = tags.length ? Math.max(tags.join(',').length * 5, tags.length * 60) : 0;
  const badgeWidth = badge ? Math.max(String(badge).length * 7 + 32, 80) : 0;
  const width = Math.max(baseWidth, textWidth, tagsWidth, badgeWidth) + CONTENT_PADDING;

  const lineHeight = 18;
  const descLines = desc ? Math.ceil(desc.length / 40) : 0;
  const tagsLines = tags.length ? Math.ceil(tags.length / 3) : 0;
  const height = baseHeight + descLines * lineHeight + tagsLines * lineHeight + CONTENT_PADDING / 2;

  return { width, height };
}

function buildDot(model: ArchitectureDiagramModel) {
  const lines: string[] = [];
  lines.push('digraph G {');
  lines.push(
    `  graph [layout=dot, rankdir=LR, compound=true, splines=spline, outputorder=nodesfirst, overlap=false, sep=0.5, esep=0.3, nodesep=${pxToInch(
      DEFAULT_NODESEP
    ).toFixed(3)}, ranksep=${pxToInch(DEFAULT_RANKSEP).toFixed(3)}, pad=${pxToInch(
      DEFAULT_PAD
    ).toFixed(3)}, margin=${pxToInch(GRAPH_CLUSTER_SPACE + CLUSTER_MARGIN).toFixed(3)}]`
  );
  lines.push(
    '  node [shape=rect, style="rounded,filled", fillcolor="#0f1625", color="#1f2a3d", penwidth=0, fontname="Arial"];'
  );
  lines.push('  edge [color="#3b82f6", penwidth=2, arrowsize=0.75, fontname="Arial"];');

  const childrenByParent = new Map<string | undefined, string[]>();
  for (const node of model.nodes) {
    const parent = node.parentId;
    const list = childrenByParent.get(parent) ?? [];
    list.push(node.id);
    childrenByParent.set(parent, list);
  }

  for (const node of model.nodes) {
    const childCount = childrenByParent.get(node.id)?.length ?? 0;
    const isCluster = (node.type === 'container') && childCount > 0;
    if (isCluster) {
      continue;
    }
    const label = 'title' in node.data ? node.data.title : node.id;
    const allowStyledSize = !(node.type === 'container' && childCount === 0);
    const { width: estW, height: estH } = estimateSize(node, { allowStyledSize });
    const widthIn = pxToInch(estW);
    const heightIn = pxToInch(estH);
    lines.push(
      `  "${node.id}" [label="${escapeLabel(label)}", width=${widthIn.toFixed(
        3
      )}, height=${heightIn.toFixed(3)}];`
    );
  }

  const plainId = (id: string) => escapeLabel(id).replace(/-/g, '_');

  const renderCluster = (id: string) => {
    const children = childrenByParent.get(id) ?? [];
    if (!children.length) return;
    const node = model.nodes.find((n) => n.id === id);
    const label = node && 'title' in node.data ? escapeLabel(node.data.title) : id;
    const clusterName = plainId(id);
    lines.push(`  subgraph cluster_${clusterName} {`);
    lines.push(
      `    label="${label}"; margin=20; style="rounded,filled"; color="#1f2a3d"; fillcolor="#0f1625";`
    );
    for (const childId of children) {
      const child = model.nodes.find((n) => n.id === childId);
      if (!child) continue;
      const childHasChildren = (childrenByParent.get(childId)?.length ?? 0) > 0;
      const isContainerLike = child.type === 'container';

      if (isContainerLike && childHasChildren) {
        renderCluster(child.id);
      } else {
        lines.push(`    "${childId}";`);
      }
    }
    lines.push('  }');
  };

  for (const node of model.nodes) {
    const childCount = childrenByParent.get(node.id)?.length ?? 0;
    const isCluster = (node.type === 'container') && childCount > 0;
    if (isCluster && !node.parentId) {
      renderCluster(node.id);
    }
  }

  for (const edge of model.edges) {
    const attrs = [
      `id="${escapeLabel(edge.id)}"`,
      edge.data?.label ? `label="${escapeLabel(edge.data.label)}"` : undefined,
    ]
      .filter(Boolean)
      .join(', ');
    lines.push(`  "${edge.source}" -> "${edge.target}" [${attrs}];`);
  }

  lines.push('}');
  return lines.join('\n');
}

type LayoutEntry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type EdgeLayoutEntry = {
  points: { x: number; y: number }[];
  label?: { x: number; y: number };
};

type LayoutResult = {
  nodes: Map<string, LayoutEntry>;
  edges: Map<string, EdgeLayoutEntry>;
};

type AnchorData = {
  position: Position;
  offset: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function anchorFromPoint(
  point: { x: number; y: number } | undefined,
  node: LayoutEntry | undefined
): AnchorData | undefined {
  if (!point || !node || !node.width || !node.height) return undefined;
  const relX = point.x - node.x;
  const relY = point.y - node.y;
  const distances = [
    { position: Position.Left, value: Math.abs(relX) },
    { position: Position.Right, value: Math.abs(relX - node.width) },
    { position: Position.Top, value: Math.abs(relY) },
    { position: Position.Bottom, value: Math.abs(relY - node.height) },
  ];
  const nearest = distances.reduce((best, current) =>
    current.value < best.value ? current : best
  );
  let offset = 0.5;
  switch (nearest.position) {
    case Position.Left:
    case Position.Right:
      offset = clamp(node.height ? relY / node.height : 0.5, 0, 1);
      break;
    case Position.Top:
    case Position.Bottom:
      offset = clamp(node.width ? relX / node.width : 0.5, 0, 1);
      break;
  }
  return {
    position: nearest.position,
    offset,
  };
}

function parseJsonLayout(json: string): LayoutResult {
  const j = JSON.parse(json) as any;
  const nodeEntries = new Map<string, LayoutEntry>();
  const edgeEntries = new Map<string, EdgeLayoutEntry>();
  const objects: any[] = j?.objects ?? [];
  const edgeObjects: any[] = j?.edges ?? [];
  const graphBb = j.bb ? j.bb.split(',').map((p: string) => pointToPx(parseFloat(p))) : [0, 0, 0, 0];
  const graphHeight = graphBb.length === 4 ? graphBb[3] - graphBb[1] : 0;

  for (const obj of objects) {
    if (obj.name?.startsWith('cluster_')) {
      const id = obj.name.replace(/^cluster_/, '');
      if (!obj.bb) continue;
      const [x1p, y1p, x2p, y2p] = obj.bb.split(',').map((p: string) => pointToPx(parseFloat(p)));
      const width = x2p - x1p;
      const height = y2p - y1p;
      const yTop = graphHeight ? graphHeight - y2p : y1p;
      const entry = { x: x1p, y: yTop, width, height };
      nodeEntries.set(id, entry);
      const originalId = id.replace(/_/g, '-');
      if (originalId !== id) {
        nodeEntries.set(originalId, entry);
      }
      continue;
    }
    if (obj.pos && obj.width && obj.height) {
      const [px, py] = obj.pos.split(',').map((p: string) => pointToPx(parseFloat(p)));
      const w = inchToPx(parseFloat(obj.width));
      const h = inchToPx(parseFloat(obj.height));
      const cx = px;
      const cy = graphHeight ? graphHeight - py : py;
      nodeEntries.set(obj.name, { x: cx - w / 2, y: cy - h / 2, width: w, height: h });
    }
  }

  const toPoint = (x: number, y: number) => {
    const px = pointToPx(x);
    const py = pointToPx(y);
    const invY = graphHeight ? graphHeight - py : py;
    return { x: px, y: invY };
  };

  for (const e of edgeObjects) {
    if (!e.id) continue;
    let pts: { x: number; y: number }[] = [];

    const drawOps: Array<{ op?: string; points?: [number, number][] }> = Array.isArray(e._draw_)
      ? (e._draw_ as Array<{ op?: string; points?: [number, number][] }>)
      : [];
    const splineOp = drawOps.find(
      (op) => typeof op.op === 'string' && op.op.toLowerCase() === 'b' && Array.isArray(op.points)
    );
    if (splineOp?.points?.length) {
      pts = splineOp.points
        .map(([x, y]) => toPoint(x, y))
        .filter((entry) => Number.isFinite(entry.x) && Number.isFinite(entry.y));
    } else if (typeof e.pos === 'string') {
      const parts = e.pos.split(/\s+/);
      const coords = parts.flatMap((part: string, idx: number) => {
        if (idx === 0 && part.startsWith('e,')) {
          const rest = part.slice(2);
          return rest.length ? rest.split(',') : [];
        }
        return part.includes(',') ? part.split(',') : [part];
      });
      for (let i = 0; i + 1 < coords.length; i += 2) {
        const x = pointToPx(parseFloat(coords[i]));
        const yRaw = pointToPx(parseFloat(coords[i + 1]));
        const y = graphHeight ? graphHeight - yRaw : yRaw;
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        pts.push({ x, y });
      }
    }

    let label: { x: number; y: number } | undefined;
    if (typeof e.lp === 'string') {
      const [lx, ly] = e.lp.split(',').map((p: string) => pointToPx(parseFloat(p)));
      const y = graphHeight ? graphHeight - ly : ly;
      label = { x: lx, y };
    }
    edgeEntries.set(e.id as string, { points: pts, label });
  }

  return { nodes: nodeEntries, edges: edgeEntries };
}

function applyLayout(model: ArchitectureDiagramModel, layout: LayoutResult): ArchitectureDiagramModel {
  const nodes: ArchitectureNode[] = model.nodes.map((node) => {
    const l = layout.nodes.get(node.id);
    if (!l) return node;
    let position = { x: l.x, y: l.y };

    if (node.parentId) {
      const parentLayout = layout.nodes.get(node.parentId);
      if (parentLayout) {
        position = { x: l.x - parentLayout.x, y: l.y - parentLayout.y };
      }
    }

    return {
      ...node,
      position,
      style: { ...node.style, width: l.width, height: node.type == "container" ? l.height+ 20 : '' },
    };
  });

  const edges: ArchitectureEdge[] = model.edges.map((edge) => {
    const eLayout = layout.edges.get(edge.id);
    if (!eLayout || !eLayout.points.length) return edge;
    const sourceLayout = layout.nodes.get(edge.source);
    const targetLayout = layout.nodes.get(edge.target);
    const sourceAnchor = anchorFromPoint(eLayout.points[0], sourceLayout);
    const targetAnchor = anchorFromPoint(
      eLayout.points[eLayout.points.length - 1],
      targetLayout
    );
    return {
      ...edge,
      data: {
        ...edge.data,
        layoutPoints: eLayout.points,
        labelPos: eLayout.label,
        ...(sourceAnchor ? { sourceAnchor } : {}),
        ...(targetAnchor ? { targetAnchor } : {}),
      },
    };
  });

  return { nodes, edges };
}

let loaded = false;
async function ensureWasm() {
  if (loaded) return;
  await graphviz.loadWASM();
  loaded = true;
}

export async function layoutWithGraphviz(model: ArchitectureDiagramModel): Promise<ArchitectureDiagramModel> {
  await ensureWasm();
  const dot = buildDot(model);
  const json = graphviz.layout(dot, 'json', 'dot');
  const parsed = parseJsonLayout(json);
  return applyLayout(model, parsed);
}
