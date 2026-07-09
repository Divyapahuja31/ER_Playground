import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';

type EdgeData = {
  sourceCardinality?: '1' | 'M';
  targetCardinality?: '1' | 'M';
  onToggleCardinality?: (id: string) => void;
};

function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<Edge<EdgeData>>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  
  const sourceCardinality = data?.sourceCardinality ?? '1';
  const targetCardinality = data?.targetCardinality ?? '1';

  const labelX = sourceX + (targetX - sourceX) * 0.5;
  const labelY = sourceY + (targetY - sourceY) * 0.5;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />

      <EdgeLabelRenderer>
        <button
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid #27272a',
            background: '#18181b',
            color: '#f4f4f5',
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
          }}
          onClick={() => data?.onToggleCardinality?.(id)}
        >
          {sourceCardinality} → {targetCardinality}
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

export default RelationshipEdge;