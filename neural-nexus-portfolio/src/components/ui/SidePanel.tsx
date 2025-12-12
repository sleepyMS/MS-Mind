import { useState } from "react";
import { useAppStore } from "../../stores/useAppStore";
import nodesData from "../../data/nodes.json";
import type { NeuralData, NodeType } from "../../types";

const typeLabels: Record<
  NodeType,
  { label: string; icon: string; color: string }
> = {
  main: { label: "메인", icon: "👤", color: "#00ffff" },
  project: { label: "프로젝트", icon: "🚀", color: "#ff00ff" },
  skill: { label: "스킬", icon: "⚡", color: "#88ce02" },
  lesson: { label: "교훈", icon: "💡", color: "#f59e0b" },
};

/**
 * 노드 탐색을 위한 사이드 패널 컴포넌트
 */
export function SidePanel() {
  const {
    isSidePanelOpen,
    setSidePanelOpen,
    searchQuery,
    setSearchQuery,
    setActiveNode,
    setModalOpen,
    setCameraTarget,
    nodePositions,
  } = useAppStore();

  const [expandedTypes, setExpandedTypes] = useState<NodeType[]>([
    "main",
    "project",
    "skill",
  ]);
  const data = nodesData as NeuralData;

  const filteredNodes = data.nodes.filter(
    (node) =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.details?.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    const type = node.type as NodeType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(node);
    return acc;
  }, {} as Record<NodeType, typeof data.nodes>);

  const toggleType = (type: NodeType) => {
    setExpandedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleNodeClick = (nodeId: string) => {
    const position = nodePositions.get(nodeId);
    if (position) {
      setCameraTarget(position);
    }
    setActiveNode(nodeId);
    setModalOpen(true);
  };

  return (
    <>
      {/* 토글 버튼 */}
      <button
        onClick={() => setSidePanelOpen(!isSidePanelOpen)}
        className={`
          fixed left-4 top-1/2 -translate-y-1/2 z-40
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-all duration-300
          ${
            isSidePanelOpen
              ? "translate-x-64 md:translate-x-72"
              : "translate-x-0"
          }
        `}
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        aria-label={isSidePanelOpen ? "패널 닫기" : "패널 열기"}
      >
        <svg
          className={`w-5 h-5 text-white/70 transition-transform duration-300 ${
            isSidePanelOpen ? "rotate-180" : ""
          }`}
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

      {/* 패널 본체 */}
      <div
        className={`
          fixed left-0 top-0 bottom-0 z-30
          w-64 md:w-72 flex flex-col
          transition-transform duration-300 ease-out
          ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,16,0.95) 0%, rgba(0,0,16,0.9) 100%)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-cyan-400">🧠</span>
            노드 탐색
          </h2>

          {/* 검색창 */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm text-white placeholder-white/40 outline-none transition-all focus:ring-2"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 노드 목록 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {(Object.keys(typeLabels) as NodeType[]).map((type) => {
            const nodes = groupedNodes[type] || [];
            if (nodes.length === 0) return null;

            const typeInfo = typeLabels[type];
            const isExpanded = expandedTypes.includes(type);

            return (
              <div key={type} className="mb-3">
                <button
                  onClick={() => toggleType(type)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
                  style={{ color: typeInfo.color }}
                >
                  <div className="flex items-center gap-2">
                    <span>{typeInfo.icon}</span>
                    <span>{typeInfo.label}</span>
                    <span className="text-white/40 text-xs">
                      ({nodes.length})
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
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
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-2 space-y-1">
                    {nodes.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => handleNodeClick(node.id)}
                        className="group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all hover:bg-white/10"
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: node.color || typeInfo.color,
                          }}
                        />
                        <span className="text-white/80 group-hover:text-white truncate">
                          {node.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredNodes.length === 0 && (
            <div className="text-center py-8 text-white/40 text-sm">
              검색 결과가 없습니다
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-white/10">
          <p className="text-white/30 text-xs text-center">
            총 {data.nodes.length}개의 노드
          </p>
        </div>
      </div>
    </>
  );
}
