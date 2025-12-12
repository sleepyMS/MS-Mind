// 신경망 시각화를 위한 노드 타입 정의
export type NodeType = "main" | "project" | "skill" | "lesson";
export type ThemeType = "dark" | "light";

/**
 * 노드 상세 정보 인터페이스
 */
export interface NodeDetails {
  description: string; // 설명
  trouble?: string; // 겪은 어려움 (Simple version)
  shooting?: string; // 해결 과정 (Simple version)
  lesson?: string; // 배운 점 (Simple version)
  technologies?: string[]; // 사용 기술
  link?: string; // 외부 링크 (Github)
  deployLink?: string; // 배포 링크 (Vercel etc)
  image?: string; // 이미지 경로
  features?: { title: string; items: string[] }[]; // 주요 기능 (Detailed)
  optimizations?: { title: string; items: string[] }[]; // 최적화 내용 (Detailed)
  challenges?: { title: string; problem: string; solution: string }[]; // 트러블 슈팅 (Detailed)
  learnings?: { title: string; content: string }[]; // 배운 점 (Detailed)
  techStackDocs?: { name: string; description: string }[]; // 기술 스택 선정 이유
  coreFeatures?: string[]; // 핵심 특징 (반응형, 접근성 등)
}

/**
 * 뉴런 노드 인터페이스
 */
export interface NeuralNode {
  id: string; // 고유 ID
  type: NodeType; // 노드 타입
  label: string; // 표시 이름
  connections: string[]; // 연결된 노드 ID 배열
  position?: [number, number, number]; // 초기 위치 (선택적)
  details?: NodeDetails; // 상세 정보
  color?: string; // 노드 색상
}

/**
 * 뉴런 데이터 (JSON 구조)
 */
export interface NeuralData {
  nodes: NeuralNode[];
}

/**
 * 카메라 상태 인터페이스 (비행 애니메이션용)
 */
export interface CameraState {
  position: [number, number, number]; // 카메라 위치
  target: [number, number, number]; // 바라보는 대상 위치
}

/**
 * Zustand로 관리되는 앱 상태 인터페이스
 */
export interface AppState {
  // 노드 상태
  activeNode: string | null; // 현재 선택된 노드 ID
  hoveredNode: string | null; // 현재 호버 중인 노드 ID
  highlightedNodes: string[]; // 하이라이트된 노드 ID 배열

  // 모달 상태
  isModalOpen: boolean;

  // 카메라 상태
  cameraTarget: [number, number, number] | null; // 카메라 이동 목표
  isAnimating: boolean; // 애니메이션 진행 중 여부

  // UI 상태
  visibleNodeTypes: NodeType[]; // 표시할 노드 타입 필터
  isSidePanelOpen: boolean; // 사이드 패널 열림 상태
  isLoading: boolean; // 로딩 상태
  searchQuery: string; // 검색어
  theme: ThemeType; // 테마 (다크/라이트)
  isThemeTransitioning: boolean; // 테마 전환 애니메이션 중
  sceneRotation: number; // 씬 회전 각도 (라디안)

  // 상태 변경 액션들
  setActiveNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setHighlightedNodes: (ids: string[]) => void;
  setModalOpen: (open: boolean) => void;
  setCameraTarget: (target: [number, number, number] | null) => void;
  setIsAnimating: (animating: boolean) => void;

  // UI 액션들
  toggleNodeType: (type: NodeType) => void;
  setSidePanelOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  setThemeTransitioning: (transitioning: boolean) => void;

  // 계산된 노드 위치 (포스 시뮬레이션 결과)
  nodePositions: Map<string, [number, number, number]>;
  setNodePositions: (positions: Map<string, [number, number, number]>) => void;
}
