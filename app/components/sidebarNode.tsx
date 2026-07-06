import { Node } from '@xyflow/react';

const SideBarNode = ({ node }: { node: Node }) => {
  return (
    <div
      className={`h-10 w-full bg-black m-2 flex items-center p-2 rounded text-zinc-50 font-medium ${
        node.selected ? 'border border-red-500 shadow-[0_0_10px_red]' : 'border-2 border-transparent'
      }`}
    >
      {node.data?.label as React.ReactNode}
    </div>
  )
}

export default SideBarNode;