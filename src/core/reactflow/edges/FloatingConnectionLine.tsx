import { getBezierPath, Position, useStore, type Node } from '@xyflow/react';
import { useMemo } from 'react';
import { getFloatingParams } from '../utils/floating';

type InternalNode = Node & {
  positionAbsolute?: { x: number; y: number };
  measured?: { width?: number; height?: number };
};

type FloatingConnectionLineProps = {
  fromX: number;
  fromY: number;
  fromPosition: Position;
  toX: number;
  toY: number;
  toPosition: Position;
  fromNode?: Node | null;
  toNode?: Node | null;
};

export function FloatingConnectionLine(props: FloatingConnectionLineProps) {
  const { fromX, fromY, fromPosition, toX, toY, toPosition, fromNode, toNode } = props;

  const { sourceNode, targetNode } = useStore(
    useMemo(
      () => (state) => ({
        sourceNode: fromNode ? (state.nodeLookup.get(fromNode.id) as InternalNode | undefined) : undefined,
        targetNode: toNode ? (state.nodeLookup.get(toNode.id) as InternalNode | undefined) : undefined,
      }),
      [fromNode, toNode]
    )
  );

  const floating = useMemo(
    () => getFloatingParams(sourceNode, targetNode),
    [sourceNode, targetNode]
  );

  const sx = floating?.source?.x ?? fromX;
  const sy = floating?.source?.y ?? fromY;
  const tx = floating?.target?.x ?? toX;
  const ty = floating?.target?.y ?? toY;

  const [path] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: floating?.source?.position ?? fromPosition,
    targetX: tx,
    targetY: ty,
    targetPosition: floating?.target?.position ?? toPosition,
  });

  return <path fill="none" stroke="var(--xy-edge-stroke)" strokeWidth={1.5} d={path} />;
}
