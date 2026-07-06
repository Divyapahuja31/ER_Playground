'use client';

import React from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function FlowPage() {
  const [nodes, , onNodesChange] = useNodesState([]);
  const [edges, , onEdgesChange] = useEdgesState([]);

  return (
    <main className="flex w-screen h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shrink-0" />

      {/* React Flow Canvas */}
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
    </main>
  );
}