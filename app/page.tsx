'use client';
import Canvas from './components/canvas';

export default function FlowPage() {
  return (
    <main className="flex w-screen h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <Canvas />
    </main>
  );
}