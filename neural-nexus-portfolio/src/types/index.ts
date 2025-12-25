// 신경망 시각화를 위한 노드 타입 정의
export type NodeType = "main" | "project" | "skill" | "lesson";
export type ThemeType = "dark" | "light";
export type ProjectCategory = "frontend" | "backend" | "ai-ml" | "creative";
export type SkillCategory =
  | "language"
  | "framework"
  | "library"
  | "tool"
  | "database";

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
  blogLink?: string; // 기술 블로그 링크
  image?: string; // 이미지 경로
  features?: { title: string; items: string[] }[]; // 주요 기능 (Detailed)
  optimizations?: { title: string; items: string[] }[]; // 최적화 내용 (Detailed)
  challenges?: { title: string; problem: string; solution: string }[]; // 트러블 슈팅 (Detailed)
  learnings?: { title: string; content: string }[]; // 배운 점 (Detailed)
  techStackDocs?: { name: string; description: string }[]; // 기술 스택 선정 이유
  coreFeatures?: string[]; // 핵심 특징 (반응형, 접근성 등)
  codeExamples?: {
    title: string;
    category: string;
    description: string;
    filePath: string;
    githubLink?: string;
    snippet: string;
  }[]; // 코드 예시
  references?: {
    id: number;
    title: string;
    authors: string;
    year: string;
    source: string;
  }[]; // 참고문헌 (논문용)
  performance?: {
    title: string;
    description?: string; // 설명 추가
    image?: string; // 결과 그래프 이미지 추가
    headers?: string[]; // 헤더 (선택적)
    rows?: string[][]; // 행 (선택적)
  }[]; // 성능 지표 (테이블 및 그래프)
  pdfLink?: string; // 논문 PDF 링크 (직접 열기/다운로드)

  // -- Extended Persona --
  personalInfo?: {
    key: string;
    value: string;
  }[];
  philosophy?: {
    title: string;
    content: string;
  };
  extendedBio?: string;
  profile?: {
    education?: {
      period: string;
      school: string;
      major?: string;
      status?: string;
      gpa?: string;
    }[];
    career?: {
      period: string;
      company: string;
      role: string;
      description?: string;
    }[];
    skills?: {
      category: string;
      items: string[];
    }[];
  };
  keyProjects?: {
    id: string;
    title: string;
    desc: string;
    tech: string[];
  }[];
  researchInterests?: {
    category: string;
    items: string[];
  }[];

  // -- Profile Extension --
  education?: {
    period: string;
    school: string;
    major?: string;
    status?: string; // 졸업/재학/수료
    gpa?: string;
  }[];
  career?: {
    period: string;
    company: string;
    role: string;
    description?: string;
  }[];
  awards?: {
    date: string;
    title: string;
    issuer?: string;
  }[];
  skills?: {
    category: string;
    items: string[];
  }[];
}

/**
 * 뉴런 노드 인터페이스
 */
export interface NeuralNode {
  id: string; // 고유 ID
  type: NodeType; // 노드 타입
  category?: ProjectCategory; // 프로젝트 카테고리 (project 타입에만 사용)
  skillCategory?: SkillCategory; // 스킬 카테고리 (skill 타입에만 사용)
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
  isDragging: boolean; // 노드 드래그 중 여부

  // UI 상태
  visibleNodeTypes: NodeType[]; // 표시할 노드 타입 필터
  visibleCategories: ProjectCategory[]; // 표시할 카테고리 필터
  isSidePanelOpen: boolean; // 사이드 패널 열림 상태
  isLoading: boolean; // 로딩 상태
  loadingProgress: number; // 로딩 진행률 (0-100)
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
  setIsDragging: (dragging: boolean) => void;

  // UI 액션들
  toggleNodeType: (type: NodeType) => void;
  toggleCategory: (category: ProjectCategory) => void;
  resetCategoryFilter: () => void;
  setSidePanelOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  setThemeTransitioning: (transitioning: boolean) => void;

  // 계산된 노드 위치 (포스 시뮬레이션 결과)
  nodePositions: Map<string, [number, number, number]>;
  setNodePositions: (positions: Map<string, [number, number, number]>) => void;
  updateNodePosition: (id: string, position: [number, number, number]) => void;
}
