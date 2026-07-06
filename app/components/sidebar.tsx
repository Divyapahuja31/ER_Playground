import React from 'react'
import SidebarTab from './sidebarTab';
import SidebarInnerView from './sidebarInnerView';
const Sidebar = () => {
  return (
    <div className="w-80 h-full border-r border-slate-200 bg-white gray:border-zinc-800 light:bg-zinc-900 shrink-0">
      <div className='w-auto h-10 flex'>
        <SidebarTab name='Tables' />
        <SidebarTab name='Relationships'/>
        <SidebarTab name='Notes'/>
      </div>
      <SidebarInnerView name='Table'/>
    </div>
  )
}

export default Sidebar;
