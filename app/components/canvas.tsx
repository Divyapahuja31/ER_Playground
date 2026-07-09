import { useCallback, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls, SelectionMode, ReactFlowProvider, type Node, type Edge, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from './sidebar';
import useDrag from '../hooks/useDrag';
import TableNode, { type TableNodeData } from './customNodes/TableNode';
import RelationshipEdge from './CustomEdge/RelationshipEdge';

const reconstructEdgesFromNodes = (
  nodesList: Node[],
  toggleSource: (id: string) => void,
  toggleTarget: (id: string) => void
): Edge[] => {
  const newEdges: Edge[] = [];
  for (const node of nodesList) {
    if (node.type !== 'tableNode') continue;
    const data = node.data as TableNodeData;
    const attributes = data.attributes || [];
    for (const attr of attributes) {
      if (!attr.relation) continue;
      const relation = attr.relation;

      let sourceCardinality = '1';
      let targetCardinality = '1';

      if (relation.cardinality === 'ONE_TO_ONE') {
        sourceCardinality = '1';
        targetCardinality = '1';
      } else if (relation.cardinality === 'ONE_TO_MANY') {
        sourceCardinality = '1';
        targetCardinality = 'M';
      } else if (relation.cardinality === 'MANY_TO_ONE') {
        sourceCardinality = 'M';
        targetCardinality = '1';
      } else if (relation.cardinality === 'MANY_TO_MANY') {
        sourceCardinality = 'M';
        targetCardinality = 'M';
      }

      const edgeId = `edge-${node.id}-${attr.id}-${relation.tableId}-${relation.attributeId}`;

      newEdges.push({
        id: edgeId,
        source: node.id,
        sourceHandle: attr.id,
        target: relation.tableId,
        targetHandle: relation.attributeId,
        type: 'relationshipEdge',
        data: {
          sourceCardinality,
          targetCardinality,
          onToggleSource: toggleSource,
          onToggleTarget: toggleTarget,
        },
      });
    }
  }
  return newEdges;
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = { tableNode: TableNode };
  const edgeTypes = { relationshipEdge: RelationshipEdge };

  const { handleNodeDragStart, handleNodeDragStop } = useDrag();

  const toggleSourceCardinality = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge || !edge.source || !edge.sourceHandle) return;

      const currentSource = edge.data?.sourceCardinality === 'M' ? 'M' : '1';
      const newSource = currentSource === '1' ? 'M' : '1';
      const targetCard = edge.data?.targetCardinality ?? '1';

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== edge.source) return node;
          const data = node.data as TableNodeData;
          const updatedAttributes = (data.attributes || []).map((attr) => {
            if (attr.id !== edge.sourceHandle || !attr.relation) return attr;

            let cardinality = 'ONE_TO_ONE';
            if (newSource === '1' && targetCard === '1') cardinality = 'ONE_TO_ONE';
            else if (newSource === '1' && targetCard === 'M') cardinality = 'ONE_TO_MANY';
            else if (newSource === 'M' && targetCard === '1') cardinality = 'MANY_TO_ONE';
            else if (newSource === 'M' && targetCard === 'M') cardinality = 'MANY_TO_MANY';

            return {
              ...attr,
              relation: {
                ...attr.relation,
                cardinality: cardinality as any,
              },
            };
          });
          return {
            ...node,
            data: {
              ...data,
              attributes: updatedAttributes,
            },
          };
        })
      );
    },
    [edges, setNodes]
  );

  const toggleTargetCardinality = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge || !edge.source || !edge.sourceHandle) return;

      const currentTarget = edge.data?.targetCardinality === 'M' ? 'M' : '1';
      const newTarget = currentTarget === '1' ? 'M' : '1';
      const sourceCard = edge.data?.sourceCardinality ?? '1';

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== edge.source) return node;
          const data = node.data as TableNodeData;
          const updatedAttributes = (data.attributes || []).map((attr) => {
            if (attr.id !== edge.sourceHandle || !attr.relation) return attr;

            let cardinality = 'ONE_TO_ONE';
            if (sourceCard === '1' && newTarget === '1') cardinality = 'ONE_TO_ONE';
            else if (sourceCard === '1' && newTarget === 'M') cardinality = 'ONE_TO_MANY';
            else if (sourceCard === 'M' && newTarget === '1') cardinality = 'MANY_TO_ONE';
            else if (sourceCard === 'M' && newTarget === 'M') cardinality = 'MANY_TO_MANY';

            return {
              ...attr,
              relation: {
                ...attr.relation,
                cardinality: cardinality as any,
              },
            };
          });
          return {
            ...node,
            data: {
              ...data,
              attributes: updatedAttributes,
            },
          };
        })
      );
    },
    [edges, setNodes]
  );

  // Sync React Flow edges state with relationships defined inside nodes data
  useEffect(() => {
    const newEdges = reconstructEdgesFromNodes(nodes, toggleSourceCardinality, toggleTargetCardinality);

    const newStr = JSON.stringify(
      newEdges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
        sourceCard: e.data?.sourceCardinality,
        targetCard: e.data?.targetCardinality,
      }))
    );
    const currentStr = JSON.stringify(
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
        sourceCard: e.data?.sourceCardinality,
        targetCard: e.data?.targetCardinality,
      }))
    );

    if (newStr !== currentStr) {
      setEdges(newEdges);
    }
  }, [nodes, edges, setEdges, toggleSourceCardinality, toggleTargetCardinality]);

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

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== params.source) return node;
          const data = node.data as TableNodeData;
          const updatedAttributes = (data.attributes || []).map((attr) => {
            if (attr.id !== params.sourceHandle) return attr;

            const constraints = attr.constraints || [];
            const newConstraints = constraints.includes('FOREIGN_KEY')
              ? constraints
              : [...constraints, 'FOREIGN_KEY'];

            return {
              ...attr,
              constraints: newConstraints,
              relation: {
                tableId: params.target || '',
                attributeId: params.targetHandle || '',
                cardinality: 'ONE_TO_ONE',
              },
            };
          });
          return {
            ...node,
            data: {
              ...data,
              attributes: updatedAttributes,
            },
          };
        })
      );
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      const removeChanges = changes.filter((c) => c.type === 'remove');
      if (removeChanges.length > 0) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.type !== 'tableNode') return node;
            const data = node.data as TableNodeData;
            const updatedAttributes = (data.attributes || []).map((attr) => {
              if (!attr.relation) return attr;

              const isMatchingEdgeDeleted = removeChanges.some((c) => {
                const edge = edges.find((e) => e.id === c.id);
                return edge && edge.source === node.id && edge.sourceHandle === attr.id;
              });

              if (isMatchingEdgeDeleted) {
                const newConstraints = (attr.constraints || []).filter((con) => con !== 'FOREIGN_KEY');
                const { relation, ...rest } = attr;
                return {
                  ...rest,
                  constraints: newConstraints,
                };
              }
              return attr;
            });
            return {
              ...node,
              data: {
                ...data,
                attributes: updatedAttributes,
              },
            };
          })
        );
      }
      onEdgesChange(changes);
    },
    [edges, onEdgesChange, setNodes]
  );

  const mapToExportFormat = useCallback((nodesList: Node[]) => {
    const tables = nodesList
      .filter((node) => node.type === 'tableNode')
      .map((node) => {
        const data = node.data as TableNodeData;
        const attributes = data.attributes || [];
        return {
          id: node.id,
          name: data.label || '',
          attributes: attributes.map((attr) => {
            const cleanAttr: any = {
              id: attr.id,
              name: attr.name,
              datatype: attr.datatype,
              constraints: attr.constraints || [],
            };
            if (attr.relation) {
              cleanAttr.relation = attr.relation;
            }
            return cleanAttr;
          }),
        };
      });

    return {
      tables,
    };
  }, []);

  const exportJson = () => {
    const cleanData = mapToExportFormat(nodes);
    const json = JSON.stringify(cleanData, null, 2);
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
          onEdgesChange={handleEdgesChange}
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