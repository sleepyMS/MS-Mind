import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../i18n";
import { useAppStore } from "../../stores/useAppStore";

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
 * 언어 전환 드롭다운 컴포넌트
 */
export interface LanguageSwitcherProps {
  className?: string;
}

/**
 * 언어 전환 드롭다운 컴포넌트
 */
export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useAppStore();
  const isDark = theme === "dark";
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지 (768px 미만)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative shrink-0 ${className}`}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        style={{
          background: isOpen
            ? isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)"
            : "transparent",
          border: isOpen
            ? isDark
              ? "1px solid rgba(0, 255, 255, 0.25)"
              : "1px solid rgba(0,0,0,0.15)"
            : "1px solid transparent",
        }}
      >
        {/* 언어 아이콘 */}
        <svg
          className="w-4 h-4"
          style={{
            color: isOpen
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

        {/* 현재 언어 */}
        <span
          className="text-xs font-semibold"
          style={{
            color: isOpen
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

        {/* 화살표 */}
        <svg
          className="w-3 h-3 transition-transform duration-200"
          style={{
            color: isOpen
              ? isDark
                ? "#00ffff"
                : "#0891b2"
              : isDark
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.4)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
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
      {isOpen && (
        <div
          className={`absolute right-0 py-2 rounded-xl overflow-hidden animate-fadeIn ${
            isMobile ? "bottom-full mb-2" : "top-full mt-2"
          }`}
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
            const isItemHovered = hoveredLang === lang.code && !isActive;
            const activeColor = isDark ? "#00ffff" : "#0056b3";

            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                onMouseEnter={() => setHoveredLang(lang.code)}
                onMouseLeave={() => setHoveredLang(null)}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 text-left cursor-pointer"
                style={{
                  background: isActive
                    ? isDark
                      ? "rgba(0, 255, 255, 0.12)"
                      : "rgba(8, 145, 178, 0.1)"
                    : isItemHovered
                    ? isDark
                      ? "rgba(255, 255, 255, 0.06)"
                      : "rgba(0,0,0,0.05)"
                    : "transparent",
                }}
              >
                {/* 플래그 */}
                <span className="text-base">{lang.flag}</span>

                {/* 언어 이름 */}
                <span
                  className="text-sm font-medium flex-1"
                  style={{
                    color: isActive
                      ? activeColor
                      : isItemHovered
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

                {/* 체크 표시 */}
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
  );
}
