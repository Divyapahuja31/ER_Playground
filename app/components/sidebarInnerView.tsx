import React, { useState } from 'react'

import SideBarNode from "./sidebarNode"

const SideInnerView = ({ name }: { name: string }) => {
  const [nodes, setNodes] = useState<[]>([])

  return (
    <div className='m-5'>
      <div>
        <input
          id="name-input"
          type="text"
          placeholder='Search.....'
        />
        <button>
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