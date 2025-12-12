import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../i18n";

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
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div ref={dropdownRef} className="fixed top-20 right-6 z-30">
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(12px)",
          border: isOpen
            ? "1px solid rgba(0, 255, 255, 0.3)"
            : "1px solid rgba(255,255,255,0.15)",
          boxShadow: isOpen
            ? "0 0 20px rgba(0, 255, 255, 0.2)"
            : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* 언어 아이콘 */}
        <svg
          className="w-4 h-4 text-white/60"
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
        <span className="text-sm font-medium text-white/80">
          {currentLang.code.toUpperCase()}
        </span>

        {/* 화살표 */}
        <svg
          className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
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

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 py-1 rounded-xl overflow-hidden animate-fadeIn"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,16,0.98) 0%, rgba(0,0,16,0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            minWidth: "140px",
          }}
        >
          {languages.map((lang) => {
            const isActive = lang.code === currentLang.code;

            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  transition-all duration-200
                  ${isActive ? "bg-cyan-400/10" : "hover:bg-white/5"}
                `}
              >
                {/* 플래그 - 고정 너비로 정렬 */}
                <span className="w-6 h-6 flex items-center justify-center text-lg">
                  {lang.flag}
                </span>

                {/* 언어 이름 */}
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-cyan-400" : "text-white/70"
                  }`}
                >
                  {lang.name}
                </span>

                {/* 체크 표시 */}
                {isActive && (
                  <svg
                    className="w-4 h-4 ml-auto text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
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
