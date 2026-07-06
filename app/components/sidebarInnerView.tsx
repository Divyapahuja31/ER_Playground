import React, { useEffect, useState } from 'react'
import { useNodes,useReactFlow } from '@xyflow/react'

import SideBarNode from "./sidebarNode"

const SideInnerView = ({ name }: { name: string }) => {
  const data = useNodes();
  const { addNodes } = useReactFlow();
  const [nodes, setNodes] = useState(data)

  useEffect(()=>{
    console.log(data)
  },[])

  const handleOnClick = () => {
    const id = `${Date.now()}`;
    const newNode = {
      id,
      type: 'default',
      data: { label: `Node ${id.slice(-4)}` },
      position: { x:0, y: 0 },
    };
    addNodes(newNode);
  }

  return (
    <div className='m-5'>
      <div>
        <input
          id="name-input"
          type="text"
          placeholder='Search.....'
        />
        <button onClick={handleOnClick}>
          Add {name}
        </button>
      </div>
      <div>
        {nodes && nodes.length > 0 ? nodes.map((item, key) => <SideBarNode key={key} />) : "Nothing "}
      </div>
    </div>
  )

}

export default SideInnerView