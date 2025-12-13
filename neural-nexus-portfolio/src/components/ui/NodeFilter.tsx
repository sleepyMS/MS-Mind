import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";

import { LanguageSwitcher } from "./LanguageSwitcher";
import type { NodeType, ProjectCategory } from "../../types";

interface FilterOption {
  type: NodeType;
  labelKey: string;
  darkColor: string;
  lightColor: string;
  icon: string;
}

interface CategoryOption {
  category: ProjectCategory;
  label: string;
  darkColor: string;
  lightColor: string;
  icon: string;
}

const filterOptions: FilterOption[] = [
  {
    type: "main",
    labelKey: "main",
    darkColor: "#00ffff",
    lightColor: "#0056b3",
    icon: "👤",
  },
  {
    type: "project",
    labelKey: "project",
    darkColor: "#ff00ff",
    lightColor: "#6b21a8",
    icon: "🚀",
  },
  {
    type: "skill",
    labelKey: "skill",
    darkColor: "#88ce02",
    lightColor: "#15803d",
    icon: "⚡",
  },
];

const categoryOptions: CategoryOption[] = [
  {
    category: "frontend",
    label: "프론트엔드",
    darkColor: "#c026d3",
    lightColor: "#a21caf",
    icon: "🎨",
  },
  {
    category: "backend",
    label: "백엔드",
    darkColor: "#f97316",
    lightColor: "#ea580c",
    icon: "⚙️",
  },
  {
    category: "ai-ml",
    label: "AI / ML",
    darkColor: "#8b5cf6",
    lightColor: "#7c3aed",
    icon: "🤖",
  },
  {
    category: "creative",
    label: "크리에이티브",
    darkColor: "#10b981",
    lightColor: "#059669",
    icon: "🎮",
  },
];

/**
 * 노드 필터 + 카테고리 드롭다운 + 언어 전환 통합 컨트롤 바
 */
export function NodeFilter() {
  const { t } = useTranslation();
  const {
    visibleNodeTypes,
    toggleNodeType,
    visibleCategories,
    toggleCategory,
    resetCategoryFilter,
    theme,
  } = useAppStore();
  const isDark = theme === "dark";

  const [isExpanded, setIsExpanded] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategoryCount = visibleCategories.length;
  const allCategoriesSelected = selectedCategoryCount === 4;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        window.innerWidth < 768 &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProjectButtonColor = () => {
    if (!visibleNodeTypes.includes("project")) {
      return isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
    }
    if (allCategoriesSelected) {
      return isDark ? "#ff00ff" : "#6b21a8";
    }
    const firstCategory = visibleCategories[0];
    const option = categoryOptions.find((o) => o.category === firstCategory);
    return isDark
      ? option?.darkColor || "#ff00ff"
      : option?.lightColor || "#6b21a8";
  };

  return (
    <div
      ref={containerRef}
      className={`
        fixed z-30 transition-all duration-300 ease-out
        right-6 top-24 md:top-6 md:right-24
        ${isExpanded ? "w-[auto]" : "w-11 md:w-auto"} 
        flex flex-row-reverse md:flex-row items-start md:items-center
      `}
    >
      {/* 모바일 토글 버튼 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
           md:hidden cursor-pointer
           w-11 h-11 rounded-full flex items-center justify-center shrink-0
           transition-all duration-300 hover:scale-105 active:scale-95
           ${
             isExpanded
               ? "opacity-0 pointer-events-none absolute"
               : "opacity-100 relative"
           }
        `}
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        <svg
          className="w-5 h-5"
          style={{ color: isDark ? "#fff" : "#333" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </button>

      {/* 메인 컨트롤 바 */}
      <div
        className={`
          flex items-center gap-1.5 rounded-2xl transition-all
          ${
            isExpanded ? "overflow-visible" : "overflow-hidden"
          } md:overflow-visible
          ${
            isExpanded
              ? "max-w-[500px] p-1.5 opacity-100 translate-x-0 duration-500"
              : "max-w-0 p-0 opacity-0 translate-x-4 border-none duration-0 md:max-w-none md:p-1.5 md:opacity-100 md:translate-x-0 md:border-solid md:duration-500"
          }
        `}
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        {/* 필터 버튼들 */}
        {filterOptions.map((option) => {
          const isActive = visibleNodeTypes.includes(option.type);
          const isProject = option.type === "project";
          const color =
            isProject && isActive
              ? getProjectButtonColor()
              : isDark
              ? option.darkColor
              : option.lightColor;

          return (
            <div
              key={option.type}
              className="relative"
              ref={isProject ? dropdownRef : undefined}
            >
              <button
                onClick={() => {
                  if (isProject && isActive) {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  } else {
                    toggleNodeType(option.type);
                    if (isProject && !isActive) {
                      setIsCategoryDropdownOpen(true);
                    }
                  }
                }}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 shrink-0 cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${color}25, ${color}10)`
                    : "transparent",
                  border: isActive
                    ? `1px solid ${color}30`
                    : "1px solid transparent",
                  opacity: isActive ? 1 : 0.5,
                }}
                title={`${t(`nodeTypes.${option.labelKey}`)} ${
                  isActive ? t("filter.hide") : t("filter.show")
                }`}
              >
                <span className="text-sm">{option.icon}</span>
                <span
                  className="hidden lg:inline text-xs font-medium"
                  style={{
                    color: isActive
                      ? color
                      : isDark
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(0,0,0,0.5)",
                  }}
                >
                  {t(`nodeTypes.${option.labelKey}`)}
                </span>
                {isProject && isActive && !allCategoriesSelected && (
                  <span
                    className="text-xs px-1 rounded"
                    style={{
                      background: `${color}30`,
                      color: color,
                    }}
                  >
                    {selectedCategoryCount}
                  </span>
                )}
                {isProject && isActive && (
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isCategoryDropdownOpen ? "rotate-180" : ""
                    }`}
                    style={{ color }}
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
                {isActive && !isProject && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
              </button>

              {/* 카테고리 드롭다운 */}
              {isProject && isCategoryDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 py-1.5 rounded-xl z-50 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    background: isDark
                      ? "rgba(20, 20, 30, 0.95)"
                      : "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(16px)",
                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"
                    }`,
                    boxShadow: isDark
                      ? "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
                      : "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* 전체 선택 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetCategoryFilter();
                    }}
                    onMouseEnter={() => setHoveredCategory("all")}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs transition-all duration-150 cursor-pointer rounded-lg mx-1"
                    style={{
                      background:
                        hoveredCategory === "all"
                          ? isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)"
                          : "transparent",
                      color: allCategoriesSelected
                        ? isDark
                          ? "#fff"
                          : "#000"
                        : isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.5)",
                      width: "calc(100% - 8px)",
                      transform:
                        hoveredCategory === "all"
                          ? "translateX(2px)"
                          : "translateX(0)",
                    }}
                  >
                    <span className="text-base">🌐</span>
                    <span className="font-medium">전체 보기</span>
                    {allCategoriesSelected && (
                      <svg
                        className="w-4 h-4 ml-auto text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  <div
                    className="h-px mx-3 my-1.5"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.08)",
                    }}
                  />

                  {/* 카테고리 옵션들 */}
                  {categoryOptions.map((catOption) => {
                    const isSelected = visibleCategories.includes(
                      catOption.category
                    );
                    const isHovered = hoveredCategory === catOption.category;
                    const catColor = isDark
                      ? catOption.darkColor
                      : catOption.lightColor;

                    return (
                      <button
                        key={catOption.category}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(catOption.category);
                        }}
                        onMouseEnter={() =>
                          setHoveredCategory(catOption.category)
                        }
                        onMouseLeave={() => setHoveredCategory(null)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs transition-all duration-150 cursor-pointer rounded-lg mx-1"
                        style={{
                          background: isHovered
                            ? `${catColor}15`
                            : "transparent",
                          color: isSelected
                            ? catColor
                            : isDark
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(0,0,0,0.5)",
                          width: "calc(100% - 8px)",
                          transform: isHovered
                            ? "translateX(4px)"
                            : "translateX(0)",
                          borderLeft: isSelected
                            ? `2px solid ${catColor}`
                            : "2px solid transparent",
                        }}
                      >
                        <span className="text-base">{catOption.icon}</span>
                        <span className="font-medium">{catOption.label}</span>
                        {isSelected && (
                          <svg
                            className="w-4 h-4 ml-auto transition-transform duration-200"
                            style={{
                              color: catColor,
                              transform: isHovered ? "scale(1.1)" : "scale(1)",
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* 구분선 */}
        <div
          className="w-px h-5 mx-0.5"
          style={{
            background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
          }}
        />

        {/* 언어 전환 */}
        <LanguageSwitcher />
      </div>
    </div>
  );
}
