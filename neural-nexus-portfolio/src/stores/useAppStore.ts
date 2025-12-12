import { create } from "zustand";
import type { AppState } from "../types";

/**
 * 전역 상태 스토어
 * Zustand를 사용하여 노드, 카메라, 모달 상태 관리
 */
export const useAppStore = create<AppState>((set) => ({
  // 노드 상태
  activeNode: null, // 현재 선택된 노드
  hoveredNode: null, // 현재 호버중인 노드
  highlightedNodes: [], // 하이라이트된 노드들

  // 모달 상태
  isModalOpen: false,

  // 카메라 상태
  cameraTarget: null, // 카메라 이동 목표 좌표
  isAnimating: false, // 애니메이션 진행 중 여부

  // 계산된 노드 위치 (포스 시뮬레이션 결과)
  nodePositions: new Map(),

  // 상태 변경 액션들
  setActiveNode: (id) => set({ activeNode: id }),
  setHoveredNode: (id) => set({ hoveredNode: id }),
  setHighlightedNodes: (ids) => set({ highlightedNodes: ids }),
  setModalOpen: (open) => set({ isModalOpen: open }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setIsAnimating: (animating) => set({ isAnimating: animating }),
  setNodePositions: (positions) => set({ nodePositions: positions }),
}));
