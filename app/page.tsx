'use client';


import Sidebar from './components/sidebar';
import Canvas from './components/canvas';

export default function FlowPage() {


  return (
    <main className="flex w-screen h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <Sidebar />
      <Canvas />
    </main>
  );
}