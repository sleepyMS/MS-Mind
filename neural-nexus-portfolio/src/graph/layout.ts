import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3-force-3d";
import type { NodeType } from "../types/index.ts";

export interface GraphNode {
  id: string;
  type: NodeType;
  connections: readonly string[];
}

interface SimulationNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  z: number;
  fx?: number;
  fy?: number;
  fz?: number;
}

interface SimulationLink {
  source: string | SimulationNode;
  target: string | SimulationNode;
}

/** 번역 문구가 바뀌어도 물리 배치를 재시작하지 않도록 그래프 구조만 직렬화한다. */
export function getLayoutTopology(nodes: readonly GraphNode[]): string {
  return JSON.stringify(nodes.map(({ id, type, connections }) => ({
    id, type, connections: [...new Set(connections)].sort(),
  })).sort((left, right) => left.id.localeCompare(right.id)));
}

/** d3는 좌표와 링크를 변경하므로, 소유한 복사본만 시뮬레이션에 전달한다. */
export function calculateGraphLayout(nodes: readonly GraphNode[]): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  if (!nodes.length) return positions;

  const simulationNodes: SimulationNode[] = nodes.map((node, index) => ({
    id: node.id,
    type: node.type,
    x: Math.cos(index * 2.399963229728653) * 10,
    y: Math.sin(index * 2.399963229728653) * 10,
    z: ((index % 7) - 3) * 3,
    ...(node.type === "main" ? { fx: 0, fy: 0, fz: 0 } : {}),
  }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const seenLinks = new Set<string>();
  const links: SimulationLink[] = [];
  for (const node of nodes) {
    for (const targetId of node.connections) {
      if (targetId === node.id || !nodeIds.has(targetId)) continue;
      const key = JSON.stringify([node.id, targetId].sort());
      if (seenLinks.has(key)) continue;
      seenLinks.add(key);
      links.push({ source: node.id, target: targetId });
    }
  }

  const simulation = forceSimulation(simulationNodes, 3).stop();
  try {
    simulation
      .force("link", forceLink<SimulationNode, SimulationLink>(links)
        .id((node) => node.id)
        .distance((link) => {
          const source = link.source;
          const target = link.target;
          return (typeof source !== "string" && source.type === "main")
            || (typeof target !== "string" && target.type === "main") ? 8 : 5;
        }).strength(0.5))
      .force("charge", forceManyBody().strength(-80))
      .force("center", forceCenter(0, 0, 0))
      .force("collide", forceCollide().radius(2).strength(0.7));
    simulation.tick(300);
    for (const node of simulationNodes) positions.set(node.id, [node.x, node.y, node.z]);
    return positions;
  } finally {
    simulation.stop();
  }
}
