import { useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls, SelectionMode, ReactFlowProvider, addEdge, type Node, type Edge, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from './sidebar';
import useDrag from '../hooks/useDrag';
import TableNode from './customNodes/TableNode';
import RelationshipEdge from './CustomEdge/RelationshipEdge';

function Flow() {
  const [nodes, , onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = { tableNode: TableNode };
  const edgeTypes = { relationshipEdge: RelationshipEdge };

  const { handleNodeDragStart, handleNodeDragStop } = useDrag();

  const toggleSourceCardinality = useCallback(
    (edgeId: string) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id !== edgeId) return edge;

          const current = edge.data?.sourceCardinality === 'M' ? 'M' : '1';

          return {
            ...edge,
            data: {
              ...edge.data,
              sourceCardinality: current === '1' ? 'M' : '1',
              onToggleSource: toggleSourceCardinality,
              onToggleTarget: toggleTargetCardinality,
            },
          };
        })
      );
    },
    [setEdges]
  );

  const toggleTargetCardinality = useCallback(
    (edgeId: string) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id !== edgeId) return edge;

          const current = edge.data?.targetCardinality === 'M' ? 'M' : '1';

          return {
            ...edge,
            data: {
              ...edge.data,
              targetCardinality: current === '1' ? 'M' : '1',
              onToggleSource: toggleSourceCardinality,
              onToggleTarget: toggleTargetCardinality,
            },
          };
        })
      );
    },
    [setEdges, toggleSourceCardinality]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (
        !params.source ||
        !params.target ||
        !params.sourceHandle ||
        !params.targetHandle
      ) {
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'relationshipEdge',
            data: {
              sourceCardinality: '1',
              targetCardinality: '1',
              onToggleSource: toggleSourceCardinality,
              onToggleTarget: toggleTargetCardinality,
            },
          },
          eds
        )
      );
    },
    [setEdges, toggleSourceCardinality, toggleTargetCardinality]
  );

  const exportJson = () => {
    const json = JSON.stringify({ nodes, edges }, null, 2);
    console.log(json);
    alert('check console for json');
  };

  return (
    <div className="flex w-full h-full relative bg-white">
      <Sidebar />
      <div className="flex-1 h-full relative">
        <button onClick={exportJson}>Export JSON</button>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          panOnDrag={[1, 2]}
          selectionOnDrag={true}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={handleNodeDragStop}
          selectionMode={SelectionMode.Partial}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <Background />
          <Controls
            style={{ color: 'black' }}
            position="bottom-right"
            showFitView={false}
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

function Canvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default Canvas;