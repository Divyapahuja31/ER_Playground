import React from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls, SelectionMode } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function Canvas() {
  const [nodes, , onNodesChange] = useNodesState([]);
  const [edges, , onEdgesChange] = useEdgesState([]);

  return (
    <div className="flex-1 h-full relative bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        panOnDrag={[1, 2]}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        fitView
      >
        <Background />

        <Controls
        style={{color:"black"}}
          position="bottom-right"
          showFitView={false}      
          showInteractive={false} 
        />
      </ReactFlow>
    </div>
  );
}

export default Canvas;