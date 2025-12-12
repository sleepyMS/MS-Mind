import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";

import { LanguageSwitcher } from "./LanguageSwitcher";
import type { NodeType } from "../../types";

interface FilterOption {
  type: NodeType;
  labelKey: string;
  darkColor: string;
  lightColor: string;
  icon: string;
}

const filterOptions: FilterOption[] = [
  {
    type: "main",
    labelKey: "main",
    darkColor: "#00ffff",
    lightColor: "#0056b3", // Darker Blue
    icon: "👤",
  },
  {
    type: "project",
    labelKey: "project",
    darkColor: "#ff00ff",
    lightColor: "#6b21a8", // Darker Purple
    icon: "🚀",
  },
  {
    type: "skill",
    labelKey: "skill",
    darkColor: "#88ce02",
    lightColor: "#15803d", // Strong Green
    icon: "⚡",
  },
];

/**
 * 노드 필터 + 언어 전환 통합 컨트롤 바
 */
export function NodeFilter() {
  const { t } = useTranslation();
  const { visibleNodeTypes, toggleNodeType, theme } = useAppStore();
  const isDark = theme === "dark";

  const [isExpanded, setIsExpanded] = useState(false); // Mobile expand state
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 모바일 메뉴 접기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 모바일 메뉴 접기 (컨테이너 외부 클릭 시)
      if (
        window.innerWidth < 768 && // 모바일에서만 동작
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      {/* 모바일 토글 버튼 (필터 아이콘) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
           md:hidden
           w-11 h-11 rounded-full flex items-center justify-center shrink-0
           transition-all duration-300
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

      {/* 메인 컨트롤 바 (내용물) */}
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
          const color = isDark ? option.darkColor : option.lightColor;

          return (
            <button
              key={option.type}
              onClick={() => toggleNodeType(option.type)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 shrink-0"
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
              {isActive && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          );
        })}

        <div
          className="w-px h-5 mx-0.5"
          style={{
            background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
          }}
        />

        {/* 언어 전환 드롭다운 */}
        <LanguageSwitcher />
      </div>
    </div>
  );
}
