import React from 'react'

const SidebarTab = ({ name }: { name: string }) => {
  return (
    <div className='w-24 m-5 bg-black color text-center text-black'>{name}</div>
  )
}

export default SidebarTab