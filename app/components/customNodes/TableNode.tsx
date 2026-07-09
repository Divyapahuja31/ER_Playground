import React from 'react';
import { type NodeProps, type Node, Handle, Position, useReactFlow } from '@xyflow/react';

type Field = {
  id: string;
  label: string;
};

type TableNodeData = {
  label: string;
  type?: string;
  fields?: Field[];
};

type TableNodeProps = NodeProps<Node<TableNodeData, 'tableNode'>>;

const TableNode = ({ id, data }: TableNodeProps) => {
  const { updateNodeData } = useReactFlow();
  const fields = data.fields || [];

  const addField = () => {
    const newFields = [
      ...fields,
      {
        id: `field-${fields.length + 1}`,
        label: `field_${fields.length + 1}`,
      },
    ];
    updateNodeData(id, { fields: newFields });
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = {
      ...newFields[index],
      label: value,
    };
    updateNodeData(id, { fields: newFields });
  };

  const removeField = (indexToRemove: number) => {
    const newFields = fields.filter((_, index) => index !== indexToRemove);
    updateNodeData(id, { fields: newFields });
  };

  return (
    <div className="w-36 bg-zinc-950 text-white flex flex-col p-2.5 rounded-lg border border-zinc-800 shadow-xl">
      <div className="text-xs text-center font-bold border-b border-zinc-800 pb-1.5 mb-1.5 select-none">
        {data.label}
      </div>

      {fields.length > 0 && (
        <div className="flex flex-col gap-1 mb-1.5">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-1 nodrag w-full relative">
              <Handle
                type="target"
                position={Position.Left}
                id={field.id}
                className="w-2 h-2 bg-zinc-500 border border-zinc-950"
                style={{ left: -10 }}
              />

              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(index, e.target.value)}
                className="flex-1 min-w-0 bg-zinc-900 text-zinc-100 text-[10px] border border-zinc-800 rounded px-1.5 py-0.5 focus:outline-none focus:border-zinc-500"
                placeholder="Field name"
              />

              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-zinc-500 hover:text-red-400 px-1 rounded hover:bg-zinc-900 transition-colors text-xs font-semibold shrink-0"
                title="Remove field"
              >
                &times;
              </button>

              <Handle
                type="source"
                position={Position.Right}
                id={field.id}
                className="w-2 h-2 bg-zinc-500 border border-zinc-950"
                style={{ right: -10 }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="nodrag mt-auto">
        <button
          type="button"
          onClick={addField}
          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[10px] py-1 rounded-md cursor-pointer transition-all duration-200 active:scale-[0.98]"
        >
          + Add Field
        </button>
      </div>
    </div>
  );
};

export default TableNode;