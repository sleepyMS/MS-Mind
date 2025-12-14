import { useState, useEffect } from "react";
import { useAppStore } from "../../stores/useAppStore";

/**
 * 여닫을 수 있는 컨트롤 가이드 패널
 * 데스크톱/모바일 조작 방법 안내
 */
export function ControlsGuide() {
  const { theme } = useAppStore();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지 및 데스크톱에서 초기 활성화
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || "ontouchstart" in window;
      setIsMobile(mobile);
      // 데스크톱에서는 최초 활성화
      if (!mobile) {
        setIsOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const desktopControls = [
    { icon: "🖱️", action: "좌클릭 드래그", description: "회전" },
    { icon: "🖱️", action: "우클릭 드래그", description: "이동" },
    { icon: "🔄", action: "스크롤 휠", description: "줌 인/아웃" },
    { icon: "⚡", action: "휠 버튼 드래그", description: "빠른 줌" },
    { icon: "👆", action: "노드 클릭", description: "상세 보기" },
  ];

  const mobileControls = [
    { icon: "☝️", action: "한 손가락 드래그", description: "회전" },
    { icon: "✌️", action: "두 손가락 드래그", description: "이동" },
    { icon: "🤏", action: "핀치 인/아웃", description: "줌" },
    { icon: "👆", action: "노드 탭", description: "상세 보기" },
  ];

  const controls = isMobile ? mobileControls : desktopControls;

  return (
    <>
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 md:bottom-auto md:top-1/2 md:right-4 md:-translate-y-1/2
          z-40 w-10 h-10 rounded-full flex items-center justify-center
          transition-all duration-300 hover:scale-110
          ${isOpen ? "rotate-180" : ""}
        `}
        style={{
          background: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.15)"
            : "1px solid rgba(0,0,0,0.1)",
          boxShadow: isDark
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 4px 20px rgba(0,0,0,0.1)",
        }}
        aria-label="컨트롤 가이드"
      >
        <svg
          className="w-5 h-5"
          style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#4b5563" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* 가이드 패널 */}
      <div
        className={`
          fixed z-30 transition-all duration-300 ease-out
          bottom-20 right-6 md:bottom-auto md:top-1/2 md:right-16 md:-translate-y-1/2
          ${
            isOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }
        `}
      >
        <div
          className="p-4 rounded-2xl min-w-[200px]"
          style={{
            background: isDark
              ? "rgba(10,10,25,0.95)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {/* 헤더 */}
          <div
            className="flex items-center gap-2 mb-3 pb-2"
            style={{
              borderBottom: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-base">🎮</span>
            <span
              className="text-sm font-semibold"
              style={{ color: isDark ? "white" : "#1f2937" }}
            >
              {isMobile ? "터치 조작법" : "마우스 조작법"}
            </span>
          </div>

          {/* 컨트롤 목록 */}
          <div className="space-y-2">
            {controls.map((control, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm w-5 text-center">{control.icon}</span>
                <div className="flex-1">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.9)" : "#374151",
                    }}
                  >
                    {control.action}
                  </span>
                  <span
                    className="text-xs ml-2"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280",
                    }}
                  >
                    → {control.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 디바이스 전환 힌트 */}
          <div
            className="mt-3 pt-2 text-center"
            style={{
              borderTop: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <span
              className="text-[10px]"
              style={{
                color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
              }}
            >
              {isMobile ? "📱 모바일 모드" : "🖥️ 데스크톱 모드"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
