import type { NeuralNode, NeuralData } from "../types";

/**
 * 노드 데이터를 전처리하여 양방향 연결을 자동 생성합니다.
 *
 * 예: A가 B를 연결하면, B도 자동으로 A를 연결합니다.
 * 이로써 nodes.json에서는 한 방향만 정의해도 됩니다.
 */
export function normalizeConnections(data: NeuralData): NeuralData {
  // 노드 ID → 노드 객체 매핑
  const nodeMap = new Map<string, NeuralNode>();
  data.nodes.forEach((node) => {
    nodeMap.set(node.id, { ...node, connections: [...node.connections] });
  });

  // 각 노드의 연결을 순회하며 역방향 연결 추가
  data.nodes.forEach((node) => {
    node.connections.forEach((targetId) => {
      const targetNode = nodeMap.get(targetId);
      if (targetNode && !targetNode.connections.includes(node.id)) {
        // 역방향 연결이 없으면 추가
        targetNode.connections.push(node.id);
      }
    });
  });

  return {
    ...data,
    nodes: Array.from(nodeMap.values()),
  };
}

/**
 * 연결 통계를 반환합니다 (디버깅용)
 */
export function getConnectionStats(data: NeuralData): {
  totalConnections: number;
  bidirectionalPairs: number;
  unidirectionalConnections: string[];
} {
  let totalConnections = 0;
  let bidirectionalPairs = 0;
  const unidirectionalConnections: string[] = [];

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));

  data.nodes.forEach((node) => {
    node.connections.forEach((targetId) => {
      totalConnections++;
      const targetNode = nodeMap.get(targetId);
      if (targetNode?.connections.includes(node.id)) {
        bidirectionalPairs++;
      } else {
        unidirectionalConnections.push(`${node.id} → ${targetId}`);
      }
    });
  });

  return {
    totalConnections,
    bidirectionalPairs: bidirectionalPairs / 2, // 양방향은 두 번 카운트되므로
    unidirectionalConnections,
  };
}
