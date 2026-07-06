import React, { useEffect, useState } from 'react'
import { useNodes,useReactFlow } from '@xyflow/react'

import SideBarNode from "./sidebarNode"
import useNodeInsertion from '../hooks/useNodeInsertion';

const SideInnerView = ({ name }: { name: string }) => {
  const nodes = useNodes();
  const { addNode } = useNodeInsertion();

  const handleOnClick = () => {
    addNode();
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
        {nodes && nodes.length > 0 ? nodes.map((item) => <SideBarNode key={item.id} node={item} />) : "Nothing "}
      </div>
    </div>
  )

}

export default SideInnerView