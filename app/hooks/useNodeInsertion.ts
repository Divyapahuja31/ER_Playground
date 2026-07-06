import { useReactFlow } from '@xyflow/react';
import { isColliding } from '../utils/conllision';

function useNodeInsertion() {
  const { addNodes, getNodes} = useReactFlow();

  const addNode = () => {
    const id = `${Date.now()}`;
    const newNode = {
      id,
      type: 'default',
      data: { label: `Node ${id.slice(-4)}` },
      position: { x:0, y: 0 },
    };

    let angle = 0;
    let radius = 0;
    const STEP = 40;

    while(isColliding(newNode, getNodes())){

      radius += STEP * 0.1;
      angle += 0.5;

      newNode.position.x = Math.round(newNode.position.x + radius * Math.cos(angle));
      newNode.position.y = Math.round(newNode.position.y + radius * Math.sin(angle));
    }
    addNodes(newNode);
  }
  return { addNode}
}

export default useNodeInsertion