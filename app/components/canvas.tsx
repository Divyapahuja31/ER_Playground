import { useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls, SelectionMode, ReactFlowProvider, addEdge, type Node, type Edge, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from './sidebar';
import useDrag from '../hooks/useDrag';
import TableNode from './customNodes/TableNode';

function Flow() {
  const [nodes, , onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = {tableNode : TableNode};

  const {handleNodeDragStart, handleNodeDragStop} = useDrag();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const exportJson = () => {
    const  json = JSON.stringify({ nodes, edges },null,2);
    console.log(json);
    alert('check console for json');
  };

  return (
    <div className="flex w-full h-full relative bg-white">
      <Sidebar />
      <div className="flex-1 h-full relative">
        <button onClick={exportJson}>
          Export JSON
        </button>
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