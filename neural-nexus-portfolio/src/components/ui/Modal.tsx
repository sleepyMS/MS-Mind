import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "../../stores/useAppStore";
import { nodesData } from "../../data";
import type { NeuralData } from "../../types";
import { getThemeColor } from "../../utils/themeUtils";
import { MiniTooltip } from "./MiniTooltip";

type TabType =
  | "description"
  | "features"
  | "optimizations"
  | "trouble"
  | "lesson"
  | "code"
  | "references"
  | "results";

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
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [isVisible, setIsVisible] = useState(false);
  const [tabDirection, setTabDirection] = useState<"left" | "right">("right");
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const connectionsRef = useRef<HTMLDivElement>(null);

  const data = nodesData as NeuralData;
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

  // 애니메이션 상태 관리
  useEffect(() => {
    if (isModalOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
    }
  }, [isModalOpen]);

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
    setActiveTab("description");
    setIsConnectionsOpen(false);
  };

  const handleTabChange = (newTab: TabType) => {
    const tabOrder: TabType[] = [
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

  // 노드 순회 함수
  const navigateNode = (direction: -1 | 1) => {
    const currentIndex = data.nodes.findIndex((n) => n.id === activeNode);
    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;
    // 순환 처리
    if (newIndex < 0) newIndex = data.nodes.length - 1;
    if (newIndex >= data.nodes.length) newIndex = 0;

    const newNode = data.nodes[newIndex];
    const newPosition = nodePositions.get(newNode.id);

    setActiveNode(newNode.id);
    if (newPosition) {
      setCameraTarget(newPosition);
    }
    setActiveTab("description"); // 탭 초기화
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
    { id: "description", label: "개요", icon: "📋", available: true },
    {
      id: "features",
      label: "주요 기능",
      icon: "🚀",
      available: Boolean(details?.features && details.features.length > 0),
    },
    {
      id: "optimizations",
      label: "최적화",
      icon: "⚡",
      available: Boolean(
        details?.optimizations && details.optimizations.length > 0
      ),
    },
    {
      id: "trouble",
      label: "트러블슈팅",
      icon: "🔧",
      available: Boolean(
        hasTrouble || (details?.challenges && details.challenges.length > 0)
      ),
    },
    {
      id: "code",
      label: "코드",
      icon: "💻",
      available: Boolean(
        details?.codeExamples && details.codeExamples.length > 0
      ),
    },
    {
      id: "results",
      label: "실험 결과",
      icon: "📊",
      available: Boolean(
        details?.performance && details.performance.length > 0
      ),
    },
    {
      id: "references",
      label: "참고문헌",
      icon: "📚",
      available: Boolean(details?.references && details.references.length > 0),
    },
    {
      id: "lesson",
      label: "배운 점",
      icon: "💡",
      available: Boolean(
        hasLesson || (details?.learnings && details.learnings.length > 0)
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

      {/* 이전 노드 버튼 (왼쪽) */}
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
          ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
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
        aria-label="이전 노드"
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

      {/* 다음 노드 버튼 (오른쪽) */}
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
          ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
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
        aria-label="다음 노드"
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* 노드 아이콘 */}
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
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

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* 제목 (링크가 있으면 클릭 가능) */}
                  {details?.link ? (
                    <MiniTooltip content="GitHub에서 보기">
                      <a
                        href={details.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="group/title flex items-center gap-2 transition-all duration-300"
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
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                          {node.label}
                        </h2>
                        {/* GitHub 아이콘 */}
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 opacity-50 group-hover/title:opacity-100 transition-all duration-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    </MiniTooltip>
                  ) : (
                    <h2
                      className="text-2xl md:text-3xl font-bold tracking-tight leading-tight transition-colors duration-300"
                      style={{ color: isDark ? "white" : "#1f2937" }}
                    >
                      {node.label}
                    </h2>
                  )}

                  {/* 배포 링크 아이콘 */}
                  {details?.deployLink && (
                    <MiniTooltip content="배포된 사이트 보기">
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
                  )}

                  {/* PDF 링크 아이콘 */}
                  {details?.pdfLink && (
                    <MiniTooltip content="PDF 보기">
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
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
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

                  {/* 연결 노드 드롭다운 */}
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
                        main: "메인",
                        project: "프로젝트",
                        skill: "스킬",
                        lesson: "교훈",
                      };

                      const typeIcons: Record<string, string> = {
                        main: "🏠",
                        project: "📁",
                        skill: "⚡",
                        lesson: "💡",
                      };

                      // 타입 순서 정의: main → project → skill → lesson
                      const typeOrder = ["main", "project", "skill", "lesson"];

                      const parts = typeOrder
                        .filter((type) => connectionsByType[type])
                        .map(
                          (type) =>
                            `${typeLabels[type] || type} ${
                              connectionsByType[type].length
                            }개`
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
                            <span>{parts ? `${parts} 연결` : "연결 없음"}</span>
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
                                          className="w-full px-3 py-2.5 flex items-center gap-2.5 text-left transition-all duration-200"
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
              className="group p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shrink-0"
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
              aria-label="닫기 (ESC)"
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
            className="flex gap-1 p-1 rounded-xl"
            style={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.03)",
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
                      relative flex-1 flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-300
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
                      if (!isActive) {
                        e.currentTarget.style.color = isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.5)";
                        e.currentTarget.style.transform = "translateY(0)";
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
            {activeTab === "description" && (
              <div className="space-y-5">
                {/* 설명 */}
                <p
                  className="text-base leading-relaxed transition-colors duration-300"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.85)" : "#374151",
                  }}
                >
                  {details?.description || "설명이 없습니다."}
                </p>

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
                          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg"
                          style={{
                            background: isDark
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.03)",
                            color: isDark ? "rgba(255,255,255,0.9)" : "#1f2937",
                          }}
                        >
                          <span className="text-cyan-400">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
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
                      Tech Stack & Decisions
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

                {/* 외부 링크 및 배포 링크 */}
                {(details?.link || details?.deployLink || details?.pdfLink) && (
                  <div className="flex flex-wrap gap-3 pt-2">
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
                        <span className="font-medium">프로젝트 보기</span>
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
                        <span className="font-bold">배포 사이트</span>
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
                        <span className="font-medium">논문 PDF</span>
                      </a>
                    )}
                  </div>
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
                          <span>{item}</span>
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
                              {item}
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
                              {challenge.problem}
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
                              {challenge.solution}
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
                          {learning.content}
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
                                    {cell}
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
                    architecture: "아키텍처",
                    async: "비동기",
                    database: "데이터베이스",
                    business: "비즈니스 로직",
                    realtime: "실시간",
                    optimization: "최적화",
                    performance: "성능",
                    troubleshooting: "트러블슈팅",
                    analytics: "분석",
                    auth: "인증",
                    "state-management": "상태관리",
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

        {/* 하단 키보드 힌트 */}
        <div
          className="px-6 pb-4 flex justify-end items-center gap-4 pt-3"
          style={{
            borderTop: isDark
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <span
            className="text-xs flex items-center gap-1.5 transition-colors duration-300"
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
            순회
          </span>
          <span
            className="text-xs flex items-center gap-1.5 transition-colors duration-300"
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
            닫기
          </span>
        </div>
      </div>
    </div>
  );
}
