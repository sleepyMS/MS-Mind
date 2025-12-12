import { create } from "zustand";
import type { AppState, NodeType, ThemeType } from "../types";

/**
 * 전역 상태 스토어
 * Zustand를 사용하여 노드, 카메라, 모달, UI 상태 관리
 */
export const useAppStore = create<AppState>((set, get) => ({
  // 노드 상태
  activeNode: null, // 현재 선택된 노드
  hoveredNode: null, // 현재 호버중인 노드
  highlightedNodes: [], // 하이라이트된 노드들

  // 모달 상태
  isModalOpen: false,

  // 카메라 상태
  cameraTarget: null, // 카메라 이동 목표 좌표
  isAnimating: false, // 애니메이션 진행 중 여부

  // UI 상태
  visibleNodeTypes: ["main", "project", "skill"], // 기본: 모든 타입 표시
  isSidePanelOpen: true, // 사이드 패널 기본 열림
  isLoading: true, // 초기 로딩 상태
  searchQuery: "", // 검색어
  theme: "dark", // 기본 다크 테마
  isThemeTransitioning: false, // 테마 전환 애니메이션 상태
  sceneRotation: 0, // 초기 회전값 0

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

  // UI 액션들
  toggleNodeType: (type: NodeType) => {
    const current = get().visibleNodeTypes;
    const isVisible = current.includes(type);

    // 최소 1개의 타입은 항상 보이도록
    if (isVisible && current.length === 1) return;

    set({
      visibleNodeTypes: isVisible
        ? current.filter((t) => t !== type)
        : [...current, type],
    });
  },
  setSidePanelOpen: (open) => set({ isSidePanelOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTheme: (theme: ThemeType) => set({ theme }),
  toggleTheme: () => {
    set((state) => ({
      isThemeTransitioning: true,
      theme: state.theme === "dark" ? "light" : "dark",
      sceneRotation: state.sceneRotation + Math.PI, // 180도 회전 추가
    }));

    setTimeout(() => {
      set({ isThemeTransitioning: false });
    }, 2000);
  },
  setThemeTransitioning: (transitioning: boolean) =>
    set({ isThemeTransitioning: transitioning }),
}));
