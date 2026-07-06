import { type Node } from '@xyflow/react';

const COLLISION_THRESHOLD = 10;

const isColliding = (currentNode: Node, Nodes: Node[]) => {
  return Nodes.some(node => {
    return (Math.abs(node.position.x - currentNode.position.x) < COLLISION_THRESHOLD && Math.abs(node.position.y - currentNode.position.y) < COLLISION_THRESHOLD);
  });
};

export { isColliding}