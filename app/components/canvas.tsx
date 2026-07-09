import { useCallback, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls, SelectionMode, ReactFlowProvider, type Node, type Edge, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Sidebar from './sidebar';
import useDrag from '../hooks/useDrag';
import TableNode, { type TableNodeData } from './customNodes/TableNode';
import RelationshipEdge from './CustomEdge/RelationshipEdge';

const reconstructEdgesFromNodes = (
  nodesList: Node[],
  toggleCardinality: (id: string) => void
): Edge[] => {
  const newEdges: Edge[] = [];
  for (const node of nodesList) {
    if (node.type !== 'tableNode') continue;
    const data = node.data as TableNodeData;
    const attributes = data.attributes || [];
    for (const attr of attributes) {
      if (!attr.relations) continue;
      for (const relation of attr.relations) {
        if (relation.role !== 'SOURCE') continue;

        // Verify that the target node and target attribute exist in the current nodesList
        const targetNode = nodesList.find((n) => n.id === relation.tableId) as Node<TableNodeData> | undefined;
        if (!targetNode) continue;

        const targetAttrs = targetNode.data?.attributes || [];
        const targetAttrExists = targetAttrs.some((a) => a.id === relation.attributeId);
        if (!targetAttrExists) continue;

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

        const edgeId = relation.id;

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
            onToggleCardinality: toggleCardinality,
          },
        });
      }
    }
  }
  return newEdges;
};

export const migrateOldSchema = (cleanData: any): any => {
  if (!cleanData || !cleanData.tables) return cleanData;
  
  const tables = JSON.parse(JSON.stringify(cleanData.tables));
  
  // 1. Migrate intermediate 'relation' object to 'relations' array on all attributes
  for (const table of tables) {
    if (!table.attributes) continue;
    for (const attr of table.attributes) {
      if (attr.relation) {
        const relId = attr.relation.id || `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        attr.relations = [
          {
            id: relId,
            role: 'SOURCE',
            tableId: attr.relation.tableId,
            attributeId: attr.relation.attributeId,
            cardinality: attr.relation.cardinality || 'ONE_TO_ONE'
          }
        ];
        delete attr.relation;
      }
    }
  }

  // 2. Migrate very old 'relationships' array to 'relations' arrays
  if (cleanData.relationships && Array.isArray(cleanData.relationships)) {
    for (const rel of cleanData.relationships) {
      const relationId = rel.id || `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const sourceTable = tables.find((t: any) => t.id === rel.source?.table || t.name === rel.source?.table);
      const targetTable = tables.find((t: any) => t.id === rel.target?.table || t.name === rel.target?.table);

      if (sourceTable && targetTable) {
        const sourceAttr = sourceTable.attributes?.find((a: any) => a.id === rel.source?.attribute || a.name === rel.source?.attribute);
        const targetAttr = targetTable.attributes?.find((a: any) => a.id === rel.target?.attribute || a.name === rel.target?.attribute);

        if (sourceAttr && targetAttr) {
          sourceAttr.relations = sourceAttr.relations || [];
          if (!sourceAttr.relations.some((r: any) => r.id === relationId)) {
            sourceAttr.relations.push({
              id: relationId,
              role: 'SOURCE',
              tableId: targetTable.id,
              attributeId: targetAttr.id,
              cardinality: rel.cardinality || 'ONE_TO_ONE'
            });
          }
          sourceAttr.constraints = sourceAttr.constraints || [];
          if (!sourceAttr.constraints.includes('FOREIGN_KEY')) {
            sourceAttr.constraints.push('FOREIGN_KEY');
          }

          targetAttr.relations = targetAttr.relations || [];
          if (!targetAttr.relations.some((r: any) => r.id === relationId)) {
            targetAttr.relations.push({
              id: relationId,
              role: 'TARGET',
              tableId: sourceTable.id,
              attributeId: sourceAttr.id,
              cardinality: rel.cardinality || 'ONE_TO_ONE'
            });
          }
        }
      }
    }
  }

  const { relationships, ...rest } = cleanData;
  return {
    ...rest,
    tables
  };
};

const nodeTypes = { tableNode: TableNode };
const edgeTypes = { relationshipEdge: RelationshipEdge };

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { handleNodeDragStart, handleNodeDragStop } = useDrag();

  const toggleCardinality = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      const sourceCard = edge.data?.sourceCardinality ?? '1';
      const targetCard = edge.data?.targetCardinality ?? '1';
      
      let currentCard: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY' = 'ONE_TO_ONE';
      if (sourceCard === '1' && targetCard === '1') currentCard = 'ONE_TO_ONE';
      else if (sourceCard === '1' && targetCard === 'M') currentCard = 'ONE_TO_MANY';
      else if (sourceCard === 'M' && targetCard === '1') currentCard = 'MANY_TO_ONE';
      else if (sourceCard === 'M' && targetCard === 'M') currentCard = 'MANY_TO_MANY';

      let nextCard: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY' = 'ONE_TO_ONE';
      if (currentCard === 'ONE_TO_ONE') nextCard = 'ONE_TO_MANY';
      else if (currentCard === 'ONE_TO_MANY') nextCard = 'MANY_TO_ONE';
      else if (currentCard === 'MANY_TO_ONE') nextCard = 'MANY_TO_MANY';
      else if (currentCard === 'MANY_TO_MANY') nextCard = 'ONE_TO_ONE';

      setNodes((nds) =>
        nds.map((node) => {
          if (node.type !== 'tableNode') return node;
          const data = node.data as TableNodeData;
          const updatedAttributes = (data.attributes || []).map((attr) => {
            if (!attr.relations || attr.relations.length === 0) return attr;

            const updatedRelations = attr.relations.map((r) => {
              if (r.id !== edgeId) return r;
              return {
                ...r,
                cardinality: nextCard,
              };
            });

            return {
              ...attr,
              relations: updatedRelations,
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
    const newEdges = reconstructEdgesFromNodes(nodes, toggleCardinality);

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
  }, [nodes, edges, setEdges, toggleCardinality]);

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

      const relationId = `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.source) {
            const data = node.data as TableNodeData;
            const updatedAttributes = (data.attributes || []).map((attr) => {
              if (attr.id !== params.sourceHandle) return attr;

              const constraints = attr.constraints || [];
              const newConstraints = constraints.includes('FOREIGN_KEY')
                ? constraints
                : [...constraints, 'FOREIGN_KEY'];

              const relations = attr.relations || [];
              return {
                ...attr,
                constraints: newConstraints,
                relations: [
                  ...relations,
                  {
                    id: relationId,
                    role: 'SOURCE' as const,
                    tableId: params.target || '',
                    attributeId: params.targetHandle || '',
                    cardinality: 'ONE_TO_ONE' as const,
                  },
                ],
              };
            });
            return {
              ...node,
              data: {
                ...data,
                attributes: updatedAttributes,
              },
            };
          }

          if (node.id === params.target) {
            const data = node.data as TableNodeData;
            const updatedAttributes = (data.attributes || []).map((attr) => {
              if (attr.id !== params.targetHandle) return attr;

              const relations = attr.relations || [];
              return {
                ...attr,
                relations: [
                  ...relations,
                  {
                    id: relationId,
                    role: 'TARGET' as const,
                    tableId: params.source || '',
                    attributeId: params.sourceHandle || '',
                    cardinality: 'ONE_TO_ONE' as const,
                  },
                ],
              };
            });
            return {
              ...node,
              data: {
                ...data,
                attributes: updatedAttributes,
              },
            };
          }

          return node;
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
              if (!attr.relations || attr.relations.length === 0) return attr;

              const isSourceRelationDeleted = attr.relations.some(
                (r) => r.role === 'SOURCE' && removeChanges.some((c) => c.id === r.id)
              );
              
              const remainingRelations = attr.relations.filter(
                (r) => !removeChanges.some((c) => c.id === r.id)
              );

              let newConstraints = attr.constraints || [];
              if (isSourceRelationDeleted) {
                newConstraints = newConstraints.filter((con) => con !== 'FOREIGN_KEY');
              }

              return {
                ...attr,
                constraints: newConstraints,
                relations: remainingRelations.length > 0 ? remainingRelations : undefined,
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
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, setNodes]
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
            if (attr.relations && attr.relations.length > 0) {
              cleanAttr.relations = attr.relations;
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