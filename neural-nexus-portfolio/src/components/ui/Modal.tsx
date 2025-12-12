import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "../../stores/useAppStore";
import nodesData from "../../data/nodes.json";
import type { NeuralData } from "../../types";

type TabType = "description" | "trouble" | "lesson";

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
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [isVisible, setIsVisible] = useState(false);
  const [tabDirection, setTabDirection] = useState<"left" | "right">("right");

  const data = nodesData as NeuralData;
  const node = data.nodes.find((n) => n.id === activeNode);

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
    const tabOrder: TabType[] = ["description", "trouble", "lesson"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    setTabDirection(newIndex > currentIndex ? "right" : "left");
    setActiveTab(newTab);
  };

  if (!isModalOpen || !node) return null;

  const details = node.details;
  const hasTrouble = details?.trouble || details?.shooting;
  const hasLesson = details?.lesson;
  const nodeColor = node.color || "#00ffff";

  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    available: boolean;
  }[] = [
    { id: "description", label: "개요", icon: "📋", available: true },
    {
      id: "trouble",
      label: "문제 해결",
      icon: "🔧",
      available: Boolean(hasTrouble),
    },
    {
      id: "lesson",
      label: "배운 점",
      icon: "💡",
      available: Boolean(hasLesson),
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
          background: `radial-gradient(ellipse at center, ${nodeColor}15 0%, transparent 50%), rgba(0, 0, 0, 0.6)`,
          backdropFilter: "blur(8px)",
        }}
      />

      {/* 모달 본체 */}
      <div
        className={`
          relative w-full max-w-2xl max-h-[85vh] overflow-hidden
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
          background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)`,
          backdropFilter: "blur(24px)",
          border: `1px solid ${nodeColor}30`,
          boxShadow: `
            0 0 60px ${nodeColor}20,
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `,
        }}
      >
        {/* 상단 글로우 라인 */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4"
          style={{
            background: `linear-gradient(90deg, transparent, ${nodeColor}, transparent)`,
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
                  background: `linear-gradient(135deg, ${nodeColor}40, ${nodeColor}20)`,
                  border: `1px solid ${nodeColor}50`,
                  boxShadow: `0 0 30px ${nodeColor}30`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: nodeColor }}
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
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
                  <span className="text-white/40 text-sm">
                    {node.connections.length}개 연결
                  </span>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="group p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shrink-0"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              aria-label="닫기 (ESC)"
            >
              <svg
                className="w-5 h-5 text-white/60 group-hover:text-white transition-colors"
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
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            {tabs
              .filter((tab) => tab.available)
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative flex-1 flex items-center justify-center gap-2
                    px-4 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-300
                    ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-white/50 hover:text-white/80"
                    }
                  `}
                >
                  {activeTab === tab.id && (
                    <div
                      className="absolute inset-0 rounded-lg transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${nodeColor}30, ${nodeColor}15)`,
                        border: `1px solid ${nodeColor}40`,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.icon}</span>
                  <span className="relative z-10 hidden sm:inline">
                    {tab.label}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="relative px-6 pb-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
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
                <p className="text-white/85 text-base leading-relaxed">
                  {details?.description || "설명이 없습니다."}
                </p>

                {/* 사용 기술 */}
                {details?.technologies && details.technologies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {details.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 text-sm rounded-lg transition-all duration-300 hover:scale-105 cursor-default"
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: `1px solid ${nodeColor}30`,
                            color: nodeColor,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 외부 링크 */}
                {details?.link && (
                  <div className="pt-2">
                    <a
                      href={details.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${nodeColor}25, ${nodeColor}10)`,
                        border: `1px solid ${nodeColor}40`,
                        color: nodeColor,
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span className="font-medium">프로젝트 보기</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === "trouble" && (
              <div className="space-y-6">
                {details?.trouble && (
                  <div className="relative pl-5 border-l-2 border-red-400/50">
                    <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-sm">⚡</span>
                    </div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      겪은 어려움
                    </h3>
                    <p className="text-white/80 leading-relaxed">
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
                    <p className="text-white/80 leading-relaxed">
                      {details.shooting}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "lesson" && details?.lesson && (
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
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                      핵심 교훈
                    </h3>
                    <p className="text-white/85 leading-relaxed text-lg italic">
                      "{details.lesson}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 키보드 힌트 */}
        <div className="px-6 pb-4 flex justify-end border-t border-white/5 pt-3">
          <span className="text-white/30 text-xs flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">
              ESC
            </kbd>
            닫기
          </span>
        </div>
      </div>
    </div>
  );
}
