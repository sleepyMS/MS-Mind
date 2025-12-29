import { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../stores/useAppStore";
import { ContactForm } from "./ContactForm";

/**
 * 화면 우하단에 표시되는 플로팅 연락 버튼
 * 클릭 시 연락 폼 팝오버 표시
 */
export function FloatingContactButton() {
  const { theme, isModalOpen } = useAppStore();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const nodeColor = "#a855f7"; // Violet purple

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ESC로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  // 모달이 열리면 연락 폼 닫기
  useEffect(() => {
    if (isModalOpen) {
      setIsOpen(false);
    }
  }, [isModalOpen]);

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 left-6 md:left-auto md:right-52 z-20
          w-14 h-14 rounded-full
          flex items-center justify-center
          transition-all duration-300 cursor-pointer
          hover:scale-110 active:scale-95
          ${isOpen ? "rotate-45" : ""}
        `}
        style={{
          background: isOpen
            ? isDark
              ? "rgba(239, 68, 68, 0.9)"
              : "rgba(220, 38, 38, 0.9)"
            : "linear-gradient(135deg, #a855f7, #ec4899)",
          boxShadow: isOpen
            ? "0 4px 20px rgba(239, 68, 68, 0.4)"
            : "0 4px 25px rgba(168, 85, 247, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
        aria-label={isOpen ? "닫기" : "연락하기"}
      >
        <svg
          className="w-6 h-6 text-white transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          )}
        </svg>
      </button>

      {/* 연락 폼 팝오버 */}
      <div
        ref={popoverRef}
        className={`
          fixed bottom-24 left-6 md:left-auto md:right-52 ${
            isOpen ? "z-50" : "z-20"
          }
          w-[min(360px,calc(100vw-48px))]
          rounded-2xl overflow-hidden
          transition-all duration-300 origin-bottom-left md:origin-bottom-right
          ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-4 pointer-events-none"
          }
        `}
        style={{
          background: isDark
            ? "rgba(15, 15, 25, 0.95)"
            : "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          border: isDark
            ? `1px solid ${nodeColor}30`
            : "1px solid rgba(0,0,0,0.1)",
          boxShadow: isDark
            ? `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${nodeColor}15`
            : "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* 헤더 */}
        <div
          className="px-6 py-5"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${nodeColor}15, rgba(236, 72, 153, 0.08))`
              : `linear-gradient(135deg, ${nodeColor}10, rgba(236, 72, 153, 0.05))`,
            borderBottom: isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                boxShadow: "0 4px 15px rgba(168, 85, 247, 0.4)",
              }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h3
                className="text-lg font-bold"
                style={{
                  color: isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.9)",
                }}
              >
                연락하기
              </h3>
              <p
                className="text-xs"
                style={{
                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
                }}
              >
                궁금한 점이나 제안이 있으시면 메시지를 남겨주세요!
              </p>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <div className="px-6 py-5">
          <ContactForm isDark={isDark} nodeColor={nodeColor} />
        </div>

        {/* 푸터 */}
        <div
          className="px-6 py-3 flex items-center justify-center gap-2"
          style={{
            background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
            borderTop: isDark
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <svg
            className="w-3.5 h-3.5"
            style={{
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span
            className="text-xs"
            style={{
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
            }}
          >
            이메일은 안전하게 보호됩니다
          </span>
        </div>
      </div>
    </>
  );
}
