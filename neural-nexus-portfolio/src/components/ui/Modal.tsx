import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";
import { getNodesData } from "../../data";
import { getThemeColor } from "../../utils/themeUtils";
import { MiniTooltip } from "./MiniTooltip";
import ReactMarkdown from "react-markdown";

type TabType =
  | "description"
  | "features"
  | "optimizations"
  | "trouble"
  | "lesson"
  | "code"
  | "references"
  | "results"
  | "career"
  | "education"
  | "skills"
  | "research"
  | "profile"
  | "projects";

/**
 * 고급 글래스모피즘 모달 컴포넌트
 * 노드 클릭 시 상세 정보를 탭 형태로 표시
 */
export function Modal() {
  const {
    isModalOpen,
    setModalOpen,
    activeNode,
    setActiveNode,
    setCameraTarget,
    theme,
    nodePositions,
  } = useAppStore();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [isVisible, setIsVisible] = useState(false);
  const [tabDirection, setTabDirection] = useState<"left" | "right">("right");
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const connectionsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // 모바일 스와이프 상태
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0); // 실시간 스와이프 이동량
  const [isAnimating, setIsAnimating] = useState(false); // 스프링 애니메이션 중
  const minSwipeDistance = 80; // 노드 전환 최소 거리
  const maxSwipeDistance = 150; // 최대 이동 제한 (저항감)

  const data = getNodesData(i18n.language);
  const node = data.nodes.find((n) => n.id === activeNode);

  const rawColor = node?.color || "#00ffff";
  const nodeColor = getThemeColor(rawColor, theme);

  // ESC 키로 모달 닫기, 화살표 키로 노드 순회
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleClose();
      } else if (e.key === "ArrowLeft" && isModalOpen) {
        navigateNode(-1);
      } else if (e.key === "ArrowRight" && isModalOpen) {
        navigateNode(1);
      }
    },
    [isModalOpen, activeNode]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 애니메이션 상태 관리 & 초기 탭 설정
  useEffect(() => {
    if (isModalOpen) {
      // 모달이 열릴 때 노드 타입에 따라 기본 탭 설정
      if (node?.type === "main") {
        setActiveTab("profile");
      } else {
        setActiveTab("description");
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
    }
  }, [isModalOpen, node?.type]);

  // 연결 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        connectionsRef.current &&
        !connectionsRef.current.contains(event.target as Node)
      ) {
        setIsConnectionsOpen(false);
      }
    };

    if (isConnectionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isConnectionsOpen]);

  /**
   * 인라인 마크다운 파서
   * 지원 형식: **볼드**, `코드`, [링크](URL)
   */
  const parseInlineMarkdown = (
    text: string,
    options?: { codeColor?: string; boldCode?: boolean }
  ) => {
    const codeColor = options?.codeColor || nodeColor;
    const boldCode = options?.boldCode || false;
    const parts: React.ReactNode[] = [];
    let key = 0;

    // 정규식으로 마크다운 패턴 매칭
    const regex = /(\*\*(.+?)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // 매치 전 일반 텍스트
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[1]) {
        // **볼드**
        parts.push(
          <strong key={key++} style={{ color: codeColor, fontWeight: 700 }}>
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // `코드` - boldCode 옵션이 true면 볼드+색상으로 렌더링
        if (boldCode) {
          parts.push(
            <strong key={key++} style={{ color: codeColor, fontWeight: 700 }}>
              {match[4]}
            </strong>
          );
        } else {
          parts.push(
            <code
              key={key++}
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.06)",
                color: codeColor,
                padding: "1px 6px",
                borderRadius: "4px",
                fontSize: "0.9em",
                fontFamily: "monospace",
              }}
            >
              {match[4]}
            </code>
          );
        }
      } else if (match[5]) {
        // [링크](URL)
        parts.push(
          <a
            key={key++}
            href={match[7]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: codeColor,
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            {match[6]}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // 남은 텍스트
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setModalOpen(false);
      setActiveNode(null);
      setCameraTarget(null);
      setActiveTab("description");
      setIsConnectionsOpen(false);
    }, 300);
  };

  // 특정 노드로 이동하는 함수
  const navigateToNode = (nodeId: string) => {
    const targetNode = data.nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    const newPosition = nodePositions.get(nodeId);
    setActiveNode(nodeId);
    if (newPosition) {
      setCameraTarget(newPosition);
    }
    // 노드 타입에 따라 기본 탭 설정
    if (targetNode.type === "main") {
      setActiveTab("profile");
    } else {
      setActiveTab("description");
    }
    setIsConnectionsOpen(false);
  };

  const handleTabChange = (newTab: TabType) => {
    const tabOrder: TabType[] = [
      "profile",
      "projects",
      "research",
      "description",
      "features",
      "optimizations",
      "trouble",
      "code",
      "results",
      "references",
      "lesson",
    ];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    setTabDirection(newIndex > currentIndex ? "right" : "left");
    setActiveTab(newTab);
  };

  // 노드 순회 함수 (사이드바 순서: main → project(카테고리별) → skill(카테고리별) → lesson)
  const navigateNode = (direction: -1 | 1) => {
    // 사이드바와 동일한 순서로 노드 정렬
    const typeOrder = ["main", "project", "skill", "lesson"];
    const projectCategoryOrder = ["frontend", "backend", "ai-ml", "creative"];
    const skillCategoryOrder = [
      "language",
      "framework",
      "library",
      "tool",
      "database",
    ];

    const sortedNodes = [...data.nodes].sort((a, b) => {
      // 1. 타입별 정렬
      const aTypeIndex = typeOrder.indexOf(a.type);
      const bTypeIndex = typeOrder.indexOf(b.type);
      if (aTypeIndex !== bTypeIndex) return aTypeIndex - bTypeIndex;

      // 2. 프로젝트는 카테고리별 정렬
      if (a.type === "project" && b.type === "project") {
        const aCatIndex = projectCategoryOrder.indexOf(a.category || "");
        const bCatIndex = projectCategoryOrder.indexOf(b.category || "");
        if (aCatIndex !== bCatIndex) return aCatIndex - bCatIndex;
      }

      // 3. 스킬은 카테고리별 정렬
      if (a.type === "skill" && b.type === "skill") {
        const aCatIndex = skillCategoryOrder.indexOf(a.skillCategory || "");
        const bCatIndex = skillCategoryOrder.indexOf(b.skillCategory || "");
        if (aCatIndex !== bCatIndex) return aCatIndex - bCatIndex;
      }

      // 4. 같은 카테고리 내에서는 알파벳 순
      return a.label.localeCompare(b.label);
    });

    const currentIndex = sortedNodes.findIndex((n) => n.id === activeNode);
    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;
    // 순환 처리
    if (newIndex < 0) newIndex = sortedNodes.length - 1;
    if (newIndex >= sortedNodes.length) newIndex = 0;

    const newNode = sortedNodes[newIndex];
    const newPosition = nodePositions.get(newNode.id);

    setActiveNode(newNode.id);
    if (newPosition) {
      setCameraTarget(newPosition);
    }

    // 노드 타입에 따라 기본 탭 설정
    if (newNode.type === "main") {
      setActiveTab("profile");
    } else {
      setActiveTab("description");
    }
  };

  // 모바일 스와이프 핸들러 - 쫀득한 애니메이션
  const onTouchStart = (e: React.TouchEvent) => {
    // 탭 영역에서 시작된 터치는 노드 순회 스와이프를 무시 (탭 스크롤 우선)
    if (tabsRef.current && tabsRef.current.contains(e.target as Node)) {
      return;
    }
    setIsAnimating(false); // 애니메이션 해제
    setTouchEnd(null);
    setTouchEndY(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setSwipeOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || touchStartY === null) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentX);
    setTouchEndY(currentY);

    // 수직 이동이 수평보다 크면 스크롤로 판단 (스와이프 무시)
    const deltaX = Math.abs(currentX - touchStart);
    const deltaY = Math.abs(currentY - touchStartY);
    if (deltaY > deltaX) {
      setSwipeOffset(0);
      return;
    }

    // 저항감 적용 (멀어질수록 느려짐)
    const rawOffset = currentX - touchStart;
    const resistance =
      1 - Math.min(Math.abs(rawOffset) / (maxSwipeDistance * 2), 0.6);
    const dampedOffset = rawOffset * resistance;

    setSwipeOffset(dampedOffset);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !touchStartY) {
      setSwipeOffset(0);
      return;
    }

    // 수직 이동이 수평보다 크면 스크롤로 판단 (스와이프 무시)
    const deltaX = Math.abs(touchStart - touchEnd);
    const deltaY = touchEndY ? Math.abs(touchStartY - touchEndY) : 0;
    if (deltaY > deltaX) {
      setSwipeOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
      setTouchStartY(null);
      setTouchEndY(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // 스프링 애니메이션 시작
    setIsAnimating(true);

    if (isLeftSwipe) {
      // 왼쪽으로 날아가는 효과 후 다음 노드
      setSwipeOffset(-400);
      setTimeout(() => {
        navigateNode(1);
        // 다음 모달은 오른쪽에서 슬라이드인
        setSwipeOffset(300);
        requestAnimationFrame(() => {
          setSwipeOffset(0);
          setTimeout(() => setIsAnimating(false), 300);
        });
      }, 150);
    } else if (isRightSwipe) {
      // 오른쪽으로 날아가는 효과 후 이전 노드
      setSwipeOffset(400);
      setTimeout(() => {
        navigateNode(-1);
        // 다음 모달은 왼쪽에서 슬라이드인
        setSwipeOffset(-300);
        requestAnimationFrame(() => {
          setSwipeOffset(0);
          setTimeout(() => setIsAnimating(false), 300);
        });
      }, 150);
    } else {
      // 스냅백 (원위치로 돌아옴)
      setSwipeOffset(0);
      setTimeout(() => setIsAnimating(false), 300);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setTouchStartY(null);
    setTouchEndY(null);
  };

  if (!isModalOpen || !node) return null;

  const details = node.details;
  const hasTrouble = details?.trouble || details?.shooting;
  const hasLesson = details?.lesson;

  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    available: boolean;
  }[] = [
    // Main Node Tabs
    {
      id: "profile",
      label: t("modal.tabs.profile"),
      icon: "👤",
      available: node?.type === "main",
    },
    {
      id: "projects",
      label: t("modal.tabs.projects"),
      icon: "⭐",
      available: Boolean(
        node?.type === "main" &&
          details?.keyProjects &&
          details.keyProjects.length > 0
      ),
    },
    {
      id: "research",
      label: t("modal.tabs.research"),
      icon: "🔬",
      available: Boolean(
        node?.type === "main" &&
          details?.researchInterests &&
          details.researchInterests.length > 0
      ),
    },

    // Standard Node Tabs
    {
      id: "description",
      label: t("modal.tabs.description"),
      icon: "📝",
      available: node?.type !== "main",
    },
    {
      id: "features",
      label: t("modal.tabs.features"),
      icon: "🚀",
      available: Boolean(
        node?.type !== "main" &&
          details?.features &&
          details.features.length > 0
      ),
    },
    {
      id: "optimizations",
      label: t("modal.tabs.optimizations"),
      icon: "⚡",
      available: Boolean(
        details?.optimizations && details.optimizations.length > 0
      ),
    },
    {
      id: "trouble",
      label: t("modal.tabs.trouble"),
      icon: "🔧",
      available: Boolean(
        hasTrouble || (details?.challenges && details.challenges.length > 0)
      ),
    },
    {
      id: "code",
      label: t("modal.tabs.code"),
      icon: "💻",
      available: Boolean(
        details?.codeExamples && details.codeExamples.length > 0
      ),
    },
    {
      id: "results",
      label: t("modal.tabs.results"),
      icon: "📊",
      available: Boolean(
        details?.performance && details.performance.length > 0
      ),
    },
    {
      id: "references",
      label: t("modal.tabs.references"),
      icon: "📚",
      available: Boolean(details?.references && details.references.length > 0),
    },
    {
      id: "lesson",
      label: t("modal.tabs.lesson"),
      icon: "💡",
      available: Boolean(
        // Main node uses Profile/Research for learnings
        node?.type !== "main" &&
          (hasLesson || (details?.learnings && details.learnings.length > 0))
      ),
    },
    // Legacy tabs (Hidden for Main Node now as they are integrated into Profile, hidden for others as unused)
    {
      id: "career",
      label: t("modal.tabs.career"),
      icon: "💼",
      available: false,
    },
    {
      id: "education",
      label: t("modal.tabs.education"),
      icon: "🎓",
      available: false,
    },
    {
      id: "skills",
      label: t("modal.tabs.skills"),
      icon: "🛠️",
      available: Boolean(
        node?.type !== "main" && details?.skills && details.skills.length > 0
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={handleClose}
    >
      {/* 배경 오버레이 */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: isDark
            ? `radial-gradient(ellipse at center, ${nodeColor}15 0%, transparent 50%), rgba(0, 0, 0, 0.6)`
            : `radial-gradient(ellipse at center, ${nodeColor}10 0%, transparent 60%), rgba(255, 255, 255, 0.4)`,
          backdropFilter: "blur(8px)",
        }}
      />

      {/* 이전 노드 버튼 (왼쪽) - 데스크톱에서만 표시 */}
      <div className="hidden md:block">
        <MiniTooltip content={t("modal.navigation.prevNode")}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateNode(-1);
            }}
            className={`
            absolute left-[calc(50%-min(45vw,42.5rem+2rem)-3rem)] md:left-[calc(50%-min(42.5vw,42.5rem+2.5rem)-3.5rem)] top-1/2 -translate-y-1/2 z-10
            p-3 md:p-4 rounded-full
            transition-all duration-300
            hover:scale-110 active:scale-95
            cursor-pointer
            ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }
          `}
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(8px)",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.2)"
                : "1px solid rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${nodeColor}40`;
              e.currentTarget.style.borderColor = nodeColor;
              e.currentTarget.style.boxShadow = `0 0 20px ${nodeColor}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            aria-label={t("modal.aria.prevNode")}
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              style={{ color: isDark ? "white" : "#1f2937" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </MiniTooltip>
      </div>

      {/* 다음 노드 버튼 (오른쪽) - 데스크톱에서만 표시 */}
      <div className="hidden md:block">
        <MiniTooltip content={t("modal.navigation.nextNode")}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateNode(1);
            }}
            className={`
            absolute right-[calc(50%-min(45vw,42.5rem+2rem)-3rem)] md:right-[calc(50%-min(42.5vw,42.5rem+2.5rem)-3.5rem)] top-1/2 -translate-y-1/2 z-10
            p-3 md:p-4 rounded-full
            transition-all duration-300
            hover:scale-110 active:scale-95
            cursor-pointer
            ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4"
            }
          `}
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(8px)",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.2)"
                : "1px solid rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${nodeColor}40`;
              e.currentTarget.style.borderColor = nodeColor;
              e.currentTarget.style.boxShadow = `0 0 20px ${nodeColor}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            aria-label={t("modal.aria.nextNode")}
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              style={{ color: isDark ? "white" : "#1f2937" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </MiniTooltip>
      </div>

      {/* 모달 본체 */}
      <div
        className={`
          relative max-h-[90vh] flex flex-col overflow-hidden
          rounded-3xl
          transition-all duration-500 ease-out
          ${
            node?.type === "skill" || node?.type === "lesson"
              ? "w-[90vw] md:w-[500px] max-w-lg" // 스킬/교훈 노드: 좁은 너비
              : "w-[90vw] md:w-[85vw] max-w-5xl" // 프로젝트/메인 노드: 넓은 너비
          }
          ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-12 scale-95"
          }
        `}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          background: isDark
            ? `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)`,
          backdropFilter: "blur(24px)",
          border: isDark
            ? `1px solid ${nodeColor}30`
            : `1px solid rgba(255,255,255,0.8)`,
          boxShadow: isDark
            ? `0 0 60px ${nodeColor}20, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
            : `0 10px 40px -10px rgba(0,0,0,0.1), 0 0 20px ${nodeColor}10`,
          // 스와이프 애니메이션
          transform: `translateX(${swipeOffset}px) rotate(${
            swipeOffset * 0.02
          }deg)`,
          transition: isAnimating
            ? "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" // 스프링 효과
            : "transform 0s", // 즉시 반응 (드래그 중)
        }}
      >
        {/* 상단 글로우 라인 */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4"
          style={{
            background: `linear-gradient(90deg, transparent, ${nodeColor}, transparent)`,
            opacity: isDark ? 1 : 0.5,
          }}
        />

        {/* 헤더 */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* 노드 아이콘 - 모바일에서 숨김 */}
              <div
                className="hidden md:flex relative w-14 h-14 rounded-2xl items-center justify-center shrink-0"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, ${nodeColor}40, ${nodeColor}20)`
                    : `linear-gradient(135deg, ${nodeColor}20, ${nodeColor}10)`,
                  border: isDark
                    ? `1px solid ${nodeColor}50`
                    : `1px solid ${nodeColor}30`,
                  boxShadow: `0 0 30px ${nodeColor}30`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: nodeColor }}
                />
              </div>

              <div className="min-w-0 flex-1">
                {/* 모바일: 뱃지가 타이틀 위에 */}
                <div className="flex md:hidden items-center gap-2 mb-1">
                  <span
                    className="px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${nodeColor}20`,
                      color: nodeColor,
                      border: `1px solid ${nodeColor}40`,
                    }}
                  >
                    {node.type}
                  </span>
                </div>

                {/* 타이틀 + 링크 아이콘들 */}
                <div className="flex items-center gap-2 min-w-0">
                  {/* 제목 */}
                  {details?.link ? (
                    <MiniTooltip content={t("modal.links.github")}>
                      <a
                        href={details.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="group/title flex items-center gap-2 transition-all duration-300 min-w-0"
                        style={{ color: isDark ? "white" : "#1f2937" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = nodeColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isDark
                            ? "white"
                            : "#1f2937";
                        }}
                      >
                        <h2 className="text-base md:text-2xl font-bold tracking-tight leading-tight truncate overflow-hidden">
                          {node.label}
                        </h2>
                        {/* GitHub 아이콘 - 데스크톱에서만 (링크 안에) */}
                        <svg
                          className="hidden md:block w-5 h-5 opacity-50 group-hover/title:opacity-100 transition-all duration-300 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    </MiniTooltip>
                  ) : (
                    <h2
                      className="text-base md:text-2xl font-bold tracking-tight leading-tight transition-colors duration-300 truncate overflow-hidden"
                      style={{ color: isDark ? "white" : "#1f2937" }}
                    >
                      {node.label}
                    </h2>
                  )}

                  {/* 모바일: 타이틀 옆에 GitHub/배포/PDF 아이콘 */}
                  <div className="flex md:hidden items-center shrink-0">
                    {/* GitHub 아이콘 */}
                    {details?.link && (
                      <>
                        <a
                          href={details.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg transition-all duration-300"
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,0.5)"
                              : "rgba(0,0,0,0.4)",
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </a>
                      </>
                    )}
                    {/* 배포 링크 아이콘 */}
                    {details?.deployLink && (
                      <>
                        <span
                          className={`mx-0.5 text-xs ${
                            isDark ? "text-white/20" : "text-black/10"
                          }`}
                        >
                          /
                        </span>
                        <a
                          href={details.deployLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg transition-all duration-300"
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,0.5)"
                              : "rgba(0,0,0,0.4)",
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                        </a>
                      </>
                    )}
                    {/* PDF 링크 아이콘 */}
                    {details?.pdfLink && (
                      <>
                        <span
                          className={`mx-0.5 text-xs ${
                            isDark ? "text-white/20" : "text-black/10"
                          }`}
                        >
                          /
                        </span>
                        <a
                          href={details.pdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg transition-all duration-300"
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,0.5)"
                              : "rgba(0,0,0,0.4)",
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </a>
                      </>
                    )}
                    {/* Blog Link Icon */}
                    {details?.blogLink && (
                      <>
                        <span
                          className={`mx-0.5 text-xs ${
                            isDark ? "text-white/20" : "text-black/10"
                          }`}
                        >
                          /
                        </span>
                        <a
                          href={details.blogLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg transition-all duration-300"
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,0.5)"
                              : "rgba(0,0,0,0.4)",
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </a>
                      </>
                    )}
                  </div>

                  {/* 데스크톱: 배포/PDF 링크 아이콘 */}
                  <div className="hidden md:flex items-center gap-1 shrink-0">
                    {/* 배포 링크 아이콘 */}
                    {details?.deployLink && (
                      <>
                        <span
                          className={`mx-1 ${
                            isDark ? "text-white/20" : "text-black/10"
                          }`}
                        >
                          /
                        </span>
                        <MiniTooltip content={t("modal.links.deploy")}>
                          <a
                            href={details.deployLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 block"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.5)"
                                : "rgba(0,0,0,0.4)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = nodeColor;
                              e.currentTarget.style.background = `${nodeColor}20`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = isDark
                                ? "rgba(255,255,255,0.5)"
                                : "rgba(0,0,0,0.4)";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                          </a>
                        </MiniTooltip>
                      </>
                    )}

                    {/* PDF 링크 아이콘 */}
                    {details?.pdfLink && (
                      <>
                        <span
                          className={`mx-1 ${
                            isDark ? "text-white/20" : "text-black/10"
                          }`}
                        >
                          /
                        </span>
                        <MiniTooltip content={t("modal.links.pdf")}>
                          <a
                            href={details.pdfLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 block"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.5)"
                                : "rgba(0,0,0,0.4)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = nodeColor;
                              e.currentTarget.style.background = `${nodeColor}20`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = isDark
                                ? "rgba(255,255,255,0.5)"
                                : "rgba(0,0,0,0.4)";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </a>
                        </MiniTooltip>
                      </>
                    )}
                    {/* Blog Link Icon */}
                    {details?.blogLink && (
                      <>
                        <span
                          className={`mx-1 ${
                            isDark ? "text-white/20" : "text-black/10"
                          }`}
                        >
                          /
                        </span>
                        <MiniTooltip content={t("modal.links.blog")}>
                          <a
                            href={details.blogLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 block"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.5)"
                                : "rgba(0,0,0,0.4)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = nodeColor;
                              e.currentTarget.style.background = `${nodeColor}20`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = isDark
                                ? "rgba(255,255,255,0.5)"
                                : "rgba(0,0,0,0.4)";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </a>
                        </MiniTooltip>
                      </>
                    )}
                  </div>
                </div>

                {/* 데스크톱: 뱃지가 타이틀 아래에 */}
                <div className="hidden md:flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${nodeColor}20`,
                      color: nodeColor,
                      border: `1px solid ${nodeColor}40`,
                    }}
                  >
                    {node.type}
                  </span>
                </div>

                {/* 연결 노드 드롭다운 - 모바일/데스크톱 모두 표시 */}
                <div className="flex items-center gap-2 mt-1.5 md:mt-0">
                  <div className="relative" ref={connectionsRef}>
                    {(() => {
                      // 연결된 노드들의 타입별 개수 및 목록 계산
                      const connectionsByType: Record<
                        string,
                        Array<{ id: string; label: string; color: string }>
                      > = {};
                      node.connections.forEach((connId) => {
                        const connNode = data.nodes.find(
                          (n) => n.id === connId
                        );
                        if (connNode) {
                          const type = connNode.type;
                          if (!connectionsByType[type]) {
                            connectionsByType[type] = [];
                          }
                          connectionsByType[type].push({
                            id: connNode.id,
                            label: connNode.label,
                            color: getThemeColor(
                              connNode.color || "#00ffff",
                              theme
                            ),
                          });
                        }
                      });

                      const typeLabels: Record<string, string> = {
                        main: t("nodeTypes.main"),
                        project: t("nodeTypes.project"),
                        skill: t("nodeTypes.skill"),
                        lesson: t("nodeTypes.lesson"),
                      };

                      const typeIcons: Record<string, string> = {
                        main: "🏠",
                        project: "📁",
                        skill: "⚡",
                        lesson: "💡",
                      };

                      // 타입 순서 정의: main → project → skill → lesson
                      const typeOrder = ["main", "project", "skill", "lesson"];

                      // 데스크톱용 형식: "Main 1, Skill 7"
                      const parts = typeOrder
                        .filter((type) => connectionsByType[type])
                        .map(
                          (type) =>
                            `${typeLabels[type] || type} ${t(
                              "modal.connectionCount",
                              { count: connectionsByType[type].length }
                            )}`
                        )
                        .join(", ");

                      // 모바일용 형식: "메인 (1), 스킬 (7)"
                      const partsMobile = typeOrder
                        .filter((type) => connectionsByType[type])
                        .map(
                          (type) =>
                            `${typeLabels[type] || type} (${
                              connectionsByType[type].length
                            })`
                        )
                        .join(", ");

                      const totalConnections = node.connections.length;

                      return (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsConnectionsOpen(!isConnectionsOpen);
                            }}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.6)"
                                : "rgba(0,0,0,0.6)",
                              background: isConnectionsOpen
                                ? isDark
                                  ? "rgba(255,255,255,0.1)"
                                  : "rgba(0,0,0,0.05)"
                                : "transparent",
                              border: isConnectionsOpen
                                ? `1px solid ${nodeColor}40`
                                : "1px solid transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)";
                              e.currentTarget.style.color = isDark
                                ? "rgba(255,255,255,0.9)"
                                : "rgba(0,0,0,0.8)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isConnectionsOpen) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.color = isDark
                                  ? "rgba(255,255,255,0.6)"
                                  : "rgba(0,0,0,0.6)";
                              }
                            }}
                          >
                            <span>🔗</span>
                            <span>
                              {parts ? (
                                <>
                                  {/* 모바일: 축약형 */}
                                  <span className="md:hidden">
                                    {partsMobile}
                                  </span>
                                  {/* 데스크톱: 기존 형식 + 연결 */}
                                  <span className="hidden md:inline">
                                    {parts} {t("modal.connectionsSuffix")}
                                  </span>
                                </>
                              ) : (
                                t("modal.noConnections")
                              )}
                            </span>
                            {totalConnections > 0 && (
                              <svg
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isConnectionsOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </button>

                          {/* 드롭다운 목록 */}
                          {isConnectionsOpen && totalConnections > 0 && (
                            <div
                              className="absolute top-full left-0 mt-2 min-w-[220px] max-h-[300px] overflow-y-auto rounded-xl z-50 custom-scrollbar"
                              style={{
                                background: isDark
                                  ? "rgba(20, 20, 30, 0.95)"
                                  : "rgba(255, 255, 255, 0.98)",
                                backdropFilter: "blur(16px)",
                                border: isDark
                                  ? `1px solid ${nodeColor}30`
                                  : "1px solid rgba(0,0,0,0.1)",
                                boxShadow: isDark
                                  ? `0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${nodeColor}15`
                                  : "0 10px 40px rgba(0,0,0,0.15)",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {typeOrder
                                .filter((type) => connectionsByType[type])
                                .map((type, groupIndex) => {
                                  const nodes = connectionsByType[type];
                                  return (
                                    <div key={type}>
                                      {/* 타입 헤더 */}
                                      <div
                                        className="px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0"
                                        style={{
                                          color: isDark
                                            ? "rgba(255,255,255,0.4)"
                                            : "rgba(0,0,0,0.4)",
                                          background: isDark
                                            ? "rgba(20, 20, 30, 0.98)"
                                            : "rgba(255, 255, 255, 0.98)",
                                          borderBottom: isDark
                                            ? "1px solid rgba(255,255,255,0.05)"
                                            : "1px solid rgba(0,0,0,0.05)",
                                        }}
                                      >
                                        {typeIcons[type] || "📌"}{" "}
                                        {typeLabels[type] || type} (
                                        {nodes.length})
                                      </div>

                                      {/* 노드 목록 */}
                                      {nodes.map((connNode) => (
                                        <button
                                          key={connNode.id}
                                          onClick={() =>
                                            navigateToNode(connNode.id)
                                          }
                                          className="w-full px-3 py-2.5 flex items-center gap-2.5 text-left transition-all duration-200 cursor-pointer active:scale-[0.98]"
                                          style={{
                                            color: isDark
                                              ? "rgba(255,255,255,0.85)"
                                              : "#374151",
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = `${connNode.color}15`;
                                            e.currentTarget.style.paddingLeft =
                                              "16px";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                              "transparent";
                                            e.currentTarget.style.paddingLeft =
                                              "12px";
                                          }}
                                        >
                                          <div
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{
                                              backgroundColor: connNode.color,
                                              boxShadow: `0 0 8px ${connNode.color}60`,
                                            }}
                                          />
                                          <span className="text-sm font-medium truncate">
                                            {connNode.label}
                                          </span>
                                          <svg
                                            className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ color: connNode.color }}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 5l7 7-7 7"
                                            />
                                          </svg>
                                        </button>
                                      ))}

                                      {/* 구분선 */}
                                      {groupIndex <
                                        typeOrder.filter(
                                          (t) => connectionsByType[t]
                                        ).length -
                                          1 && (
                                        <div
                                          className="mx-3 my-1"
                                          style={{
                                            borderBottom: isDark
                                              ? "1px solid rgba(255,255,255,0.08)"
                                              : "1px solid rgba(0,0,0,0.06)",
                                          }}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="group p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shrink-0 cursor-pointer"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.05)",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(255, 100, 100, 0.2)"
                  : "rgba(255, 100, 100, 0.15)";
                e.currentTarget.style.borderColor = "rgba(255, 100, 100, 0.4)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(255, 100, 100, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.borderColor = isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.boxShadow = "none";
              }}
              aria-label={t("modal.aria.close")}
            >
              <svg
                className="w-5 h-5 transition-all duration-300 group-hover:rotate-90"
                style={{
                  color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="px-6 pb-4">
          <div
            ref={tabsRef}
            className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-none"
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.03)",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            {tabs
              .filter((tab) => tab.available)
              .map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      relative shrink-0 flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-300 cursor-pointer
                      ${!isActive ? "hover:bg-white/10 active:scale-95" : ""}
                    `}
                    style={{
                      color: isActive
                        ? isDark
                          ? "white"
                          : "#1f2937"
                        : isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.5)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = isDark
                          ? "white"
                          : "#1f2937";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      // 항상 transform 초기화 (active 상태 변경 시에도)
                      e.currentTarget.style.transform = "translateY(0)";
                      if (!isActive) {
                        e.currentTarget.style.color = isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.5)";
                      }
                    }}
                  >
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-lg transition-all duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${nodeColor}30, ${nodeColor}15)`,
                          border: `1px solid ${nodeColor}40`,
                          boxShadow: `0 0 15px ${nodeColor}20`,
                        }}
                      />
                    )}
                    <span className="relative z-10 transition-transform duration-200">
                      {tab.icon}
                    </span>
                    <span className="relative z-10 hidden sm:inline">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="relative px-6 pb-6 flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div
            className={`transition-all duration-300 ${
              tabDirection === "right"
                ? "animate-slideFromRight"
                : "animate-slideFromLeft"
            }`}
            key={activeTab}
          >
            {/* 프로필 탭 (Main Node) */}
            {activeTab === "profile" && (
              <div className="space-y-8 animate-fadeIn">
                {/* 1. 소개 섹션 */}
                <div className="space-y-4">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: nodeColor }}
                  >
                    About Me
                  </h3>
                  <p
                    className="text-base leading-relaxed"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.9)" : "#374151",
                    }}
                  >
                    {details?.description}
                  </p>
                  {details?.extendedBio && (
                    <p
                      className="text-base leading-relaxed opacity-90 whitespace-pre-line"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.8)" : "#4b5563",
                      }}
                    >
                      {details.extendedBio}
                    </p>
                  )}

                  {/* 개인정보 테이블 (Custom Layout) */}
                  {details?.personalInfo && (
                    <div
                      className="mt-6 rounded-xl overflow-hidden border"
                      style={{
                        borderColor: isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.1)",
                      }}
                    >
                      <table className="w-full text-sm border-collapse">
                        <tbody
                          style={{
                            color: isDark ? "rgba(255,255,255,0.9)" : "#374151",
                          }}
                        >
                          {/* Row 1: 이름 | 최민석 | 생년월일 (Rowspan 2) | 날짜 (Rowspan 2) */}
                          <tr
                            style={{
                              borderBottom: isDark
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.1)",
                            }}
                          >
                            <th
                              className="px-4 py-3 font-semibold text-left w-24"
                              style={{
                                background: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.03)",
                                borderRight: isDark
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                                color: nodeColor,
                              }}
                            >
                              {t("modal.profile.name")}
                            </th>
                            <td
                              className="px-4 py-3 font-medium"
                              style={{
                                borderRight: isDark
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                              }}
                            >
                              {
                                details.personalInfo.find(
                                  (i) => i.key === "name"
                                )?.value
                              }
                            </td>
                            <th
                              className="px-4 py-3 font-semibold text-center w-24 align-middle"
                              rowSpan={2}
                              style={{
                                background: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.03)",
                                borderRight: isDark
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                                color: nodeColor,
                              }}
                            >
                              {t("modal.profile.birthDate")}
                            </th>
                            <td
                              className="px-4 py-3 font-medium align-middle"
                              rowSpan={2}
                            >
                              {
                                details.personalInfo.find(
                                  (i) => i.key === "birthDate"
                                )?.value
                              }
                            </td>
                          </tr>

                          {/* Row 2: 전공 | 소프트웨어전공 */}
                          <tr
                            style={{
                              borderBottom: isDark
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.1)",
                            }}
                          >
                            <th
                              className="px-4 py-3 font-semibold text-left"
                              style={{
                                background: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.03)",
                                borderRight: isDark
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                                color: nodeColor,
                              }}
                            >
                              {t("modal.profile.major")}
                            </th>
                            <td
                              className="px-4 py-3 font-medium"
                              style={{
                                borderRight: isDark
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                              }}
                            >
                              {
                                details.personalInfo.find(
                                  (i) => i.key === "major"
                                )?.value
                              }
                            </td>
                          </tr>

                          {/* Row 3: 연락처 */}
                          <tr
                            style={{
                              borderBottom: isDark
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.1)",
                            }}
                          >
                            <th
                              className="px-4 py-3 font-semibold text-left"
                              style={{
                                background: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.03)",
                                borderRight: isDark
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                                color: nodeColor,
                              }}
                            >
                              {t("modal.profile.contact")}
                            </th>
                            <td className="px-4 py-3 font-medium" colSpan={3}>
                              {
                                details.personalInfo.find(
                                  (i) => i.key === "contact"
                                )?.value
                              }
                            </td>
                          </tr>

                          {/* Row 4: 이메일 */}
                          <tr>
                            <th
                              className="px-4 py-3 font-semibold text-left"
                              style={{
                                background: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.03)",
                                borderRight: isDark
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                                color: nodeColor,
                              }}
                            >
                              {t("modal.profile.email")}
                            </th>
                            <td className="px-4 py-3 font-medium" colSpan={3}>
                              {
                                details.personalInfo.find(
                                  (i) => i.key === "email"
                                )?.value
                              }
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. 개발 철학 */}
                {details?.philosophy && (
                  <div
                    className="p-6 rounded-2xl relative overflow-hidden transition-all hover:scale-[1.01]"
                    style={{
                      background: isDark
                        ? "rgba(59, 130, 246, 0.1)"
                        : "rgba(59, 130, 246, 0.05)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <span className="text-6xl">💭</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-blue-400 flex items-center gap-2">
                      {details.philosophy.title}
                    </h3>
                    <p
                      className="text-base italic leading-relaxed"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.9)" : "#374151",
                      }}
                    >
                      "{details.philosophy.content}"
                    </p>
                  </div>
                )}

                {/* 3. 경력 & 학력 (타임라인 스타일) */}
                {(details?.profile?.career?.length ||
                  details?.profile?.education?.length) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Career */}
                    {details.profile?.career &&
                      details.profile.career.length > 0 && (
                        <div>
                          <h3
                            className="text-lg font-bold mb-4 flex items-center gap-2"
                            style={{ color: nodeColor }}
                          >
                            <span>💼</span> Career
                          </h3>
                          <div className="space-y-6 pl-2">
                            {details.profile.career.map((item, idx) => (
                              <div
                                key={idx}
                                className="relative pl-6 border-l-2 border-cyan-400/30 group"
                              >
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 group-hover:ring-cyan-400/40 transition-all"></div>
                                <h4 className="font-bold text-base">
                                  {item.company}
                                </h4>
                                <div className="text-sm opacity-80 mb-1 font-medium">
                                  {item.role} | {item.period}
                                </div>
                                {item.description && (
                                  <p className="text-sm opacity-70 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    {/* Education */}
                    {details.profile?.education &&
                      details.profile.education.length > 0 && (
                        <div>
                          <h3
                            className="text-lg font-bold mb-4 flex items-center gap-2"
                            style={{ color: nodeColor }}
                          >
                            <span>🎓</span> Education
                          </h3>
                          <div className="space-y-6 pl-2">
                            {details.profile.education.map((item, idx) => (
                              <div
                                key={idx}
                                className="relative pl-6 border-l-2 border-cyan-400/30 group"
                              >
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 group-hover:ring-cyan-400/40 transition-all"></div>
                                <h4 className="font-bold text-base">
                                  {item.school}
                                </h4>
                                <div className="text-sm opacity-80 mb-1 font-medium">
                                  {item.major} {item.status}
                                </div>
                                <div className="text-xs opacity-60">
                                  {item.period}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* 4. Skills */}
                {details?.profile?.skills && (
                  <div>
                    <h3
                      className="text-lg font-bold mb-4 flex items-center gap-2"
                      style={{ color: nodeColor }}
                    >
                      <span>🛠️</span> Skills
                    </h3>
                    <div className="space-y-6">
                      {details.profile.skills.map((group, idx) => (
                        <div key={idx}>
                          <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60 ml-1">
                            {group.category}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {group.items.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1.5 text-sm rounded-lg border transition-all hover:scale-105 cursor-default"
                                style={{
                                  background: isDark
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(0, 0, 0, 0.03)",
                                  borderColor: isDark
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 주요 프로젝트 탭 (Main Node) - 카드 그리드 */}
            {activeTab === "projects" && details?.keyProjects && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                {details.keyProjects.map((project, idx) => (
                  <button
                    key={idx}
                    className="group relative p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 text-left w-full overflow-hidden cursor-pointer active:scale-[0.98]"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.05)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToNode(project.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${nodeColor}50`;
                      e.currentTarget.style.boxShadow = `0 8px 30px ${nodeColor}20, 0 4px 15px ${nodeColor}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Hover Glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center, ${nodeColor}15, transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="text-lg font-bold group-hover:text-cyan-400 transition-colors"
                          style={{
                            color: isDark ? "white" : "#1f2937",
                          }}
                        >
                          {project.title}
                        </h3>
                        <span
                          className="text-xs opacity-50 group-hover:opacity-100 transition-opacity font-mono"
                          style={{ color: nodeColor }}
                        >
                          {t("modal.openProject")}
                        </span>
                      </div>
                      <p
                        className="text-sm mb-4 line-clamp-2 opacity-80 flex-1 leading-relaxed"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.7)" : "#4b5563",
                        }}
                      >
                        {project.desc}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {project.tech.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-1 rounded-full font-medium"
                            style={{
                              background: isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                              color: isDark
                                ? "rgba(255,255,255,0.8)"
                                : "rgba(0,0,0,0.7)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                        {project.tech.length > 4 && (
                          <span className="text-[10px] opacity-50 self-center">
                            +{project.tech.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 연구 탭 (Main Node) */}
            {activeTab === "research" && details?.researchInterests && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 gap-6">
                  {details.researchInterests.map((interest, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1"
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(255,255,255,0.6)",
                        borderColor: isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)",
                      }}
                    >
                      <h3
                        className="text-lg font-bold mb-4 flex items-center gap-2"
                        style={{ color: nodeColor }}
                      >
                        <span>🔬</span> {interest.category}
                      </h3>
                      <ul className="space-y-3">
                        {interest.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm leading-relaxed opacity-90"
                          >
                            <span
                              className="mt-1.5 w-1.5 h-1.5 rounded-sm shrink-0"
                              style={{
                                backgroundColor: nodeColor,
                                opacity: 0.7,
                              }}
                            ></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "description" && (
              <div className="space-y-5">
                {/* 설명 */}
                <div
                  className="text-base leading-relaxed transition-colors duration-300"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.85)" : "#374151",
                  }}
                >
                  <ReactMarkdown
                    components={{
                      strong: ({ ...props }) => (
                        <strong
                          style={{ color: nodeColor, fontWeight: 700 }}
                          {...props}
                        />
                      ),
                      p: ({ ...props }) => <p {...props} />,
                    }}
                  >
                    {details?.description || "설명이 없습니다."}
                  </ReactMarkdown>
                </div>

                {/* 핵심 특징 (Core Features) */}
                {details?.coreFeatures && details.coreFeatures.length > 0 && (
                  <div>
                    <h3
                      className="text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-300"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.5)",
                      }}
                    >
                      Highlights
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {details.coreFeatures.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm font-medium px-3 py-2 rounded-lg"
                          style={{
                            background: isDark
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.03)",
                            color: isDark ? "rgba(255,255,255,0.9)" : "#1f2937",
                          }}
                        >
                          <span
                            className="shrink-0 mt-[2px]"
                            style={{ color: nodeColor }}
                          >
                            ✓
                          </span>
                          <div className="flex-1 leading-relaxed">
                            {parseInlineMarkdown(feature, {
                              codeColor: nodeColor,
                              boldCode: true,
                            })}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 외부 링크 및 배포 링크 */}
                {(details?.link ||
                  details?.deployLink ||
                  details?.pdfLink ||
                  details?.blogLink) && (
                  <div>
                    <h3
                      className="text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-300"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.5)",
                      }}
                    >
                      {t("modal.linksSection")}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {details?.link && (
                        <a
                          href={details.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                          style={{
                            background: `linear-gradient(135deg, ${nodeColor}25, ${nodeColor}10)`,
                            border: `1px solid ${nodeColor}40`,
                            color: nodeColor,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 25px ${nodeColor}40`;
                            e.currentTarget.style.borderColor = nodeColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.borderColor = `${nodeColor}40`;
                          }}
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          <span className="font-medium">
                            {t("modal.viewProject")}
                          </span>
                        </a>
                      )}

                      {details?.deployLink && (
                        <a
                          href={details.deployLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                          style={{
                            background: isDark
                              ? `linear-gradient(135deg, ${nodeColor} 0%, ${nodeColor}cc 100%)`
                              : `linear-gradient(135deg, ${nodeColor}ee 0%, ${nodeColor} 100%)`,
                            boxShadow: `0 0 20px ${nodeColor}40`,
                            color: "white",
                            border: "none",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 35px ${nodeColor}80, 0 5px 20px ${nodeColor}60`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 20px ${nodeColor}40`;
                          }}
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                          <span className="font-bold">
                            {t("modal.links.deploy")}
                          </span>
                        </a>
                      )}

                      {details?.pdfLink && (
                        <a
                          href={details.pdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                          style={{
                            background: isDark
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(239, 68, 68, 0.05)",
                            border: isDark
                              ? "1px solid rgba(239, 68, 68, 0.2)"
                              : "1px solid rgba(239, 68, 68, 0.2)",
                            color: isDark ? "#fca5a5" : "#dc2626",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(239, 68, 68, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(239, 68, 68, 0.05)";
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium">
                            {t("modal.links.pdf")}
                          </span>
                        </a>
                      )}

                      {details?.blogLink && (
                        <a
                          href={details.blogLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                          style={{
                            background: isDark
                              ? "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))"
                              : "linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.03))",
                            border: isDark
                              ? "1px solid rgba(234, 179, 8, 0.2)"
                              : "1px solid rgba(234, 179, 8, 0.15)",
                            color: isDark ? "#fcd34d" : "#d97706",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 25px rgba(234, 179, 8, 0.2)`;
                            e.currentTarget.style.borderColor =
                              "rgba(234, 179, 8, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.borderColor = isDark
                              ? "rgba(234, 179, 8, 0.2)"
                              : "rgba(234, 179, 8, 0.15)";
                          }}
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="font-medium">
                            {t("modal.links.blog")}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* 기술 스택 선정 이유 (Tech Stack Docs) - 테이블 형식 */}
                {details?.techStackDocs && details.techStackDocs.length > 0 ? (
                  <div>
                    <h3
                      className="text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-300"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.5)",
                      }}
                    >
                      {t("modal.techStackDecisions")}
                    </h3>
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        border: isDark
                          ? `1px solid ${nodeColor}20`
                          : "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <table className="w-full">
                        <thead>
                          <tr
                            style={{
                              background: isDark
                                ? `linear-gradient(135deg, ${nodeColor}15, ${nodeColor}08)`
                                : `linear-gradient(135deg, ${nodeColor}08, ${nodeColor}04)`,
                            }}
                          >
                            <th
                              className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                              style={{
                                color: nodeColor,
                                width: "140px",
                                borderBottom: isDark
                                  ? `1px solid ${nodeColor}20`
                                  : `1px solid ${nodeColor}15`,
                              }}
                            >
                              기술
                            </th>
                            <th
                              className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.5)"
                                  : "rgba(0,0,0,0.5)",
                                borderBottom: isDark
                                  ? `1px solid ${nodeColor}20`
                                  : `1px solid ${nodeColor}15`,
                              }}
                            >
                              선정 이유
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.techStackDocs.map((tech, idx) => (
                            <tr
                              key={tech.name}
                              className="transition-all duration-200 hover:bg-opacity-50"
                              style={{
                                background:
                                  idx % 2 === 0
                                    ? "transparent"
                                    : isDark
                                    ? "rgba(255,255,255,0.02)"
                                    : "rgba(0,0,0,0.015)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${nodeColor}10`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  idx % 2 === 0
                                    ? "transparent"
                                    : isDark
                                    ? "rgba(255,255,255,0.02)"
                                    : "rgba(0,0,0,0.015)";
                              }}
                            >
                              <td
                                className="px-4 py-3 font-bold text-sm"
                                style={{
                                  color: nodeColor,
                                  borderBottom:
                                    idx ===
                                    (details.techStackDocs?.length || 0) - 1
                                      ? "none"
                                      : isDark
                                      ? "1px solid rgba(255,255,255,0.05)"
                                      : "1px solid rgba(0,0,0,0.05)",
                                }}
                              >
                                {tech.name}
                              </td>
                              <td
                                className="px-4 py-3 text-sm leading-relaxed"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.75)"
                                    : "#4b5563",
                                  borderBottom:
                                    idx ===
                                    (details.techStackDocs?.length || 0) - 1
                                      ? "none"
                                      : isDark
                                      ? "1px solid rgba(255,255,255,0.05)"
                                      : "1px solid rgba(0,0,0,0.05)",
                                }}
                              >
                                {tech.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // Fallback to simple tag list if no detailed docs
                  details?.technologies &&
                  details.technologies.length > 0 && (
                    <div>
                      <h3
                        className="text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-300"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(0,0,0,0.5)",
                        }}
                      >
                        Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {details.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1.5 text-sm rounded-lg transition-all duration-300 hover:scale-105 cursor-default"
                            style={{
                              background: isDark
                                ? "rgba(255, 255, 255, 0.08)"
                                : "rgba(0, 0, 0, 0.05)",
                              border: `1px solid ${nodeColor}30`,
                              color: nodeColor,
                              fontWeight: 500,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* 경력 (Career) */}
            {activeTab === "career" && details?.career && (
              <div className="space-y-6">
                {details.career.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 border-l-2 border-cyan-400/30"
                  >
                    <div className="absolute -left-[9px] top-0 w-[18px] h-[18px] rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-cyan-400">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-cyan-400">
                        {item.company}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm opacity-80 mt-1">
                        <span className="font-semibold">{item.role}</span>
                        <span>•</span>
                        <span>{item.period}</span>
                      </div>
                    </div>
                    {item.description && (
                      <p
                        className="text-sm leading-relaxed whitespace-pre-line"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 학력 (Education) */}
            {activeTab === "education" && details?.education && (
              <div className="space-y-4">
                {details.education.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl transition-all hover:translate-x-1"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                      border: isDark
                        ? `1px solid ${nodeColor}20`
                        : "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className="font-bold text-lg"
                        style={{ color: nodeColor }}
                      >
                        {item.school}
                      </h3>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm opacity-80 mb-2">
                      {item.major} • {item.period}
                    </div>
                    {item.gpa && (
                      <div className="text-sm font-medium">
                        GPA: <span className="text-cyan-400">{item.gpa}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 기술 (Skills) */}
            {activeTab === "skills" && details?.skills && (
              <div className="space-y-6">
                {details.skills.map((skillGroup, idx) => (
                  <div key={idx}>
                    <h3
                      className="text-sm font-semibold mb-3 uppercase tracking-wider"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.5)",
                      }}
                    >
                      {skillGroup.category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 text-sm rounded-lg transition-all duration-300 hover:scale-105 cursor-default"
                          style={{
                            background: isDark
                              ? "rgba(255, 255, 255, 0.08)"
                              : "rgba(0, 0, 0, 0.05)",
                            border: `1px solid ${nodeColor}30`,
                            color: nodeColor,
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 연구 (Research) */}
            {activeTab === "research" &&
              (details?.learnings || details?.features) && (
                <div className="space-y-8">
                  {/* 기존 features를 연구 관심사로 매핑하거나 learnings를 연구 성과로 활용 */}
                  {(details.features || details.learnings)?.map(
                    (item: any, idx) => (
                      <div
                        key={idx}
                        className="relative pl-6 border-l-2 border-cyan-400/30"
                      >
                        <div className="absolute -left-[9px] top-0 w-[18px] h-[18px] rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-cyan-400">
                            {idx + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-cyan-400">
                          {item.title}
                        </h3>
                        {item.items ? (
                          <ul className="space-y-2">
                            {item.items.map((subItem: string, i: number) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm leading-relaxed"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.8)"
                                    : "#374151",
                                }}
                              >
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-400/50 shrink-0" />
                                <span>{subItem}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p
                            className="text-sm leading-relaxed"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.8)"
                                : "#374151",
                            }}
                          >
                            {item.content}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

            {activeTab === "features" && details?.features && (
              <div className="space-y-8">
                {details.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 border-l-2 border-cyan-400/30"
                  >
                    <div className="absolute -left-[9px] top-0 w-[18px] h-[18px] rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-cyan-400">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-cyan-400">
                      {feature.title}
                    </h3>
                    <ul className="space-y-2">
                      {feature.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm leading-relaxed"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                          }}
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-400/50 shrink-0" />
                          <span>
                            {parseInlineMarkdown(item, {
                              codeColor: "#22d3ee",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "optimizations" && details?.optimizations && (
              <div className="space-y-4">
                {details.optimizations.map((opt, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                    style={{
                      background: isDark
                        ? "rgba(139, 92, 246, 0.05)"
                        : "rgba(139, 92, 246, 0.03)",
                      border: isDark
                        ? "1px solid rgba(139, 92, 246, 0.2)"
                        : "1px solid rgba(139, 92, 246, 0.15)",
                    }}
                  >
                    {/* 헤더 */}
                    <div
                      className="px-4 py-3 flex items-center gap-3"
                      style={{
                        background: isDark
                          ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))"
                          : "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.03))",
                        borderBottom: isDark
                          ? "1px solid rgba(139, 92, 246, 0.15)"
                          : "1px solid rgba(139, 92, 246, 0.1)",
                      }}
                    >
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold"
                        style={{
                          background: "rgba(139, 92, 246, 0.2)",
                          color: "#a78bfa",
                        }}
                      >
                        ⚡
                      </span>
                      <h3
                        className="font-bold text-base"
                        style={{ color: isDark ? "#c4b5fd" : "#7c3aed" }}
                      >
                        {opt.title}
                      </h3>
                    </div>

                    {/* 내용 - 테이블 형식 */}
                    <div className="py-2">
                      {opt.items.map((item, i) => {
                        // 성능 향상 수치 감지 (예: "45초 → 0.8초", "98%", "90%")
                        const hasMetric =
                          /(\d+[초s%]|\d+\.\d+[초s%]|→|->)/.test(item);

                        return (
                          <div
                            key={i}
                            className="flex items-start gap-3 px-4 py-2"
                            style={{
                              background:
                                i % 2 === 1
                                  ? isDark
                                    ? "rgba(139, 92, 246, 0.08)"
                                    : "rgba(139, 92, 246, 0.05)"
                                  : "transparent",
                            }}
                          >
                            <span
                              className="shrink-0 flex items-center justify-center"
                              style={{ width: "20px", height: "20px" }}
                            >
                              {hasMetric ? (
                                <span className="text-sm">📈</span>
                              ) : (
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full"
                                  style={{
                                    background: "rgba(139, 92, 246, 0.5)",
                                  }}
                                />
                              )}
                            </span>
                            <span
                              className="text-sm leading-relaxed"
                              style={{
                                color: hasMetric
                                  ? isDark
                                    ? "rgba(255,255,255,0.95)"
                                    : "#1f2937"
                                  : isDark
                                  ? "rgba(255,255,255,0.75)"
                                  : "#4b5563",
                                fontWeight: hasMetric ? 500 : 400,
                              }}
                            >
                              {parseInlineMarkdown(item, {
                                codeColor: "#a78bfa",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "trouble" && (
              <div className="space-y-6">
                {/* Detailed Challenges - 테이블 형식 */}
                {details?.challenges && details.challenges.length > 0 ? (
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      border: isDark
                        ? "1px solid rgba(239, 68, 68, 0.2)"
                        : "1px solid rgba(239, 68, 68, 0.15)",
                    }}
                  >
                    {details.challenges.map((challenge, idx) => (
                      <div
                        key={idx}
                        className="border-b last:border-b-0"
                        style={{
                          borderColor: isDark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.05)",
                        }}
                      >
                        {/* 이슈 제목 헤더 */}
                        <div
                          className="px-4 py-3 flex items-center gap-3"
                          style={{
                            background: isDark
                              ? "rgba(239, 68, 68, 0.08)"
                              : "rgba(239, 68, 68, 0.05)",
                          }}
                        >
                          <span
                            className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                            style={{
                              background: "rgba(239, 68, 68, 0.2)",
                              color: isDark ? "#f87171" : "#dc2626",
                            }}
                          >
                            {idx + 1}
                          </span>
                          <h3
                            className="font-bold text-sm"
                            style={{ color: isDark ? "#f87171" : "#dc2626" }}
                          >
                            {challenge.title}
                          </h3>
                        </div>

                        {/* 문제/해결 테이블 */}
                        <div className="grid grid-cols-1 md:grid-cols-2">
                          {/* 문제 셀 */}
                          <div
                            className="px-4 py-3"
                            style={{
                              background: isDark
                                ? "rgba(239, 68, 68, 0.03)"
                                : "rgba(239, 68, 68, 0.02)",
                              borderRight: isDark
                                ? "1px solid rgba(255,255,255,0.05)"
                                : "1px solid rgba(0,0,0,0.05)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-red-500">❌</span>
                              <span
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{
                                  color: isDark ? "#f87171" : "#dc2626",
                                }}
                              >
                                Challenge
                              </span>
                            </div>
                            <p
                              className="text-sm leading-relaxed"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.7)"
                                  : "#4b5563",
                              }}
                            >
                              {parseInlineMarkdown(challenge.problem, {
                                codeColor: "#f87171",
                              })}
                            </p>
                          </div>

                          {/* 해결 셀 */}
                          <div
                            className="px-4 py-3"
                            style={{
                              background: isDark
                                ? "rgba(34, 197, 94, 0.03)"
                                : "rgba(34, 197, 94, 0.02)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-green-500">✅</span>
                              <span
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{
                                  color: isDark ? "#4ade80" : "#16a34a",
                                }}
                              >
                                Solution
                              </span>
                            </div>
                            <p
                              className="text-sm leading-relaxed"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.9)"
                                  : "#1f2937",
                              }}
                            >
                              {parseInlineMarkdown(challenge.solution, {
                                codeColor: "#4ade80",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Simple Trouble/Shooting (Legacy format)
                  <>
                    {details?.trouble && (
                      <div className="relative pl-5 border-l-2 border-red-400/50">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                          <span className="text-sm">⚡</span>
                        </div>
                        <h3 className="text-lg font-semibold text-red-400 mb-2">
                          겪은 어려움
                        </h3>
                        <p
                          className="leading-relaxed transition-colors duration-300"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                          }}
                        >
                          {details.trouble}
                        </p>
                      </div>
                    )}

                    {details?.shooting && (
                      <div className="relative pl-5 border-l-2 border-green-400/50">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-sm">🎯</span>
                        </div>
                        <h3 className="text-lg font-semibold text-green-400 mb-2">
                          해결 과정
                        </h3>
                        <p
                          className="leading-relaxed transition-colors duration-300"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                          }}
                        >
                          {details.shooting}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "lesson" && (
              <div className="space-y-6">
                {/* Detailed Learnings (New Format) */}
                {details?.learnings && details.learnings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {details.learnings.map((learning, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl transition-all hover:-translate-y-1"
                        style={{
                          background: `linear-gradient(135deg, ${
                            isDark
                              ? "rgba(234, 179, 8, 0.1)"
                              : "rgba(234, 179, 8, 0.05)"
                          }, transparent)`,
                          border: "1px solid rgba(234, 179, 8, 0.2)",
                        }}
                      >
                        <h3 className="text-base font-bold text-yellow-500 mb-2 flex items-center gap-2">
                          <span>💡</span> {learning.title}
                        </h3>
                        <p
                          className="text-sm leading-relaxed"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                          }}
                        >
                          {parseInlineMarkdown(learning.content, {
                            codeColor: "#facc15",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Simple Lesson (Legacy Format)
                  details?.lesson && (
                    <div
                      className="p-5 rounded-2xl"
                      style={{
                        background: `linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05))`,
                        border: "1px solid rgba(234, 179, 8, 0.2)",
                      }}
                    >
                      <div className="flex gap-4">
                        <div className="text-3xl shrink-0">💡</div>
                        <div>
                          <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                            핵심 교훈
                          </h3>
                          <p
                            className="leading-relaxed text-lg italic transition-colors duration-300"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.85)"
                                : "#374151",
                            }}
                          >
                            "{details.lesson}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* References Tab (논문 참고문헌 전용) */}
            {activeTab === "references" && details?.references && (
              <div className="space-y-4">
                <p
                  className="text-sm mb-4"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280",
                  }}
                >
                  본 연구에서 참고한 학술 자료입니다.
                </p>
                <div
                  className="space-y-3 p-4 rounded-xl"
                  style={{
                    background: isDark
                      ? "rgba(59, 130, 246, 0.08)"
                      : "rgba(59, 130, 246, 0.05)",
                    border: isDark
                      ? "1px solid rgba(59, 130, 246, 0.2)"
                      : "1px solid rgba(59, 130, 246, 0.15)",
                  }}
                >
                  {details.references.map((ref) => (
                    <div
                      key={ref.id}
                      className="text-sm leading-relaxed pb-2"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                        borderBottom: isDark
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <span
                        className="font-semibold mr-2"
                        style={{ color: isDark ? "#93c5fd" : "#2563eb" }}
                      >
                        [{ref.id}]
                      </span>
                      {ref.authors} ({ref.year}).{" "}
                      <span className="italic">{ref.title}</span>.{" "}
                      <span
                        style={{
                          color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af",
                        }}
                      >
                        {ref.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "results" && details?.performance && (
              <div className="space-y-8">
                {details.performance.map((perf, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: isDark ? "#93c5fd" : "#1d4ed8" }}
                    >
                      {perf.title}
                    </h3>

                    {perf.description && (
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.7)" : "#4b5563",
                        }}
                      >
                        {perf.description}
                      </p>
                    )}

                    {perf.image && (
                      <div
                        className="rounded-xl overflow-hidden border"
                        style={{
                          borderColor: isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        }}
                      >
                        <img
                          src={perf.image}
                          alt={perf.title}
                          className="w-full h-auto object-contain bg-white/5"
                        />
                      </div>
                    )}

                    {perf.headers && perf.rows && (
                      <div
                        className="overflow-x-auto rounded-xl border"
                        style={{
                          borderColor: isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        }}
                      >
                        <table className="w-full text-sm text-center">
                          <thead>
                            <tr
                              style={{
                                background: isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.02)",
                                color: isDark
                                  ? "rgba(255,255,255,0.9)"
                                  : "#1f2937",
                              }}
                            >
                              {perf.headers.map((header, hIdx) => (
                                <th
                                  key={hIdx}
                                  className="px-4 py-3 font-semibold border-b"
                                  style={{
                                    borderColor: isDark
                                      ? "rgba(255,255,255,0.05)"
                                      : "rgba(0,0,0,0.05)",
                                  }}
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.8)"
                                : "#374151",
                            }}
                          >
                            {perf.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className="border-b last:border-0"
                                style={{
                                  borderColor: isDark
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.05)",
                                }}
                              >
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4 py-3">
                                    {typeof cell === "string"
                                      ? parseInlineMarkdown(cell)
                                      : cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "code" && details?.codeExamples && (
              <div className="space-y-6">
                {details.codeExamples.map((example, idx) => {
                  const categoryColors: Record<string, string> = {
                    architecture: "#8b5cf6",
                    async: "#06b6d4",
                    database: "#f59e0b",
                    business: "#10b981",
                    realtime: "#ec4899",
                    optimization: "#3b82f6",
                    performance: "#6366f1",
                    troubleshooting: "#ef4444",
                    analytics: "#14b8a6",
                    auth: "#f97316",
                    "state-management": "#8b5cf6",
                  };
                  const categoryLabels: Record<string, string> = {
                    architecture: t("categories.code.architecture"),
                    async: t("categories.code.async"),
                    database: t("categories.code.database"),
                    business: t("categories.code.business"),
                    realtime: t("categories.code.realtime"),
                    optimization: t("categories.code.optimization"),
                    performance: t("categories.code.performance"),
                    troubleshooting: t("categories.code.troubleshooting"),
                    analytics: t("categories.code.analytics"),
                    auth: t("categories.code.auth"),
                    "state-management": t("categories.code.state-management"),
                  };
                  const color = categoryColors[example.category] || nodeColor;

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                      style={{
                        background: isDark
                          ? "rgba(0, 0, 0, 0.3)"
                          : "rgba(255, 255, 255, 0.8)",
                        border: `1px solid ${color}30`,
                        boxShadow: isDark
                          ? `0 4px 20px rgba(0,0,0,0.3), 0 0 1px ${color}30`
                          : `0 4px 20px rgba(0,0,0,0.05)`,
                      }}
                    >
                      {/* 헤더 */}
                      <div
                        className="px-4 py-3 flex items-start justify-between gap-3"
                        style={{
                          background: isDark
                            ? `linear-gradient(135deg, ${color}15, transparent)`
                            : `linear-gradient(135deg, ${color}10, transparent)`,
                          borderBottom: `1px solid ${color}20`,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                              style={{
                                backgroundColor: `${color}20`,
                                color: color,
                                border: `1px solid ${color}40`,
                              }}
                            >
                              {categoryLabels[example.category] ||
                                example.category}
                            </span>
                            <span
                              className="text-xs font-mono opacity-60"
                              style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                            >
                              {example.filePath}
                            </span>
                          </div>
                          <h3
                            className="text-base font-bold"
                            style={{ color: isDark ? "white" : "#1f2937" }}
                          >
                            {example.title}
                          </h3>
                          <p
                            className="text-xs mt-1"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.6)"
                                : "rgba(0,0,0,0.6)",
                            }}
                          >
                            {example.description}
                          </p>
                        </div>
                        {example.githubLink && (
                          <a
                            href={example.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 p-1.5 rounded-lg transition-all hover:scale-110"
                            style={{
                              background: isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              className="w-4 h-4"
                              style={{ color: isDark ? "white" : "#1f2937" }}
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                          </a>
                        )}
                      </div>

                      {/* 코드 블록 */}
                      <div
                        className="p-4 overflow-x-auto custom-scrollbar"
                        style={{
                          background: isDark
                            ? "rgba(0, 0, 0, 0.4)"
                            : "rgba(30, 41, 59, 0.95)",
                        }}
                      >
                        <pre
                          className="text-xs font-mono leading-relaxed"
                          style={{
                            color: isDark ? "#e2e8f0" : "#e2e8f0",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          <code>
                            {example.snippet
                              .split("\n")
                              .map((line, lineIdx) => {
                                // 향상된 구문 강조 함수
                                const highlightCode = (code: string) => {
                                  // 주석 처리
                                  if (
                                    code.trim().startsWith("//") ||
                                    code.trim().startsWith("#")
                                  ) {
                                    return (
                                      <span
                                        style={{
                                          color: "#6b7280",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        {code}
                                      </span>
                                    );
                                  }

                                  // 토큰화 정규식
                                  const tokenRegex =
                                    /(\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|\b(?:const|let|var|function|return|if|else|async|await|import|export|from|default|class|extends|new|this|try|catch|throw|finally|for|while|do|switch|case|break|continue|typeof|instanceof|in|of|true|false|null|undefined|void)\b|<\/?[A-Z][a-zA-Z0-9]*|<\/?[a-z][a-zA-Z0-9-]*|\b(?:use[A-Z][a-zA-Z]*|set[A-Z][a-zA-Z]*|get[A-Z][a-zA-Z]*)\b|\b[A-Z][a-zA-Z0-9]*(?=\s*[(:])|\b[a-z][a-zA-Z0-9]*(?=\s*\()|\{|\}|\(|\)|=>|\.\.\.|\?\.)/gm;

                                  const parts = [];
                                  let lastIndex = 0;
                                  let match;

                                  while (
                                    (match = tokenRegex.exec(code)) !== null
                                  ) {
                                    // 앞의 텍스트
                                    if (match.index > lastIndex) {
                                      parts.push(
                                        <span key={`t-${lastIndex}`}>
                                          {code.slice(lastIndex, match.index)}
                                        </span>
                                      );
                                    }

                                    const token = match[0];
                                    let color = "#e2e8f0"; // 기본
                                    let fontWeight = "normal";

                                    // 색상 결정
                                    if (
                                      token.startsWith("//") ||
                                      token.startsWith("#")
                                    ) {
                                      color = "#6b7280"; // 주석
                                    } else if (
                                      token.startsWith("'") ||
                                      token.startsWith('"') ||
                                      token.startsWith("`")
                                    ) {
                                      color = "#a5d6a7"; // 문자열 (연두색)
                                    } else if (
                                      [
                                        "const",
                                        "let",
                                        "var",
                                        "function",
                                        "class",
                                        "extends",
                                        "new",
                                        "import",
                                        "export",
                                        "from",
                                        "default",
                                      ].includes(token)
                                    ) {
                                      color = "#c084fc"; // 키워드 (보라색)
                                      fontWeight = "500";
                                    } else if (
                                      [
                                        "return",
                                        "if",
                                        "else",
                                        "for",
                                        "while",
                                        "do",
                                        "switch",
                                        "case",
                                        "break",
                                        "continue",
                                        "try",
                                        "catch",
                                        "throw",
                                        "finally",
                                      ].includes(token)
                                    ) {
                                      color = "#f472b6"; // 제어문 (분홍색)
                                    } else if (
                                      ["async", "await"].includes(token)
                                    ) {
                                      color = "#fb923c"; // 비동기 (오렌지)
                                      fontWeight = "600";
                                    } else if (
                                      [
                                        "true",
                                        "false",
                                        "null",
                                        "undefined",
                                        "void",
                                        "this",
                                      ].includes(token)
                                    ) {
                                      color = "#fbbf24"; // 리터럴 (노랑)
                                    } else if (
                                      token.startsWith("<") &&
                                      token.length > 1
                                    ) {
                                      color = "#60a5fa"; // JSX 태그 (파랑)
                                    } else if (
                                      token.startsWith("use") ||
                                      token.startsWith("set") ||
                                      token.startsWith("get")
                                    ) {
                                      color = "#22d3ee"; // React Hooks (시안)
                                    } else if (/^[A-Z]/.test(token)) {
                                      color = "#4ade80"; // 컴포넌트/클래스 (초록)
                                    } else if (/^[a-z].*\(/.test(token + "(")) {
                                      color = "#93c5fd"; // 함수 호출 (연파랑)
                                    } else if (
                                      ["=>", "...", "?."].includes(token)
                                    ) {
                                      color = "#f472b6"; // 연산자 (분홍)
                                    } else if (
                                      ["{", "}", "(", ")"].includes(token)
                                    ) {
                                      color = "#fcd34d"; // 괄호 (노랑)
                                    }

                                    parts.push(
                                      <span
                                        key={`m-${match.index}`}
                                        style={{ color, fontWeight }}
                                      >
                                        {token}
                                      </span>
                                    );

                                    lastIndex = match.index + token.length;
                                  }

                                  // 남은 텍스트
                                  if (lastIndex < code.length) {
                                    parts.push(
                                      <span key={`e-${lastIndex}`}>
                                        {code.slice(lastIndex)}
                                      </span>
                                    );
                                  }

                                  return parts.length > 0 ? parts : code;
                                };

                                return (
                                  <div
                                    key={lineIdx}
                                    className="hover:bg-white/5 px-1 -mx-1 rounded"
                                  >
                                    <span
                                      className="select-none opacity-40 mr-3 inline-block w-4 text-right"
                                      style={{ color: "#64748b" }}
                                    >
                                      {lineIdx + 1}
                                    </span>
                                    {highlightCode(line)}
                                  </div>
                                );
                              })}
                          </code>
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 하단 힌트 */}
        <div
          className="px-6 pb-4 flex justify-end items-center gap-4 pt-3"
          style={{
            borderTop: isDark
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* 모바일: 스와이프 힌트 */}
          <span
            className="text-xs flex items-center gap-1.5 transition-colors duration-300 md:hidden"
            style={{
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
            }}
          >
            {t("modal.navigation.swipeTraverse")}
          </span>

          {/* 데스크톱: 키보드 힌트 */}
          <span
            className="text-xs hidden md:flex items-center gap-1.5 transition-colors duration-300"
            style={{
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
            }}
          >
            <kbd
              className="px-1.5 py-0.5 rounded font-mono text-[10px]"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              ←
            </kbd>
            <kbd
              className="px-1.5 py-0.5 rounded font-mono text-[10px]"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              →
            </kbd>
            {t("modal.navigation.traverse")}
          </span>
          <span
            className="text-xs hidden md:flex items-center gap-1.5 transition-colors duration-300"
            style={{
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
            }}
          >
            <kbd
              className="px-1.5 py-0.5 rounded font-mono text-[10px]"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              ESC
            </kbd>
            {t("modal.close")}
          </span>
        </div>
      </div>
    </div>
  );
}
