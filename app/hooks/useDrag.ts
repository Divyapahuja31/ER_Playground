import { useState } from 'react';
import { OnNodeDrag, useReactFlow, type Node } from '@xyflow/react';
import { isColliding } from '../utils/conllision';

type position = {
  x: number,
  y: number
}

function useDrag() {
  const [lastPosition, setLastPosition] = useState<position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const { getNodes, setNodes } = useReactFlow();

  const handleNodeDragStart: OnNodeDrag = (event, node) => {
    setIsDragging(true);
    setLastPosition(({ x: node.position.x, y: node.position.y }))
  }

  const handleNodeDragStop: OnNodeDrag = (event, currentNode) => {
    setIsDragging(false);
    const otherNodes = getNodes().filter((n) => n.id !== currentNode.id);
    const IsColliding = isColliding(currentNode, otherNodes);

    if(IsColliding){
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === currentNode.id) {
            return { ...n, position: lastPosition };
          }
          return n;
        })
      );
    }
  };

  return { lastPosition, isDragging, handleNodeDragStart, handleNodeDragStop };

}

export default useDrag