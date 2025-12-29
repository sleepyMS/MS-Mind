/**
 * 정규화된 노드 데이터 (다국어 지원)
 *
 * 이 파일은 언어에 따라 적절한 nodes.{lang}.json을 로드하고
 * 양방향 연결을 자동 생성합니다.
 * 앱의 모든 컴포넌트는 이 파일에서 데이터를 import해야 합니다.
 */
import nodesKo from "./nodes.ko.json";
import nodesEn from "./nodes.en.json";
import { normalizeConnections } from "../utils/connectionUtils";
import type { NeuralData } from "../types";

// 언어별 정규화된 데이터 캐시
const normalizedData: Record<string, NeuralData> = {
  ko: normalizeConnections(nodesKo as NeuralData),
  en: normalizeConnections(nodesEn as NeuralData),
};

// 현재 언어에 맞는 데이터 반환
export function getNodesData(language: string): NeuralData {
  return normalizedData[language] || normalizedData.ko;
}

// 기본 export (ko) - 기존 호환성 유지
export const nodesData: NeuralData = normalizedData.ko;

// 개별 노드 조회 헬퍼
export function getNodeById(id: string, language: string = "ko") {
  const data = getNodesData(language);
  return data.nodes.find((node) => node.id === id);
}

// 노드의 연결된 노드들 조회
export function getConnectedNodes(nodeId: string, language: string = "ko") {
  const data = getNodesData(language);
  const node = data.nodes.find((n) => n.id === nodeId);
  if (!node) return [];

  return node.connections
    .map((connId) => data.nodes.find((n) => n.id === connId))
    .filter(Boolean);
}
