import React from 'react'
import { ReactFlow, useNodesState, useEdgesState, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function Canvas() {
  const [nodes, , onNodesChange] = useNodesState([]);
  const [edges, , onEdgesChange] = useEdgesState([]);
  return (
    <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>
  )
}

export default Canvas