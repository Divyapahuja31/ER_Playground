import { Node } from '@xyflow/react';

const SideBarNode = ({ node }: { node: Node }) => {
  return (
    <div className="h-10 w-full bg-cyan-400 m-2 flex items-center p-2 rounded text-zinc-950 font-medium">
      {node.data?.label as React.ReactNode}
    </div>
  )
}

export default SideBarNode;