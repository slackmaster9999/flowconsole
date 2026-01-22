/* v8 ignore file -- @preserve */
import { Handle, Position } from '@xyflow/react';

export function HiddenHandles() {
  return (
    <>
      <Handle type="target" position={Position.Left} className="hidden-handle" isConnectable={false} />
      <Handle type="source" position={Position.Right} className="hidden-handle" isConnectable={false} />
    </>
  );
}
