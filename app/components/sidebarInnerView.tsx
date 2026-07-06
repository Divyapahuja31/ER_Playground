import React, { useState } from 'react'

const SideInnerView = () => {
  const [tables, setTables] = useState([])
  return (
    <div className='m-5'>
      <div>
        <input
          id="name-input"
          type="text"
          placeholder='Search.....'
        />
        <button>
          Add Table
        </button>
      </div>
      <div>
        {tables && tables.length > 0 ? tables.map((item, key) => <div key={key}>{item}</div>) : "Nothing "}
      </div>
    </div>
  )

}

export default SideInnerView