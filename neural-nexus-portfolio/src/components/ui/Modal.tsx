import { useState, useEffect } from "react";
import { useAppStore } from "../../stores/useAppStore";
import nodesData from "../../data/nodes.json";
import type { NeuralData } from "../../types";

type TabType = "description" | "trouble" | "lesson";

/**
 * 글래스모피즘 모달 컴포넌트
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

  const data = nodesData as NeuralData;
  const node = data.nodes.find((n) => n.id === activeNode);

  // 애니메이션 상태 관리
  useEffect(() => {
    if (isModalOpen) {
      // 부드러운 진입 애니메이션을 위한 딜레이
      setTimeout(() => setIsVisible(true), 100);
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
    }, 300);
  };

  if (!isModalOpen || !node) return null;

  const details = node.details;
  const hasTrouble = details?.trouble || details?.shooting;
  const hasLesson = details?.lesson;

  const tabs: { id: TabType; label: string; available: boolean }[] = [
    { id: "description", label: "개요", available: true },
    { id: "trouble", label: "문제 해결", available: Boolean(hasTrouble) },
    { id: "lesson", label: "배운 점", available: Boolean(hasLesson) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* 배경 오버레이 */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 모달 본체 */}
      <div
        className={`
          relative max-w-2xl w-full max-h-[80vh] overflow-hidden
          bg-white/10 backdrop-blur-xl
          border border-white/20 rounded-2xl
          shadow-2xl shadow-cyan-500/20
          transition-all duration-500 ease-out
          ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 글로우 효과 */}
        <div
          className="absolute -inset-1 rounded-2xl opacity-50 blur-xl"
          style={{
            background: `linear-gradient(135deg, ${
              node.color || "#00ffff"
            }40, #ff00ff40)`,
          }}
        />

        {/* 컨텐츠 컨테이너 */}
        <div className="relative">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              {/* 노드 타입 인디케이터 */}
              <div
                className="w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: node.color || "#00ffff" }}
              />
              <div>
                <h2 className="text-2xl font-bold text-white">{node.label}</h2>
                <span className="text-sm text-white/60 capitalize">
                  {node.type}
                </span>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <svg
                className="w-6 h-6"
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

          {/* 탭 네비게이션 */}
          <div className="flex gap-1 p-2 border-b border-white/10">
            {tabs
              .filter((tab) => tab.available)
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }
                `}
                >
                  {tab.label}
                </button>
              ))}
          </div>

          {/* 컨텐츠 영역 */}
          <div className="p-6 max-h-[50vh] overflow-y-auto">
            {activeTab === "description" && (
              <div className="space-y-4">
                <p className="text-white/90 leading-relaxed">
                  {details?.description || "설명이 없습니다."}
                </p>

                {/* 사용 기술 */}
                {details?.technologies && details.technologies.length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-sm font-semibold text-white/60 mb-2">
                      사용 기술
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {details.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-sm rounded-full bg-white/10 text-cyan-300 border border-cyan-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 외부 링크 */}
                {details?.link && (
                  <div className="pt-4">
                    <a
                      href={details.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition-colors"
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
                      프로젝트 보기
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === "trouble" && (
              <div className="space-y-6">
                {details?.trouble && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <span className="text-xl">⚡</span> 겪은 어려움
                    </h3>
                    <p className="text-white/80 leading-relaxed pl-7">
                      {details.trouble}
                    </p>
                  </div>
                )}

                {details?.shooting && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <span className="text-xl">🎯</span> 해결 과정
                    </h3>
                    <p className="text-white/80 leading-relaxed pl-7">
                      {details.shooting}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "lesson" && details?.lesson && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span> 핵심 교훈
                </h3>
                <p className="text-white/90 leading-relaxed pl-7 italic">
                  "{details.lesson}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
