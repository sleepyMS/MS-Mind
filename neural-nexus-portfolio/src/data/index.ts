/**
 * 정규화된 노드 데이터
 *
 * 이 파일은 nodes.json을 로드하고 양방향 연결을 자동 생성합니다.
 * 앱의 모든 컴포넌트는 이 파일에서 데이터를 import해야 합니다.
 */
import rawNodesData from "./nodes.json";
import { normalizeConnections } from "../utils/connectionUtils";
import type { NeuralData } from "../types";

// 앱 시작 시 한 번만 정규화 수행
export const nodesData: NeuralData = normalizeConnections(
  rawNodesData as NeuralData
);

// 개별 노드 조회 헬퍼
export function getNodeById(id: string) {
  return nodesData.nodes.find((node) => node.id === id);
}

// 노드의 연결된 노드들 조회
export function getConnectedNodes(nodeId: string) {
  const node = getNodeById(nodeId);
  if (!node) return [];

  return node.connections.map((connId) => getNodeById(connId)).filter(Boolean);
}
