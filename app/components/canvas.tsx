import React, { useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls, SelectionMode, ReactFlowProvider, addEdge, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from './sidebar';

function Canvas() {
  const [nodes, , onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className="flex w-full h-full relative bg-white">
        <Sidebar />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          panOnDrag={[1, 2]}
          selectionOnDrag={true}
          selectionMode={SelectionMode.Partial}
          fitView
        >
          <Background />
          <Controls
            style={{ color: "black" }}
            position="bottom-right"
            showFitView={false}
            showInteractive={false}
          />
        </ReactFlow>
      </div>

    </ReactFlowProvider>

  );
}

export default Canvas;