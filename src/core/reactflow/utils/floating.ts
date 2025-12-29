import { Position, type Node } from '@xyflow/react';

type Rect = { x: number; y: number; width: number; height: number };

type InternalNode = Node & {
  positionAbsolute?: { x: number; y: number };
  measured?: { width?: number; height?: number };
};

const opposite: Record<Position, Position> = {
  [Position.Left]: Position.Right,
  [Position.Right]: Position.Left,
  [Position.Top]: Position.Bottom,
  [Position.Bottom]: Position.Top,
};

function nodeRect(node?: InternalNode): Rect | null {
  if (!node) return null;
  const width = node.measured?.width ?? node.width ?? 0;
  const height = node.measured?.height ?? node.height ?? 0;
  const x = node.positionAbsolute?.x ?? node.position.x;
  const y = node.positionAbsolute?.y ?? node.position.y;
  return { x, y, width, height };
}

function center(rect: Rect) {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function intersection(rect: Rect, target: { x: number; y: number }) {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const dx = target.x - cx;
  const dy = target.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const w = rect.width / 2;
  const h = rect.height / 2;
  const sx = dx === 0 ? Infinity : w / Math.abs(dx);
  const sy = dy === 0 ? Infinity : h / Math.abs(dy);
  const t = Math.min(sx, sy);
  return { x: cx + dx * t, y: cy + dy * t };
}

function sideFromDelta(dx: number, dy: number) {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? Position.Right : Position.Left;
  }
  return dy > 0 ? Position.Bottom : Position.Top;
}

export function getFloatingParams(
  sourceNode?: InternalNode | null,
  targetNode?: InternalNode | null
): {
  source: { x: number; y: number; position: Position };
  target: { x: number; y: number; position: Position };
} | null {
  const srcRect = nodeRect(sourceNode ?? undefined);
  const tgtRect = nodeRect(targetNode ?? undefined);
  if (!srcRect || !tgtRect) return null;

  const srcCenter = center(srcRect);
  const tgtCenter = center(tgtRect);
  const dx = tgtCenter.x - srcCenter.x;
  const dy = tgtCenter.y - srcCenter.y;

  const sourceSide = sideFromDelta(dx, dy);
  const targetSide = opposite[sourceSide];

  const sourceIntersect = intersection(srcRect, tgtCenter);
  const targetIntersect = intersection(tgtRect, srcCenter);

  return {
    source: { ...sourceIntersect, position: sourceSide },
    target: { ...targetIntersect, position: targetSide },
  };
}
