import React, { useState } from 'react';
import { type NodeProps, type Node, Handle, Position, useReactFlow } from '@xyflow/react';

export type Relation = {
  tableId: string;
  attributeId: string;
  cardinality: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
};

export type Attribute = {
  id: string;
  name: string;
  datatype: string;
  constraints: string[];
  relation?: Relation;
};

export type TableNodeData = {
  label: string;
  type?: string;
  attributes?: Attribute[];
};

type TableNodeProps = NodeProps<Node<TableNodeData, 'tableNode'>>;

const DATATYPES = [
  'INT',
  'VARCHAR',
  'TEXT',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'FLOAT',
  'DECIMAL'
];

const CONSTRAINTS = [
  { value: 'PRIMARY_KEY', label: 'Primary Key', icon: '🔑' },
  { value: 'FOREIGN_KEY', label: 'Foreign Key', icon: '🔗' },
  { value: 'UNIQUE', label: 'Unique', icon: '⭐' },
  { value: 'NOT_NULL', label: 'Not Null', icon: '!' }
];

const getConstraintIcons = (constraints: string[]) => {
  const icons: string[] = [];
  if (constraints.includes('PRIMARY_KEY')) icons.push('🔑');
  if (constraints.includes('FOREIGN_KEY')) icons.push('🔗');
  if (constraints.includes('UNIQUE')) icons.push('⭐');
  if (constraints.includes('NOT_NULL')) icons.push('!');
  return icons;
};

const TableNode = ({ id, data }: TableNodeProps) => {
  const { getNodes, updateNodeData } = useReactFlow();
  const attributes = data.attributes || [];

  const resolveRelationDetails = (relation: Relation) => {
    const allNodes = getNodes();
    const targetNode = allNodes.find(n => n.id === relation.tableId);
    if (!targetNode) return null;
    
    const targetData = targetNode.data as TableNodeData;
    const targetAttr = (targetData.attributes || []).find(a => a.id === relation.attributeId);
    if (!targetAttr) return null;
    
    return {
      tableName: targetData.label || '',
      attributeName: targetAttr.name || ''
    };
  };

  // Hover Card States
  const [hoveredAttrId, setHoveredAttrId] = useState<string | null>(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  // Modal Dialog States
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [editingAttrIndex, setEditingAttrIndex] = useState<number | null>(null);
  const [isAddingAttr, setIsAddingAttr] = useState(false);

  // Temporary form states for the modals
  const [tempName, setTempName] = useState('');
  const [tempDatatype, setTempDatatype] = useState('VARCHAR');
  const [tempConstraints, setTempConstraints] = useState<string[]>([]);
  
  // Relation form states
  const [tempRelationTableId, setTempRelationTableId] = useState('');
  const [tempRelationAttributeId, setTempRelationAttributeId] = useState('');
  const [tempRelationCardinality, setTempRelationCardinality] = useState<'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY'>('ONE_TO_ONE');

  // Hover handlers with 250ms delay
  const handleHeaderMouseEnter = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    const timer = setTimeout(() => {
      setHoveredAttrId(null);
      setIsHeaderHovered(true);
    }, 250);
    setHoverTimer(timer);
  };

  const handleHeaderMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setIsHeaderHovered(false);
  };

  const handleAttrMouseEnter = (attrId: string) => {
    if (hoverTimer) clearTimeout(hoverTimer);
    const timer = setTimeout(() => {
      setIsHeaderHovered(false);
      setHoveredAttrId(attrId);
    }, 250);
    setHoverTimer(timer);
  };

  const handleAttrMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setHoveredAttrId(null);
  };

  // Modal actions
  const openRenameTableModal = () => {
    setTempName(data.label);
    setIsEditingTable(true);
    setIsHeaderHovered(false);
  };

  const saveTableName = () => {
    updateNodeData(id, { label: tempName });
    setIsEditingTable(false);
  };

  const openAddAttrModal = () => {
    setTempName(`field_${attributes.length + 1}`);
    setTempDatatype('VARCHAR');
    setTempConstraints([]);
    setTempRelationTableId('');
    setTempRelationAttributeId('');
    setTempRelationCardinality('ONE_TO_ONE');
    setIsAddingAttr(true);
    setIsHeaderHovered(false);
  };

  const saveNewAttribute = () => {
    const newId = `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const relation = tempConstraints.includes('FOREIGN_KEY') && tempRelationTableId && tempRelationAttributeId
      ? {
          tableId: tempRelationTableId,
          attributeId: tempRelationAttributeId,
          cardinality: tempRelationCardinality
        }
      : undefined;

    const newAttributes: Attribute[] = [
      ...attributes,
      {
        id: newId,
        name: tempName,
        datatype: tempDatatype,
        constraints: tempConstraints,
        relation
      }
    ];
    updateNodeData(id, { attributes: newAttributes });
    setIsAddingAttr(false);
  };

  const openEditAttrModal = (index: number) => {
    const attr = attributes[index];
    setTempName(attr.name);
    setTempDatatype(attr.datatype);
    setTempConstraints(attr.constraints || []);
    if (attr.relation) {
      setTempRelationTableId(attr.relation.tableId);
      setTempRelationAttributeId(attr.relation.attributeId);
      setTempRelationCardinality(attr.relation.cardinality);
    } else {
      setTempRelationTableId('');
      setTempRelationAttributeId('');
      setTempRelationCardinality('ONE_TO_ONE');
    }
    setEditingAttrIndex(index);
    setHoveredAttrId(null);
  };

  const saveEditedAttribute = () => {
    if (editingAttrIndex === null) return;
    const relation = tempConstraints.includes('FOREIGN_KEY') && tempRelationTableId && tempRelationAttributeId
      ? {
          tableId: tempRelationTableId,
          attributeId: tempRelationAttributeId,
          cardinality: tempRelationCardinality
        }
      : undefined;

    const newAttributes = [...attributes];
    newAttributes[editingAttrIndex] = {
      ...newAttributes[editingAttrIndex],
      name: tempName,
      datatype: tempDatatype,
      constraints: tempConstraints,
      relation
    };
    updateNodeData(id, { attributes: newAttributes });
    setEditingAttrIndex(null);
  };

  const deleteAttribute = () => {
    if (editingAttrIndex === null) return;
    const newAttributes = attributes.filter((_, index) => index !== editingAttrIndex);
    updateNodeData(id, { attributes: newAttributes });
    setEditingAttrIndex(null);
  };

  const toggleConstraint = (value: string) => {
    if (tempConstraints.includes(value)) {
      setTempConstraints(tempConstraints.filter((c) => c !== value));
      if (value === 'FOREIGN_KEY') {
        setTempRelationTableId('');
        setTempRelationAttributeId('');
      }
    } else {
      setTempConstraints([...tempConstraints, value]);
      if (value === 'FOREIGN_KEY') {
        const allNodes = getNodes();
        const otherTables = allNodes.filter((n) => n.id !== id && n.type === 'tableNode') as Node<TableNodeData>[];
        if (otherTables.length > 0 && !tempRelationTableId) {
          setTempRelationTableId(otherTables[0].id);
          const otherAttrs = otherTables[0].data.attributes || [];
          if (otherAttrs.length > 0) {
            setTempRelationAttributeId(otherAttrs[0].id);
          }
        }
      }
    }
  };

  return (
    <div className="w-56 bg-zinc-950 text-white flex flex-col p-2.5 rounded-lg border border-zinc-800 shadow-xl relative select-none">
      
      {/* 1. Header (Table Name) */}
      <div 
        className="text-xs text-center font-bold border-b border-zinc-800 pb-2 mb-2 cursor-pointer py-1 hover:bg-zinc-900/50 rounded transition-colors relative"
        onMouseEnter={handleHeaderMouseEnter}
        onMouseLeave={handleHeaderMouseLeave}
      >
        {data.label}

        {/* Header Hover Card */}
        {isHeaderHovered && (
          <div 
            className="absolute left-full ml-4 top-0 z-50 bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-2xl w-40 backdrop-blur-md nodrag flex flex-col gap-2 before:absolute before:right-full before:top-0 before:w-5 before:h-full before:content-['']"
            onMouseEnter={() => setIsHeaderHovered(true)}
            onMouseLeave={() => setIsHeaderHovered(false)}
          >
            <div className="text-xs font-bold text-zinc-100 truncate border-b border-zinc-800 pb-1.5 text-left">
              Table: {data.label}
            </div>
            <button
              type="button"
              onClick={openRenameTableModal}
              className="w-full text-left text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-800 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              Rename Table
            </button>
            <button
              type="button"
              onClick={openAddAttrModal}
              className="w-full text-left text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-800 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              + Add Attribute
            </button>
          </div>
        )}
      </div>

      {/* 2. Attributes List */}
      {attributes.length > 0 && (
        <div className="flex flex-col gap-1">
          {attributes.map((attr, index) => (
            <div 
              key={attr.id} 
              className="relative w-full text-xs py-0.5"
            >
              {/* Left Handle (Target) */}
              <Handle
                type="target"
                position={Position.Left}
                id={attr.id}
                className="w-2 h-2 bg-zinc-500 border border-zinc-950"
                style={{ left: -10 }}
              />

              {/* Middle Hoverable Content Area */}
              <div
                className="flex flex-col py-1.5 px-2 hover:bg-zinc-900/40 rounded transition-colors cursor-pointer w-full"
                onMouseEnter={() => handleAttrMouseEnter(attr.id)}
                onMouseLeave={handleAttrMouseLeave}
              >
                <div className="flex justify-between items-center w-full">
                  {/* Left Side: Constraints Icons + Attribute Name */}
                  <div className="flex items-center gap-1.5 text-zinc-100 truncate pr-2 select-text pointer-events-none">
                    {attr.constraints && attr.constraints.length > 0 && (
                      <span className="flex items-center gap-1 select-none mr-0.5">
                        {getConstraintIcons(attr.constraints).map((icon, idx) => (
                          <span key={idx} className="text-[10px] tracking-tight font-semibold text-zinc-400">
                            {icon}
                          </span>
                        ))}
                      </span>
                    )}
                    <span className="truncate text-[11px] font-semibold">{attr.name}</span>
                  </div>

                  {/* Right Side: Datatype */}
                  <div className="text-[9px] font-mono text-zinc-400 shrink-0 select-none pl-2 pointer-events-none">
                    {attr.datatype}
                  </div>
                </div>

                {/* Relationship info below the attribute (if any) */}
                {attr.relation && (
                  (() => {
                    const resolved = resolveRelationDetails(attr.relation);
                    if (!resolved) return null;
                    
                    let cardLabel = '1 → 1';
                    if (attr.relation.cardinality === 'ONE_TO_MANY') cardLabel = '1 → M';
                    else if (attr.relation.cardinality === 'MANY_TO_ONE') cardLabel = 'M → 1';
                    else if (attr.relation.cardinality === 'MANY_TO_MANY') cardLabel = 'M → M';

                    return (
                      <div className="text-[9px] text-zinc-500 mt-1 border-t border-zinc-900/40 pt-1 flex flex-col gap-0.5 select-none pointer-events-none">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">🔗</span>
                          <span>References <strong className="text-zinc-400 font-medium">{resolved.tableName}.{resolved.attributeName}</strong></span>
                        </div>
                        <div className="text-[8px] text-zinc-600 font-semibold uppercase tracking-wider pl-3.5">
                          Cardinality: {cardLabel}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Right Handle (Source) */}
              <Handle
                type="source"
                position={Position.Right}
                id={attr.id}
                className="w-2 h-2 bg-zinc-500 border border-zinc-950"
                style={{ right: -10 }}
              />

              {/* Attribute Hover Card */}
              {hoveredAttrId === attr.id && (
                <div
                  className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50 bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg shadow-2xl w-40 backdrop-blur-md nodrag flex flex-col gap-2 text-left text-xs before:absolute before:right-full before:top-0 before:w-5 before:h-full before:content-['']"
                  onMouseEnter={() => setHoveredAttrId(attr.id)}
                  onMouseLeave={() => setHoveredAttrId(null)}
                >
                  <div>
                    <div className="font-bold text-zinc-100 truncate text-[11px] select-text">
                      {attr.name}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-400 select-text mt-0.5">
                      Type: <span className="text-zinc-200">{attr.datatype}</span>
                    </div>
                  </div>

                  {attr.constraints && attr.constraints.length > 0 && (
                    <div className="flex flex-col gap-0.5 border-t border-zinc-800/80 pt-1">
                      <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-semibold">Constraints</span>
                      <div className="flex flex-col gap-0.5 text-zinc-300 text-[9px]">
                        {attr.constraints.map((c) => {
                          const item = CONSTRAINTS.find((con) => con.value === c);
                          return (
                            <div key={c} className="flex items-center gap-1 text-zinc-200">
                              <span>{item?.icon}</span>
                              <span className="font-medium text-[9px]">{item?.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditAttrModal(index)}
                    className="mt-1 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-[9px] py-1 rounded text-center transition-all cursor-pointer font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Edit Attribute Dialog */}
              {editingAttrIndex === index && (
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl shadow-2xl w-60 text-white flex flex-col gap-3 text-left nodrag animate-in fade-in zoom-in-95 duration-150">
                  <h3 className="text-xs font-bold border-b border-zinc-800 pb-1.5">Edit Attribute</h3>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Attribute Name</label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full"
                      placeholder="Attribute Name"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Datatype</label>
                    <select
                      value={tempDatatype}
                      onChange={(e) => setTempDatatype(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full cursor-pointer"
                    >
                      {DATATYPES.map((dt) => (
                        <option key={dt} value={dt}>{dt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Constraints</label>
                    <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                      {CONSTRAINTS.map((c) => {
                        const isChecked = tempConstraints.includes(c.value);
                        return (
                          <label key={c.value} className="flex items-center gap-1.5 text-[10px] text-zinc-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleConstraint(c.value)}
                              className="accent-zinc-500 rounded border-zinc-800 bg-zinc-900 focus:ring-0 cursor-pointer w-3 h-3"
                            />
                            <span>{c.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Foreign Key Relation Fields */}
                  {tempConstraints.includes('FOREIGN_KEY') && (
                    <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-400 uppercase tracking-wider">References Table</label>
                        <select
                          value={tempRelationTableId}
                          onChange={(e) => {
                            const selectedTableId = e.target.value;
                            setTempRelationTableId(selectedTableId);
                            const allNodes = getNodes();
                            const targetTable = allNodes.find(n => n.id === selectedTableId) as Node<TableNodeData> | undefined;
                            if (targetTable) {
                              const targetAttrs = targetTable.data.attributes || [];
                              setTempRelationAttributeId(targetAttrs[0]?.id || '');
                            } else {
                              setTempRelationAttributeId('');
                            }
                          }}
                          className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full cursor-pointer"
                        >
                          <option value="">Select Table...</option>
                          {(getNodes()
                            .filter((n) => n.id !== id && n.type === 'tableNode') as Node<TableNodeData>[])
                            .map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.data.label}
                              </option>
                            ))}
                        </select>
                      </div>

                      {tempRelationTableId && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-zinc-400 uppercase tracking-wider">References Column</label>
                          <select
                            value={tempRelationAttributeId}
                            onChange={(e) => setTempRelationAttributeId(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full cursor-pointer"
                          >
                            <option value="">Select Column...</option>
                            {((getNodes().find((n) => n.id === tempRelationTableId) as Node<TableNodeData> | undefined)?.data.attributes || []).map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Cardinality</label>
                        <select
                          value={tempRelationCardinality}
                          onChange={(e) => setTempRelationCardinality(e.target.value as any)}
                          className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full cursor-pointer"
                        >
                          <option value="ONE_TO_ONE">One to One (1 → 1)</option>
                          <option value="ONE_TO_MANY">One to Many (1 → M)</option>
                          <option value="MANY_TO_ONE">Many to One (M → 1)</option>
                          <option value="MANY_TO_MANY">Many to Many (M → M)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] mt-2">
                    <button
                      type="button"
                      onClick={deleteAttribute}
                      className="px-2 py-1 bg-red-950/40 hover:bg-red-950 border border-red-900/60 rounded text-red-400 hover:text-red-300 cursor-pointer transition-colors text-[9px]"
                    >
                      Delete
                    </button>
                    
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingAttrIndex(null)}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEditedAttribute}
                        className="px-2.5 py-1 bg-zinc-100 text-zinc-950 hover:bg-white rounded font-medium cursor-pointer transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. Rename Table Dialog */}
      {isEditingTable && (
        <div className="absolute left-full ml-4 top-0 z-50 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl shadow-2xl w-56 text-white flex flex-col gap-3 text-left nodrag animate-in fade-in zoom-in-95 duration-150">
          <h3 className="text-xs font-bold border-b border-zinc-800 pb-1.5">Rename Table</h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Table Name</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full"
              placeholder="Table Name"
            />
          </div>

          <div className="flex justify-end gap-1.5 text-[10px] mt-1">
            <button
              type="button"
              onClick={() => setIsEditingTable(false)}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveTableName}
              className="px-2.5 py-1 bg-zinc-100 text-zinc-950 hover:bg-white rounded font-medium cursor-pointer transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* 4. Add Attribute Dialog */}
      {isAddingAttr && (
        <div className="absolute left-full ml-4 top-0 z-50 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl shadow-2xl w-60 text-white flex flex-col gap-3 text-left nodrag animate-in fade-in zoom-in-95 duration-150">
          <h3 className="text-xs font-bold border-b border-zinc-800 pb-1.5">Add Attribute</h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Attribute Name</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full"
              placeholder="Attribute Name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Datatype</label>
            <select
              value={tempDatatype}
              onChange={(e) => setTempDatatype(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full cursor-pointer"
            >
              {DATATYPES.map((dt) => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Constraints</label>
            <div className="grid grid-cols-2 gap-1.5 mt-0.5">
              {CONSTRAINTS.map((c) => {
                const isChecked = tempConstraints.includes(c.value);
                return (
                  <label key={c.value} className="flex items-center gap-1.5 text-[10px] text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleConstraint(c.value)}
                      className="accent-zinc-500 rounded border-zinc-800 bg-zinc-900 focus:ring-0 cursor-pointer w-3 h-3"
                    />
                    <span>{c.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Foreign Key Relation Fields */}
          {tempConstraints.includes('FOREIGN_KEY') && (
            <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-zinc-400 uppercase tracking-wider">References Table</label>
                <select
                  value={tempRelationTableId}
                  onChange={(e) => {
                    const selectedTableId = e.target.value;
                    setTempRelationTableId(selectedTableId);
                    const allNodes = getNodes();
                    const targetTable = allNodes.find(n => n.id === selectedTableId) as Node<TableNodeData> | undefined;
                    if (targetTable) {
                      const targetAttrs = targetTable.data.attributes || [];
                      setTempRelationAttributeId(targetAttrs[0]?.id || '');
                    } else {
                      setTempRelationAttributeId('');
                    }
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full cursor-pointer"
                >
                  <option value="">Select Table...</option>
                  {(getNodes()
                    .filter((n) => n.id !== id && n.type === 'tableNode') as Node<TableNodeData>[])
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.data.label}
                      </option>
                    ))}
                </select>
              </div>

              {tempRelationTableId && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 uppercase tracking-wider">References Column</label>
                  <select
                    value={tempRelationAttributeId}
                    onChange={(e) => setTempRelationAttributeId(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full cursor-pointer"
                  >
                    <option value="">Select Column...</option>
                    {((getNodes().find((n) => n.id === tempRelationTableId) as Node<TableNodeData> | undefined)?.data.attributes || []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-zinc-400 uppercase tracking-wider">Cardinality</label>
                <select
                  value={tempRelationCardinality}
                  onChange={(e) => setTempRelationCardinality(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-500 w-full cursor-pointer"
                >
                  <option value="ONE_TO_ONE">One to One (1 → 1)</option>
                  <option value="ONE_TO_MANY">One to Many (1 → M)</option>
                  <option value="MANY_TO_ONE">Many to One (M → 1)</option>
                  <option value="MANY_TO_MANY">Many to Many (M → M)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-1.5 text-[10px] mt-2">
            <button
              type="button"
              onClick={() => setIsAddingAttr(false)}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveNewAttribute}
              className="px-2.5 py-1 bg-zinc-100 text-zinc-950 hover:bg-white rounded font-medium cursor-pointer transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableNode;