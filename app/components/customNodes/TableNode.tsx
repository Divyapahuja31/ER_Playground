import React, { useState } from 'react';
import { type NodeProps, type Node, Handle, Position, useReactFlow } from '@xyflow/react';

export type Attribute = {
  id: string;
  name: string;
  datatype: string;
  constraints: string[];
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
  const { updateNodeData } = useReactFlow();
  const attributes = data.attributes || [];

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
    setIsAddingAttr(true);
    setIsHeaderHovered(false);
  };

  const saveNewAttribute = () => {
    const newId = `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAttributes: Attribute[] = [
      ...attributes,
      {
        id: newId,
        name: tempName,
        datatype: tempDatatype,
        constraints: tempConstraints
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
    setEditingAttrIndex(index);
    setHoveredAttrId(null);
  };

  const saveEditedAttribute = () => {
    if (editingAttrIndex === null) return;
    const newAttributes = [...attributes];
    newAttributes[editingAttrIndex] = {
      ...newAttributes[editingAttrIndex],
      name: tempName,
      datatype: tempDatatype,
      constraints: tempConstraints
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
    } else {
      setTempConstraints([...tempConstraints, value]);
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
                className="flex justify-between items-center py-1 px-2 hover:bg-zinc-900/40 rounded transition-colors cursor-pointer w-full"
                onMouseEnter={() => handleAttrMouseEnter(attr.id)}
                onMouseLeave={handleAttrMouseLeave}
              >
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
                  <span className="truncate text-[11px]">{attr.name}</span>
                </div>

                {/* Right Side: Datatype */}
                <div className="text-[9px] font-mono text-zinc-400 shrink-0 select-none pl-2 pointer-events-none">
                  {attr.datatype}
                </div>
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