import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";
import { getNodesData } from "../../data";
import type {
  NeuralData,
  NodeType,
  ProjectCategory,
  SkillCategory,
} from "../../types";
import { getThemeColor } from "../../utils/themeUtils";

const typeConfig: Record<
  NodeType,
  { icon: string; darkColor: string; lightColor: string }
> = {
  main: { icon: "👤", darkColor: "#00ffff", lightColor: "#0891b2" },
  project: { icon: "🚀", darkColor: "#ff00ff", lightColor: "#c026d3" },
  skill: { icon: "⚡", darkColor: "#88ce02", lightColor: "#65a30d" },
  lesson: { icon: "💡", darkColor: "#f59e0b", lightColor: "#d97706" },
};

// 프로젝트 카테고리 설정
const categoryConfig: Record<
  ProjectCategory,
  { icon: string; label: string; darkColor: string; lightColor: string }
> = {
  frontend: {
    icon: "🎨",
    label: "프론트엔드",
    darkColor: "#c026d3",
    lightColor: "#a21caf",
  },
  backend: {
    icon: "⚙️",
    label: "백엔드",
    darkColor: "#f97316",
    lightColor: "#ea580c",
  },
  "ai-ml": {
    icon: "🤖",
    label: "AI / ML",
    darkColor: "#8b5cf6",
    lightColor: "#7c3aed",
  },
  creative: {
    icon: "🎮",
    label: "크리에이티브",
    darkColor: "#10b981",
    lightColor: "#059669",
  },
};

// 스킬 카테고리 설정
const skillCategoryConfig: Record<
  SkillCategory,
  { icon: string; label: string; darkColor: string; lightColor: string }
> = {
  language: {
    icon: "💻",
    label: "언어",
    darkColor: "#3b82f6",
    lightColor: "#2563eb",
  },
  framework: {
    icon: "🏗️",
    label: "프레임워크",
    darkColor: "#8b5cf6",
    lightColor: "#7c3aed",
  },
  library: {
    icon: "📦",
    label: "라이브러리",
    darkColor: "#ec4899",
    lightColor: "#db2777",
  },
  tool: {
    icon: "🔧",
    label: "도구",
    darkColor: "#f97316",
    lightColor: "#ea580c",
  },
  database: {
    icon: "🗄️",
    label: "데이터베이스",
    darkColor: "#14b8a6",
    lightColor: "#0d9488",
  },
};

/**
 * 노드 탐색을 위한 사이드 패널 컴포넌트
 */
export function SidePanel() {
  const { t, i18n } = useTranslation();
  const {
    isSidePanelOpen,
    setSidePanelOpen,
    searchQuery,
    setSearchQuery,
    setActiveNode,
    setModalOpen,
    setCameraTarget,
    nodePositions,
    setHoveredNode,
    theme,
  } = useAppStore();
  const isDark = theme === "dark";
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 모바일에서는 사이드바 초기 접힘
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidePanelOpen(false);
    }
  }, [setSidePanelOpen]);

  // 모바일에서 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isMobile = window.innerWidth < 768;
      if (
        isMobile &&
        isSidePanelOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setSidePanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidePanelOpen, setSidePanelOpen]);

  const [expandedTypes, setExpandedTypes] = useState<NodeType[]>([
    "main",
    "project",
    "skill",
  ]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const data = getNodesData(i18n.language);

  const filteredNodes = data.nodes.filter(
    (node) =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.details?.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      node.details?.features?.some(
        (f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.items.some((i) =>
            i.toLowerCase().includes(searchQuery.toLowerCase())
          )
      ) ||
      node.details?.optimizations?.some(
        (o) =>
          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.items.some((i) =>
            i.toLowerCase().includes(searchQuery.toLowerCase())
          )
      ) ||
      node.details?.challenges?.some(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.solution.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      node.details?.learnings?.some(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    const type = node.type as NodeType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(node);
    return acc;
  }, {} as Record<NodeType, typeof data.nodes>);

  // 프로젝트를 카테고리별로 그룹화
  const projectsByCategory = (groupedNodes.project || []).reduce(
    (acc, node) => {
      const category = (node.category || "frontend") as ProjectCategory;
      if (!acc[category]) acc[category] = [];
      acc[category].push(node);
      return acc;
    },
    {} as Record<ProjectCategory, typeof data.nodes>
  );

  // 스킬을 카테고리별로 그룹화
  const skillsByCategory = (groupedNodes.skill || []).reduce((acc, node) => {
    const category = (node.skillCategory || "library") as SkillCategory;
    if (!acc[category]) acc[category] = [];
    acc[category].push(node);
    return acc;
  }, {} as Record<SkillCategory, typeof data.nodes>);

  // 프로젝트 카테고리 확장 상태
  const [expandedCategories, setExpandedCategories] = useState<
    ProjectCategory[]
  >(["frontend", "backend", "ai-ml", "creative"]);

  // 스킬 카테고리 확장 상태
  const [expandedSkillCategories, setExpandedSkillCategories] = useState<
    SkillCategory[]
  >(["language", "framework", "library", "tool", "database"]);

  const toggleCategory = (category: ProjectCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleSkillCategory = (category: SkillCategory) => {
    setExpandedSkillCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

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

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNodeId(nodeId);
    setHoveredNode(nodeId);
  };

  return (
    <>
      {/* 토글 버튼 */}
      <button
        ref={buttonRef}
        onClick={() => setSidePanelOpen(!isSidePanelOpen)}
        className={`
          fixed left-4 top-1/2 -translate-y-1/2 z-40
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-all duration-300 hover:scale-110 cursor-pointer active:scale-95
          ${
            isSidePanelOpen
              ? "translate-x-64 md:translate-x-72"
              : "translate-x-0"
          }
        `}
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
        }}
        aria-label={
          isSidePanelOpen ? t("sidebar.aria.close") : t("sidebar.aria.open")
        }
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${
            isSidePanelOpen ? "rotate-180" : ""
          }`}
          style={{
            color: isDark ? "rgba(255, 255, 255, 0.7)" : "#4b5563", // 다크: 흰색, 라이트: 진한 회색
          }}
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
        ref={panelRef}
        className={`
          fixed left-0 top-0 bottom-0 z-30
          w-64 md:w-72 flex flex-col
          transition-transform duration-300 ease-out
          ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background:
            "linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--glass-border)",
          boxShadow: isSidePanelOpen ? "4px 0 30px rgba(0,0,0,0.2)" : "none",
        }}
      >
        {/* 헤더 */}
        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--glass-border)" }}
        >
          <h2
            className="text-lg font-bold mb-3 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span style={{ color: "var(--color-main)" }}>🧠</span>
            {t("sidebar.title")}
          </h2>

          {/* 검색창 */}
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("sidebar.searchPlaceholder")}
              className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-400/50"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
              }}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-cyan-400 transition-colors"
              style={{ color: "var(--text-muted)" }}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                  color: "var(--text-muted)",
                }}
              >
                <svg
                  className="w-3 h-3"
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
          {(Object.keys(typeConfig) as NodeType[]).map((type) => {
            const nodes = groupedNodes[type] || [];
            if (nodes.length === 0) return null;

            const config = typeConfig[type];
            const color = isDark ? config.darkColor : config.lightColor;
            const isExpanded = expandedTypes.includes(type);

            return (
              <div
                key={type}
                className="mb-3 pb-3"
                style={{
                  borderBottom: `1px solid ${
                    isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
                  }`,
                }}
              >
                {/* 그룹 헤더 */}
                <button
                  onClick={() => toggleType(type)}
                  className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] cursor-pointer active:scale-[0.98]"
                  style={{
                    background: isExpanded ? `${color}10` : "transparent",
                    border: isExpanded
                      ? `1px solid ${color}30`
                      : "1px solid transparent",
                    boxShadow: isExpanded ? `0 4px 20px ${color}20` : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.boxShadow = `0 4px 20px ${color}15`;
                      e.currentTarget.style.background = `${color}08`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{config.icon}</span>
                    <span style={{ color: color }}>
                      {t(`nodeTypes.${type}`)}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-md text-xs"
                      style={{
                        background: `${color}20`,
                        color: color,
                      }}
                    >
                      {nodes.length}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    style={{ color: color }}
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

                {/* 노드 항목들 */}
                {isExpanded && (
                  <div className="mt-2 ml-1 space-y-1">
                    {/* 프로젝트 타입이면 카테고리별로 서브그룹 렌더링 */}
                    {type === "project"
                      ? // 카테고리 순서 정의
                        (
                          [
                            "frontend",
                            "backend",
                            "ai-ml",
                            "creative",
                          ] as ProjectCategory[]
                        ).map((category) => {
                          const categoryNodes =
                            projectsByCategory[category] || [];
                          if (categoryNodes.length === 0) return null;

                          const catConfig = categoryConfig[category];
                          const catColor = isDark
                            ? catConfig.darkColor
                            : catConfig.lightColor;
                          const isCatExpanded =
                            expandedCategories.includes(category);

                          return (
                            <div key={category} className="mb-2">
                              {/* 카테고리 헤더 */}
                              <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                style={{
                                  background: isCatExpanded
                                    ? `${catColor}15`
                                    : "transparent",
                                }}
                              >
                                <span>{catConfig.icon}</span>
                                <span style={{ color: catColor }}>
                                  {t(`categories.project.${category}`)}
                                </span>
                                <span
                                  className="px-1 py-0.5 rounded text-xs"
                                  style={{
                                    background: `${catColor}20`,
                                    color: catColor,
                                  }}
                                >
                                  {categoryNodes.length}
                                </span>
                                <svg
                                  className={`w-3 h-3 ml-auto transition-transform ${
                                    isCatExpanded ? "rotate-180" : ""
                                  }`}
                                  style={{ color: catColor }}
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

                              {/* 카테고리 내 노드들 */}
                              {isCatExpanded && (
                                <div className="mt-1 ml-3 space-y-1">
                                  {categoryNodes.map((node) => {
                                    const isHovered = hoveredNodeId === node.id;
                                    const nodeColor = getThemeColor(
                                      node.color || catColor,
                                      theme
                                    );
                                    return (
                                      <button
                                        key={node.id}
                                        onClick={() => handleNodeClick(node.id)}
                                        onMouseEnter={() =>
                                          handleNodeHover(node.id)
                                        }
                                        onMouseLeave={() =>
                                          handleNodeHover(null)
                                        }
                                        className="group w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left transition-all duration-300 cursor-pointer"
                                        style={{
                                          background: isHovered
                                            ? `${nodeColor}15`
                                            : "transparent",
                                          border: isHovered
                                            ? `1px solid ${nodeColor}30`
                                            : "1px solid transparent",
                                          transform: isHovered
                                            ? "translateX(4px)"
                                            : "translateX(0)",
                                        }}
                                      >
                                        <div
                                          className="w-2.5 h-2.5 rounded-full shrink-0"
                                          style={{ backgroundColor: nodeColor }}
                                        />
                                        <span
                                          className="truncate"
                                          style={{
                                            color: isHovered
                                              ? nodeColor
                                              : isDark
                                              ? "rgba(255,255,255,0.7)"
                                              : "rgba(0,0,0,0.6)",
                                          }}
                                        >
                                          {node.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      : type === "skill"
                      ? // 스킬 카테고리별로 서브그룹 렌더링
                        (
                          [
                            "language",
                            "framework",
                            "database",
                            "library",
                            "tool",
                          ] as SkillCategory[]
                        ).map((category) => {
                          const categoryNodes =
                            skillsByCategory[category] || [];
                          if (categoryNodes.length === 0) return null;

                          const catConfig = skillCategoryConfig[category];
                          const catColor = isDark
                            ? catConfig.darkColor
                            : catConfig.lightColor;
                          const isCatExpanded =
                            expandedSkillCategories.includes(category);

                          return (
                            <div key={category} className="mb-2">
                              {/* 스킬 카테고리 헤더 */}
                              <button
                                onClick={() => toggleSkillCategory(category)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                style={{
                                  background: isCatExpanded
                                    ? `${catColor}15`
                                    : "transparent",
                                }}
                              >
                                <span>{catConfig.icon}</span>
                                <span style={{ color: catColor }}>
                                  {t(`categories.skill.${category}`)}
                                </span>
                                <span
                                  className="px-1 py-0.5 rounded text-xs"
                                  style={{
                                    background: `${catColor}20`,
                                    color: catColor,
                                  }}
                                >
                                  {categoryNodes.length}
                                </span>
                                <svg
                                  className={`w-3 h-3 ml-auto transition-transform ${
                                    isCatExpanded ? "rotate-180" : ""
                                  }`}
                                  style={{ color: catColor }}
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

                              {/* 카테고리 내 스킬들 */}
                              {isCatExpanded && (
                                <div className="mt-1 ml-3 space-y-1">
                                  {categoryNodes.map((node) => {
                                    const isHovered = hoveredNodeId === node.id;
                                    const nodeColor = getThemeColor(
                                      node.color || catColor,
                                      theme
                                    );
                                    return (
                                      <button
                                        key={node.id}
                                        onClick={() => handleNodeClick(node.id)}
                                        onMouseEnter={() =>
                                          handleNodeHover(node.id)
                                        }
                                        onMouseLeave={() =>
                                          handleNodeHover(null)
                                        }
                                        className="group w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left transition-all duration-300 cursor-pointer"
                                        style={{
                                          background: isHovered
                                            ? `${nodeColor}15`
                                            : "transparent",
                                          border: isHovered
                                            ? `1px solid ${nodeColor}30`
                                            : "1px solid transparent",
                                          transform: isHovered
                                            ? "translateX(4px)"
                                            : "translateX(0)",
                                        }}
                                      >
                                        <div
                                          className="w-2.5 h-2.5 rounded-full shrink-0"
                                          style={{ backgroundColor: nodeColor }}
                                        />
                                        <span
                                          className="truncate"
                                          style={{
                                            color: isHovered
                                              ? nodeColor
                                              : isDark
                                              ? "rgba(255,255,255,0.7)"
                                              : "rgba(0,0,0,0.6)",
                                          }}
                                        >
                                          {node.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      : // 다른 타입은 기존 방식으로 렌더링
                        nodes.map((node) => {
                          const isHovered = hoveredNodeId === node.id;
                          const rawNodeColor = node.color || color;
                          const nodeColor = getThemeColor(rawNodeColor, theme);

                          return (
                            <button
                              key={node.id}
                              onClick={() => handleNodeClick(node.id)}
                              onMouseEnter={() => handleNodeHover(node.id)}
                              onMouseLeave={() => handleNodeHover(null)}
                              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-300 cursor-pointer"
                              style={{
                                background: isHovered
                                  ? `linear-gradient(135deg, ${nodeColor}20, ${nodeColor}10)`
                                  : "transparent",
                                border: isHovered
                                  ? `1px solid ${nodeColor}40`
                                  : "1px solid transparent",
                                transform: isHovered
                                  ? "translateX(4px)"
                                  : "translateX(0)",
                                boxShadow: isHovered
                                  ? `0 4px 16px ${nodeColor}25, 0 2px 8px ${nodeColor}15`
                                  : "none",
                              }}
                            >
                              <div
                                className="relative w-3 h-3 rounded-full shrink-0 transition-all duration-200"
                                style={{
                                  backgroundColor: nodeColor,
                                  boxShadow: isHovered
                                    ? `0 0 12px ${nodeColor}`
                                    : "none",
                                }}
                              >
                                {isHovered && (
                                  <div
                                    className="absolute inset-0 rounded-full animate-ping"
                                    style={{
                                      backgroundColor: nodeColor,
                                      opacity: 0.5,
                                    }}
                                  />
                                )}
                              </div>

                              <span
                                className="truncate transition-colors duration-200"
                                style={{
                                  color: isHovered
                                    ? nodeColor
                                    : isDark
                                    ? "rgba(255,255,255,0.7)"
                                    : "rgba(0,0,0,0.6)",
                                }}
                              >
                                {node.label}
                              </span>

                              <svg
                                className={`w-4 h-4 ml-auto transition-all duration-200 ${
                                  isHovered
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 -translate-x-2"
                                }`}
                                style={{ color: nodeColor }}
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
                          );
                        })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredNodes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p
                style={{
                  color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)",
                }}
                className="text-sm"
              >
                {t("sidebar.noResults")}
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div
          className="p-4"
          style={{
            borderTop: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              style={{
                color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
              }}
            >
              {t("sidebar.totalNodes", { count: data.nodes.length })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
