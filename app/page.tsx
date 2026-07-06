'use client';

import { ReactFlow, useNodesState, useEdgesState, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function FlowPage() {
  const [nodes, , onNodesChange] = useNodesState([]);
  const [edges, , onEdgesChange] = useEdgesState([]);

  return (
    <main className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
      </ReactFlow>
    </main>
  );
}