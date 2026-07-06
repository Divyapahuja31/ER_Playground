import { ReactFlow, useNodesState, useEdgesState, Background, Controls, SelectionMode, ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from './sidebar';
import useDrag from '../hooks/useDrag';

function Flow() {
  const [nodes, , onNodesChange] = useNodesState<Node>([]);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);

  const {handleNodeDragStart, handleNodeDragStop} = useDrag();

  return (
    <div className="flex w-full h-full relative bg-white">
      <Sidebar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        panOnDrag={[1, 2]}
        selectionOnDrag={true}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
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