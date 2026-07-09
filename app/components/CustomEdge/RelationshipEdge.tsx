import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, type Edge,} from '@xyflow/react';

type EdgeData = {
  sourceCardinality?: '1' | 'M';
  targetCardinality?: '1' | 'M';
  onToggleSource?: (id: string) => void;
  onToggleTarget?: (id: string) => void;
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


  const sourceLabelX = sourceX + (targetX - sourceX) * 0.25;
  const sourceLabelY = sourceY + (targetY - sourceY) * 0.25;

  const targetLabelX = sourceX + (targetX - sourceX) * 0.75;
  const targetLabelY = sourceY + (targetY - sourceY) * 0.75;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />

      <EdgeLabelRenderer>
        <>
          <button
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceLabelX}px, ${sourceLabelY}px)`,
              pointerEvents: 'all',
              width: 24,
              height: 24,
              borderRadius: 999,
              border: '1px solid #999',
              background: 'white',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => data?.onToggleSource?.(id)}
          >
            {sourceCardinality}
          </button>

          <button
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetLabelX}px, ${targetLabelY}px)`,
              pointerEvents: 'all',
              width: 24,
              height: 24,
              borderRadius: 999,
              border: '1px solid #999',
              background: 'white',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => data?.onToggleTarget?.(id)}
          >
            {targetCardinality}
          </button>
        </>
      </EdgeLabelRenderer>
    </>
  );
}

export default RelationshipEdge;