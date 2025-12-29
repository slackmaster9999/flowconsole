import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Position,
  useInternalNode,
  useReactFlow,
  type EdgeProps,
  type XYPosition,
} from '@xyflow/react';
import { curveCatmullRomOpen, line } from 'd3-shape';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { relationshipStroke } from '../../diagram/theme';
import type { RelationshipEdgeType } from '../../diagram/types';

type Point = XYPosition;
type InternalNodeInstance = NonNullable<ReturnType<typeof useInternalNode>>;
const catmullRomLine = line<Point>()
  .curve(curveCatmullRomOpen.alpha(0.7))
  .x((d) => Math.round(d.x))
  .y((d) => Math.round(d.y));

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function resolveAnchorPoint(
  node: InternalNodeInstance | undefined,
  anchor: NonNullable<RelationshipEdgeType['data']>['sourceAnchor'] | undefined
): Point | undefined {
  if (!node || !anchor) return undefined;
  const width =
    (typeof node.measured?.width === 'number' && node.measured.width) ||
    (typeof node.width === 'number' ? node.width : undefined) ||
    (typeof (node as any).style?.width === 'number' ? (node as any).style.width : undefined) ||
    (typeof node.initialWidth === 'number' ? node.initialWidth : undefined);
  const height =
    (typeof node.measured?.height === 'number' && node.measured.height) ||
    (typeof node.height === 'number' ? node.height : undefined) ||
    (typeof (node as any).style?.height === 'number' ? (node as any).style.height : undefined) ||
    (typeof node.initialHeight === 'number' ? node.initialHeight : undefined);
  if (!width || !height) return undefined;
  const { x, y } = node.internals.positionAbsolute;
  const offset = clamp01(anchor.offset ?? 0.5);
  switch (anchor.position) {
    case Position.Left:
      return { x, y: y + offset * height };
    case Position.Right:
      return { x: x + width, y: y + offset * height };
    case Position.Top:
      return { x: x + offset * width, y };
    case Position.Bottom:
      return { x: x + offset * width, y: y + height };
    default:
      return undefined;
  }
}

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(
  intersectionNode: InternalNodeInstance,
  targetNode: InternalNodeInstance
) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const intersectionNodeWidth = intersectionNode.measured?.width;
  const intersectionNodeHeight = intersectionNode.measured?.height;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;
  const targetWidth = targetNode.measured?.width;
  const targetHeight = targetNode.measured?.height;

  if (!intersectionNodeWidth || !intersectionNodeHeight || !targetWidth || !targetHeight) {
    return targetPosition;
  }
 
  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;
 
  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetWidth / 2;
  const y1 = targetPosition.y + targetHeight / 2;
 
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;
 
  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: InternalNodeInstance, intersectionPoint: Point) {
  const measured = node.measured;
  if (!measured?.width || !measured?.height) {
    return Position.Top;
  }
  const width = measured.width;
  const height = measured.height;
  const n = { ...node.internals.positionAbsolute };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= ny + height - 1) {
    return Position.Bottom;
  }
 
  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNodeInstance, target: InternalNodeInstance) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);
 
  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);
 
  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

function bezierPathFromGraphviz(points: Point[] | undefined) {
  if (!points?.length) return undefined;
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i + 2 < points.length; i += 3) {
    const cp1 = points[i];
    const cp2 = points[i + 1];
    const end = points[i + 2];
    if (!cp1 || !cp2 || !end) break;
    path += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`;
  }
  return path;
}

function normalizeGraphvizPoints(
  basePoints: Point[] | undefined,
  source: Point,
  target: Point
): Point[] | undefined {
  if (!basePoints?.length || basePoints.length < 4) return undefined;
  if ((basePoints.length - 1) % 3 !== 0) return undefined;
  const shiftX = source.x - basePoints[0].x;
  const shiftY = source.y - basePoints[0].y;
  const adjusted = basePoints.map((p, idx) =>
    idx === 0
      ? { x: source.x, y: source.y }
      : {
          x: p.x + shiftX,
          y: p.y + shiftY,
        }
  );
  const n = adjusted.length;
  const targetShiftX = target.x - adjusted[n - 1].x;
  const targetShiftY = target.y - adjusted[n - 1].y;
  for (let i = Math.max(1, n - 3); i < n; i++) {
    adjusted[i] = {
      x: adjusted[i].x + targetShiftX,
      y: adjusted[i].y + targetShiftY,
    };
  }
  adjusted[n - 1] = { x: target.x, y: target.y };
  return adjusted;
}

function smoothPath(points: Point[] | undefined) {
  if (!points || points.length < 2) return undefined;
  return catmullRomLine(points) ?? undefined;
}

function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function midpoint(points: Point[]) {
  if (points.length === 0) return undefined;
  if (points.length === 1) return points[0];
  const segmentLengths: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = distance(points[i], points[i + 1]);
    segmentLengths.push(len);
    total += len;
  }
  if (total === 0) return points[0];
  const target = total / 2;
  let acc = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    const len = segmentLengths[i];
    if (acc + len >= target) {
      const t = (target - acc) / (len || 1);
      const start = points[i];
      const end = points[i + 1];
      return {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      };
    }
    acc += len;
  }
  return points[points.length - 1];
}

function distanceToSegment(point: Point, start: Point, end: Point) {
  const segLenSq = Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2);
  if (segLenSq === 0) return distance(point, start);
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) /
        segLenSq
    )
  );
  const proj = {
    x: start.x + t * (end.x - start.x),
    y: start.y + t * (end.y - start.y),
  };
  return distance(point, proj);
}

function insertControlPoint(
  controlPoints: Point[],
  newPoint: Point,
  start: Point,
  end: Point
) {
  const allPoints = [start, ...controlPoints, end];
  let insertIndex = 0;
  let minDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < allPoints.length - 1; i++) {
    const dist = distanceToSegment(newPoint, allPoints[i], allPoints[i + 1]);
    if (dist < minDistance) {
      minDistance = dist;
      insertIndex = i;
    }
  }
  const next = controlPoints.slice();
  const targetIndex = Math.min(insertIndex, controlPoints.length);
  next.splice(targetIndex, 0, newPoint);
  return next;
}

export function RelationshipEdge(props: EdgeProps<RelationshipEdgeType>) {
  const {
    id,
    style,
    data,
    selected,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;

  const [localHovered, setLocalHovered] = useState(false);
  const flowCurrent = Boolean(data?.flowCurrent);
  const hovered = (data?.hovered ?? localHovered) || flowCurrent;
  const flowTick = data?.flowTick ?? 0;
  const [draftPoints, setDraftPoints] = useState<Point[] | null>(null);
  const [isDraggingControl, setIsDraggingControl] = useState(false);
  const draftRef = useRef<Point[] | null>(null);
  draftRef.current = draftPoints;
  const dragCleanupRef = useRef<(() => void) | null>(null);

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const reactFlow = useReactFlow();
  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
    };
  }, []);

  const fallbackGeometry = useMemo(() => {
    if (sourceNode && targetNode) {
      return getEdgeParams(sourceNode, targetNode);
    }
    return {
      sx: sourceX,
      sy: sourceY,
      tx: targetX,
      ty: targetY,
      sourcePos: sourcePosition ?? Position.Right,
      targetPos: targetPosition ?? Position.Left,
    };
  }, [sourceNode, targetNode, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const sourceAnchorPoint = useMemo(
    () => resolveAnchorPoint(sourceNode, data?.sourceAnchor),
    [sourceNode, data?.sourceAnchor]
  );
  const targetAnchorPoint = useMemo(
    () => resolveAnchorPoint(targetNode, data?.targetAnchor),
    [targetNode, data?.targetAnchor]
  );

  const sx = sourceAnchorPoint?.x ?? fallbackGeometry.sx;
  const sy = sourceAnchorPoint?.y ?? fallbackGeometry.sy;
  const tx = targetAnchorPoint?.x ?? fallbackGeometry.tx;
  const ty = targetAnchorPoint?.y ?? fallbackGeometry.ty;
  const sourcePos = data?.sourceAnchor?.position ?? fallbackGeometry.sourcePos;
  const targetPos = data?.targetAnchor?.position ?? fallbackGeometry.targetPos;

  const [fallbackPath, fallbackLabelX, fallbackLabelY] = useMemo(
    () =>
      getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
      }),
    [sourcePos, sx, sy, targetPos, tx, ty]
  );

  const storedControlPoints = data?.controlPoints ?? [];
  const controlPoints = draftPoints ?? storedControlPoints;

  const manualPath = useMemo(() => {
    if (!controlPoints.length) return undefined;
    const manualPoints = [{ x: sx, y: sy }, ...controlPoints, { x: tx, y: ty }];
    const path = smoothPath(manualPoints);
    const labelPoint = midpoint(manualPoints);
    return path
      ? {
          path,
          labelPoint,
        }
      : undefined;
  }, [controlPoints, sx, sy, tx, ty]);

  const graphvizPoints = useMemo(() => {
    if (!data?.layoutPoints?.length) return undefined;
    return normalizeGraphvizPoints(data.layoutPoints, { x: sx, y: sy }, { x: tx, y: ty });
  }, [data?.layoutPoints, sx, sy, tx, ty]);

  const graphvizPath = useMemo(
    () => bezierPathFromGraphviz(graphvizPoints),
    [graphvizPoints]
  );

  const graphvizLabel = useMemo(() => {
    if (!data?.labelPos) return undefined;
    if (!data?.layoutPoints?.length) return data.labelPos;
    const base = data.layoutPoints[0];
    const dx = sx - (base?.x ?? sx);
    const dy = sy - (base?.y ?? sy);
    return { x: data.labelPos.x + dx, y: data.labelPos.y + dy };
  }, [data?.labelPos, data?.layoutPoints, sx, sy]);

  const resolvedPath = manualPath?.path ?? graphvizPath ?? fallbackPath;
  const resolvedLabelPoint =
    manualPath?.labelPoint ?? graphvizLabel ?? { x: fallbackLabelX, y: fallbackLabelY };

  const stroke = relationshipStroke(data?.kind);
  const direction = data?.direction ?? 'forward';
  const isDirectional = direction !== 'none';
  const markerStart = direction === 'both' ? `url(#${id}-start)` : undefined;
  const markerEnd = isDirectional ? `url(#${id}-end)` : undefined;
  const hasIcon = Boolean(data?.icon);
  const isAnimated = isDirectional && hovered;
  const animationDirection =
    direction === 'forward' ? 'reverse' : direction === 'both' ? 'alternate' : 'normal';
  const animatedStyle = isAnimated
    ? { strokeDasharray: '8 10', animationDirection }
    : undefined;
  const flowStyle = data?.flowHighlighted ? { strokeWidth: 3 } : undefined;
  const interactionWidth = 20;

  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.max(Math.hypot(dx, dy), 1);

  const side = data?.labelSide ?? 'above';
  const offset = 18;
  let offsetX = 0;
  let offsetY = 0;
  if (side === 'above') {
    offsetX = (-dy / len) * offset;
    offsetY = (dx / len) * offset;
  } else if (side === 'below') {
    offsetX = (dy / len) * offset;
    offsetY = (-dx / len) * offset;
  } else if (side === 'left') {
    offsetX = (-dx / len) * offset;
    offsetY = (-dy / len) * offset;
  } else if (side === 'right') {
    offsetX = (dx / len) * offset;
    offsetY = (dy / len) * offset;
  }

  const updateEdgeData = useCallback(
    (partial: Partial<NonNullable<RelationshipEdgeType['data']>>) => {
      reactFlow.setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  ...partial,
                },
              }
            : edge
        )
      );
    },
    [id, reactFlow]
  );

  const commitControlPoints = useCallback(
    (points: Point[]) => {
      const manualPoints = [{ x: sx, y: sy }, ...points, { x: tx, y: ty }];
      updateEdgeData({
        controlPoints: points,
        labelPos: midpoint(manualPoints) ?? resolvedLabelPoint,
      });
    },
    [sx, sy, tx, ty, updateEdgeData, resolvedLabelPoint]
  );

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent<SVGPathElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const flow = reactFlow.screenToFlowPosition(
        {
          x: event.clientX,
          y: event.clientY,
        },
        { snapToGrid: false }
      );
      const next = insertControlPoint(storedControlPoints, flow, { x: sx, y: sy }, { x: tx, y: ty });
      commitControlPoints(next);
    },
    [reactFlow, storedControlPoints, sx, sy, tx, ty, commitControlPoints]
  );

  const handleControlPointerDown = useCallback(
    (index: number) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 2) {
        event.preventDefault();
        event.stopPropagation();
        if (storedControlPoints.length <= index) return;
        const next = storedControlPoints.slice();
        next.splice(index, 1);
        commitControlPoints(next);
        return;
      }
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingControl(true);
      const pointerId = event.pointerId;
      const initialPoints = (draftRef.current ?? storedControlPoints).map((p) => ({ ...p }));
      setDraftPoints(initialPoints);
      let moved = false;
      const handleMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        moved = true;
        const nextPos = reactFlow.screenToFlowPosition(
          { x: ev.clientX, y: ev.clientY },
          { snapToGrid: false }
        );
        setDraftPoints((prev) => {
          const next = (prev ?? initialPoints).map((p) => ({ ...p }));
          next[index] = { x: Math.round(nextPos.x), y: Math.round(nextPos.y) };
          return next;
        });
      };
      const cleanup = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        dragCleanupRef.current = null;
      };
      const handleUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        cleanup();
        const finalPoints = draftRef.current ?? initialPoints;
        setDraftPoints(null);
        setIsDraggingControl(false);
        if (moved && finalPoints) {
          commitControlPoints(finalPoints);
        }
      };
      dragCleanupRef.current?.();
      dragCleanupRef.current = cleanup;
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [commitControlPoints, reactFlow, storedControlPoints]
  );

  const showControlPoints =
    (controlPoints.length > 0 || isDraggingControl) && (selected || hovered || isDraggingControl);

  if (!resolvedPath) {
    return null;
  }

  return (
    <g key={`${id}-${flowTick}-${flowCurrent ? 'flow' : 'idle'}`}>
      {isDirectional ? (
        <defs>
          <marker
            id={`${id}-end`}
            markerWidth="18"
            markerHeight="18"
            refX="9"
            refY="6"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M2,2 L10,6 L2,10 Z" fill={stroke.stroke} />
          </marker>
          {direction === 'both' ? (
            <marker
              id={`${id}-start`}
              markerWidth="18"
              markerHeight="18"
              refX="9"
              refY="6"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M2,2 L10,6 L2,10 Z" fill={stroke.stroke} />
            </marker>
          ) : null}
        </defs>
      ) : null}

      <BaseEdge
        id={id}
        path={resolvedPath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          strokeWidth: 2.4,
          ...stroke,
          ...animatedStyle,
          ...flowStyle,
          ...style,
          opacity: data?.muted ? 0.7 : 1,
        }}
        className={[
          'relationship-path',
          isDirectional ? 'relationship-path--directional' : '',
          isAnimated ? 'relationship-path--animated' : '',
          data?.flowHighlighted ? 'relationship-path--flow' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onContextMenu={handleEdgeContextMenu}
        interactionWidth={0}
      />

      <path
        d={resolvedPath}
        fill="none"
        stroke="transparent"
        strokeWidth={interactionWidth}
        className="relationship-path-interaction"
        onMouseEnter={() => setLocalHovered(true)}
        onMouseLeave={() => setLocalHovered(false)}
        onContextMenu={handleEdgeContextMenu}
      />

      {(data?.label || data?.detail || hasIcon) && (
        <EdgeLabelRenderer>
          <div
            className="relationship-label"
            style={{
              transform: `translate(-50%, -50%) translate(${resolvedLabelPoint.x + offsetX}px, ${
                resolvedLabelPoint.y + offsetY
              }px)`,
              borderColor: stroke.stroke,
            }}
          >
            {hasIcon ? <span className="relationship-label__icon">{data?.icon}</span> : null}
            {data?.label ? <span className="relationship-label__main">{data.label}</span> : null}
            {data?.detail ? (
              <span className="relationship-label__detail">{data.detail}</span>
            ) : null}
          </div>
        </EdgeLabelRenderer>
      )}

      {showControlPoints ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            {controlPoints.map((point, index) => (
              <div
                key={`${id}-cp-${index}`}
                className="relationship-control-point nodrag nopan"
                style={{
                  transform: `translate(-50%, -50%) translate(${point.x}px, ${point.y}px)`,
                  borderColor: stroke.stroke,
                }}
                onPointerDown={handleControlPointerDown(index)}
              />
            ))}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </g>
  );
}
