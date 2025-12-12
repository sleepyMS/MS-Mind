/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect } from "react";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
} from "d3-force-3d";
import type { NeuralNode } from "../types";
import { useAppStore } from "../stores/useAppStore";

// 시뮬레이션용 노드 인터페이스 (위치 및 속도 정보 포함)
interface SimNode extends NeuralNode {
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number | null; // 고정 x 좌표
  fy?: number | null; // 고정 y 좌표
  fz?: number | null; // 고정 z 좌표
}

// 시뮬레이션용 링크 인터페이스
interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
}

/**
 * D3-force-3d를 사용하여 노드들의 유기적인 3D 배치를 계산하는 훅
 * @param nodes - 신경망 노드 배열
 * @returns 노드 ID를 키로 하고 3D 좌표를 값으로 하는 Map
 */
export function useForceGraph(nodes: NeuralNode[]) {
  const setNodePositions = useAppStore((state) => state.setNodePositions);

  // 포스 시뮬레이션을 실행하여 노드 위치 계산
  const positions = useMemo(() => {
    if (nodes.length === 0) return new Map<string, [number, number, number]>();

    // 시뮬레이션 노드 생성 (초기 위치를 랜덤하게 분산)
    const simNodes: SimNode[] = nodes.map((node) => ({
      ...node,
      // 초기 위치를 20 단위 범위 내에서 랜덤 배치
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
    }));

    // 메인 노드(나)를 중앙에 고정
    const mainNode = simNodes.find((n) => n.type === "main");
    if (mainNode) {
      mainNode.fx = 0;
      mainNode.fy = 0;
      mainNode.fz = 0;
    }

    // 연결 정보로부터 링크 배열 생성
    const links: SimLink[] = [];
    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        // 중복 링크 방지
        const exists = links.some(
          (link) =>
            (link.source === node.id && link.target === targetId) ||
            (link.source === targetId && link.target === node.id)
        );
        if (!exists && nodes.some((n) => n.id === targetId)) {
          links.push({ source: node.id, target: targetId });
        }
      });
    });

    // 3D 포스 시뮬레이션 생성
    const simulation = forceSimulation(simNodes, 3) as any;
    simulation
      .force(
        "link",
        (forceLink(links) as any)
          .id((d: any) => d.id)
          .distance((link: any) => {
            // 메인 노드와의 연결은 더 짧게 설정
            const source = link.source;
            const target = link.target;
            if (source.type === "main" || target.type === "main") {
              return 8;
            }
            return 5;
          })
          .strength(0.5)
      )
      .force("charge", forceManyBody().strength(-80)) // 노드 간 반발력
      .force("center", forceCenter(0, 0, 0)) // 중심으로 끌어당김
      .force("collide", (forceCollide() as any).radius(2).strength(0.7)); // 노드 충돌 방지

    // 시뮬레이션을 동기적으로 300회 반복 실행
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }
    simulation.stop();

    // 계산된 위치를 Map으로 추출
    const positionMap = new Map<string, [number, number, number]>();
    simNodes.forEach((node) => {
      positionMap.set(node.id, [node.x || 0, node.y || 0, node.z || 0]);
    });

    return positionMap;
  }, [nodes]);

  // 스토어에 위치 정보 업데이트
  useEffect(() => {
    setNodePositions(positions);
  }, [positions, setNodePositions]);

  return positions;
}
