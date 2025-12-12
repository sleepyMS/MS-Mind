import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";
import { changeLanguage } from "../../i18n";
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
    lightColor: "#0891b2",
    icon: "👤",
  },
  {
    type: "project",
    labelKey: "project",
    darkColor: "#ff00ff",
    lightColor: "#c026d3",
    icon: "🚀",
  },
  {
    type: "skill",
    labelKey: "skill",
    darkColor: "#88ce02",
    lightColor: "#65a30d",
    icon: "⚡",
  },
];

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

/**
 * 노드 필터 + 언어 전환 통합 컨트롤 바
 */
export function NodeFilter() {
  const { t, i18n } = useTranslation();
  const { visibleNodeTypes, toggleNodeType, theme } = useAppStore();
  const isDark = theme === "dark";

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  // 외부 클릭 시 언어 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangSelect = (code: string) => {
    changeLanguage(code);
    setIsLangOpen(false);
  };

  return (
    <div className="fixed top-6 right-24 z-30">
      {/* 메인 컨트롤 바 */}
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-2xl transition-all duration-500"
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
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200"
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
                className="hidden md:inline text-xs font-medium"
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

        {/* 구분선 */}
        <div
          className="w-px h-5 mx-0.5"
          style={{
            background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
          }}
        />

        {/* 언어 전환 드롭다운 */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200"
            style={{
              background: isLangOpen
                ? isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)"
                : "transparent",
              border: isLangOpen
                ? isDark
                  ? "1px solid rgba(0, 255, 255, 0.25)"
                  : "1px solid rgba(0,0,0,0.15)"
                : "1px solid transparent",
            }}
          >
            <svg
              className="w-4 h-4"
              style={{
                color: isLangOpen
                  ? isDark
                    ? "#00ffff"
                    : "#0891b2"
                  : isDark
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(0,0,0,0.5)",
              }}
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
            <span
              className="text-xs font-semibold"
              style={{
                color: isLangOpen
                  ? isDark
                    ? "#00ffff"
                    : "#0891b2"
                  : isDark
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(0,0,0,0.6)",
              }}
            >
              {currentLang.code.toUpperCase()}
            </span>
            <svg
              className="w-3 h-3 transition-transform duration-200"
              style={{
                color: isLangOpen
                  ? isDark
                    ? "#00ffff"
                    : "#0891b2"
                  : isDark
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(0,0,0,0.4)",
                transform: isLangOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
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

          {/* 드롭다운 메뉴 */}
          {isLangOpen && (
            <div
              className="absolute top-full right-0 mt-2 py-2 rounded-xl overflow-hidden"
              style={{
                background: isDark
                  ? "linear-gradient(180deg, rgba(10,10,30,0.98) 0%, rgba(5,5,20,0.95) 100%)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,255,0.95) 100%)",
                backdropFilter: "blur(20px)",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid rgba(0,0,0,0.1)",
                boxShadow: isDark
                  ? "0 12px 40px rgba(0,0,0,0.6)"
                  : "0 12px 40px rgba(0,0,0,0.15)",
                minWidth: "140px",
              }}
            >
              {languages.map((lang) => {
                const isActive = lang.code === currentLang.code;
                const isHovered = hoveredLang === lang.code && !isActive;
                const activeColor = isDark ? "#00ffff" : "#0891b2";

                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLangSelect(lang.code)}
                    onMouseEnter={() => setHoveredLang(lang.code)}
                    onMouseLeave={() => setHoveredLang(null)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150"
                    style={{
                      background: isActive
                        ? isDark
                          ? "rgba(0, 255, 255, 0.12)"
                          : "rgba(8, 145, 178, 0.1)"
                        : isHovered
                        ? isDark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0,0,0,0.05)"
                        : "transparent",
                    }}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span
                      className="text-sm font-medium flex-1 text-left"
                      style={{
                        color: isActive
                          ? activeColor
                          : isHovered
                          ? isDark
                            ? "#ffffff"
                            : "#000000"
                          : isDark
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(0,0,0,0.6)",
                      }}
                    >
                      {lang.name}
                    </span>
                    {isActive && (
                      <svg
                        className="w-4 h-4"
                        style={{ color: activeColor }}
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
      </div>
    </div>
  );
}
