import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";
import { changeLanguage } from "../../i18n";
import type { NodeType } from "../../types";

interface FilterOption {
  type: NodeType;
  labelKey: string;
  color: string;
  icon: string;
}

const filterOptions: FilterOption[] = [
  { type: "main", labelKey: "main", color: "#00ffff", icon: "👤" },
  { type: "project", labelKey: "project", color: "#ff00ff", icon: "🚀" },
  { type: "skill", labelKey: "skill", color: "#88ce02", icon: "⚡" },
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
  const { visibleNodeTypes, toggleNodeType } = useAppStore();

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
    <div className="fixed top-6 right-6 z-30">
      {/* 메인 컨트롤 바 */}
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* 필터 버튼들 */}
        {filterOptions.map((option) => {
          const isActive = visibleNodeTypes.includes(option.type);

          return (
            <button
              key={option.type}
              onClick={() => toggleNodeType(option.type)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${option.color}20, ${option.color}10)`
                  : "transparent",
                border: isActive
                  ? `1px solid ${option.color}30`
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
                  color: isActive ? option.color : "rgba(255,255,255,0.6)",
                }}
              >
                {t(`nodeTypes.${option.labelKey}`)}
              </span>
              {isActive && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
              )}
            </button>
          );
        })}

        {/* 구분선 */}
        <div className="w-px h-5 bg-white/15 mx-0.5" />

        {/* 언어 전환 드롭다운 */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200"
            style={{
              background: isLangOpen ? "rgba(255,255,255,0.1)" : "transparent",
              border: isLangOpen
                ? "1px solid rgba(0, 255, 255, 0.25)"
                : "1px solid transparent",
            }}
          >
            <svg
              className="w-4 h-4"
              style={{
                color: isLangOpen ? "#00ffff" : "rgba(255,255,255,0.6)",
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
                color: isLangOpen ? "#00ffff" : "rgba(255,255,255,0.7)",
              }}
            >
              {currentLang.code.toUpperCase()}
            </span>
            <svg
              className="w-3 h-3 transition-transform duration-200"
              style={{
                color: isLangOpen ? "#00ffff" : "rgba(255,255,255,0.4)",
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
                background:
                  "linear-gradient(180deg, rgba(10,10,30,0.98) 0%, rgba(5,5,20,0.95) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.2)",
                minWidth: "140px",
              }}
            >
              {languages.map((lang) => {
                const isActive = lang.code === currentLang.code;
                const isHovered = hoveredLang === lang.code && !isActive;

                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLangSelect(lang.code)}
                    onMouseEnter={() => setHoveredLang(lang.code)}
                    onMouseLeave={() => setHoveredLang(null)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150"
                    style={{
                      background: isActive
                        ? "rgba(0, 255, 255, 0.12)"
                        : isHovered
                        ? "rgba(255, 255, 255, 0.06)"
                        : "transparent",
                    }}
                  >
                    {/* 플래그 */}
                    <span className="text-base">{lang.flag}</span>

                    {/* 언어 이름 */}
                    <span
                      className="text-sm font-medium flex-1 text-left"
                      style={{
                        color: isActive
                          ? "#00ffff"
                          : isHovered
                          ? "#ffffff"
                          : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {lang.name}
                    </span>

                    {/* 체크 표시 */}
                    {isActive && (
                      <svg
                        className="w-4 h-4"
                        style={{ color: "#00ffff" }}
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
