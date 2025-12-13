import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "../../stores/useAppStore";
import nodesData from "../../data/nodes.json";
import type { NeuralData } from "../../types";
import { getThemeColor } from "../../utils/themeUtils";

type TabType =
  | "description"
  | "features"
  | "optimizations"
  | "trouble"
  | "lesson";

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
  } = useAppStore();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [isVisible, setIsVisible] = useState(false);
  const [tabDirection, setTabDirection] = useState<"left" | "right">("right");

  const data = nodesData as NeuralData;
  const node = data.nodes.find((n) => n.id === activeNode);

  const rawColor = node?.color || "#00ffff";
  const nodeColor = getThemeColor(rawColor, theme);

  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleClose();
      }
    },
    [isModalOpen]
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

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setModalOpen(false);
      setActiveNode(null);
      setCameraTarget(null);
      setActiveTab("description");
    }, 300);
  };

  const handleTabChange = (newTab: TabType) => {
    const tabOrder: TabType[] = [
      "description",
      "features",
      "optimizations",
      "trouble",
      "lesson",
    ];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    setTabDirection(newIndex > currentIndex ? "right" : "left");
    setActiveTab(newTab);
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

      {/* 모달 본체 */}
      <div
        className={`
          relative w-[90vw] md:w-[85vw] max-w-5xl max-h-[90vh] flex flex-col overflow-hidden
          rounded-3xl
          transition-all duration-500 ease-out
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
                <h2
                  className="text-2xl md:text-3xl font-bold tracking-tight leading-tight transition-colors duration-300"
                  style={{ color: isDark ? "white" : "#1f2937" }}
                >
                  {node.label}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
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
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.4)"
                        : "rgba(0,0,0,0.5)",
                    }}
                  >
                    {node.connections.length}개 연결
                  </span>
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

                {/* 기술 스택 선정 이유 (Tech Stack Docs) */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {details.techStackDocs.map((tech) => (
                        <div
                          key={tech.name}
                          className="p-3 rounded-xl transition-all hover:bg-opacity-80"
                          style={{
                            background: isDark
                              ? "rgba(255, 255, 255, 0.03)"
                              : "rgba(0, 0, 0, 0.02)",
                            border: `1px solid ${nodeColor}20`,
                          }}
                        >
                          <div
                            className="font-bold mb-1"
                            style={{ color: nodeColor }}
                          >
                            {tech.name}
                          </div>
                          <div
                            className="text-xs leading-relaxed"
                            style={{
                              color: isDark
                                ? "rgba(255, 255, 255, 0.6)"
                                : "rgba(0, 0, 0, 0.6)",
                            }}
                          >
                            {tech.description}
                          </div>
                        </div>
                      ))}
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
                {(details?.link || details?.deployLink) && (
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
              <div className="space-y-8">
                {details.optimizations.map((opt, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 border-l-2 border-purple-400/30"
                  >
                    <div className="absolute -left-[9px] top-0 w-[18px] h-[18px] rounded-full bg-purple-400/20 border border-purple-400 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-purple-400">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-purple-400">
                      {opt.title}
                    </h3>
                    <ul className="space-y-2">
                      {opt.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm leading-relaxed"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                          }}
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-400/50 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "trouble" && (
              <div className="space-y-6">
                {/* Detailed Challenges (New format) */}
                {details?.challenges && details.challenges.length > 0 ? (
                  <div className="space-y-8">
                    {details.challenges.map((challenge, idx) => (
                      <div
                        key={idx}
                        className="relative p-5 rounded-2xl transition-all hover:translate-x-1"
                        style={{
                          background: isDark
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,0,0,0.02)",
                          border: isDark
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "1px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        <h3
                          className="text-lg font-bold mb-4 flex items-center gap-2"
                          style={{ color: isDark ? "#f87171" : "#dc2626" }}
                        >
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-sm">
                            !
                          </span>
                          {challenge.title}
                        </h3>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                              Challenge
                            </span>
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

                          <div className="space-y-1 pl-4 border-l-2 border-green-500/30">
                            <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                              Solution
                            </span>
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
          </div>
        </div>

        {/* 하단 키보드 힌트 */}
        <div
          className="px-6 pb-4 flex justify-end pt-3"
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
              ESC
            </kbd>
            닫기
          </span>
        </div>
      </div>
    </div>
  );
}
