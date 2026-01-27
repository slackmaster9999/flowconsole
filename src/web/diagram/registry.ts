import type { ArchitectureEdgeTypes, ArchitectureNodeTypes } from './types';
import { ElementNode } from '../reactflow/nodes/ElementNode';
import { ContainerNode } from '../reactflow/nodes/ContainerNode';
import { RelationshipEdge } from '../reactflow/edges/RelationshipEdge';

export const architectureNodeTypes: ArchitectureNodeTypes = {
  element: ElementNode,
  container: ContainerNode
};

export const architectureEdgeTypes: ArchitectureEdgeTypes = {
  relationship: RelationshipEdge,
};
