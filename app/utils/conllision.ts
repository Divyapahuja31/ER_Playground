import { type Node } from '@xyflow/react';

export const resolveCollisions = (node: Node, nodes: Node[]) => {
  let draggedNodeCenterX = node.position.x;
  let draggedNodeCenterY = node.position.y;

  nodes.map(selectedNode => {
    const selectedNodeCenterX = selectedNode.position.x;
    const selectedNodeCenterY = selectedNode.position.y;

    const dx = draggedNodeCenterX - selectedNodeCenterX;
    const dy = draggedNodeCenterY - selectedNodeCenterY;


    if (Math.abs(dy) < 10 && Math.abs(dx) < 10) {
      draggedNodeCenterX += 10
      draggedNodeCenterY += 10
    }
  })

  node.position.x += draggedNodeCenterX;
  node.position.y += draggedNodeCenterY;

}