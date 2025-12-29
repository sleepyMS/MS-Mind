import { useAppStore } from "../../stores/useAppStore";

/**
 * 테마 전환 버튼 - 태양/달 애니메이션
 */
export function ThemeSwitcher() {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-30 group cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(20,20,50,0.9) 0%, rgba(10,10,30,0.95) 100%)"
            : "linear-gradient(135deg, rgba(135,206,250,0.9) 0%, rgba(255,223,186,0.95) 100%)",
          border: isDark
            ? "2px solid rgba(255,255,255,0.1)"
            : "2px solid rgba(255,200,100,0.3)",
          boxShadow: isDark
            ? "0 0 30px rgba(100,150,255,0.2), inset 0 0 20px rgba(100,150,255,0.1)"
            : "0 0 40px rgba(255,200,100,0.4), inset 0 0 20px rgba(255,255,200,0.3)",
        }}
      >
        {/* 달 (다크 모드) */}
        <div
          className="absolute transition-all duration-700 ease-out"
          style={{
            transform: isDark
              ? "translateY(0) rotate(0deg) scale(1)"
              : "translateY(-50px) rotate(-90deg) scale(0.5)",
            opacity: isDark ? 1 : 0,
          }}
        >
          <div className="relative">
            {/* 달 본체 */}
            <div
              className="w-8 h-8 rounded-full"
              style={{
                background: "linear-gradient(135deg, #e8e8e8 0%, #c8c8c8 100%)",
                boxShadow:
                  "0 0 20px rgba(255,255,255,0.5), inset -3px -3px 8px rgba(0,0,0,0.2)",
              }}
            />
            {/* 달 크레이터 */}
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: "6px",
                left: "5px",
                background: "rgba(150,150,150,0.4)",
              }}
            />
            <div
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                top: "14px",
                left: "12px",
                background: "rgba(150,150,150,0.3)",
              }}
            />
            <div
              className="absolute w-1 h-1 rounded-full"
              style={{
                top: "8px",
                left: "18px",
                background: "rgba(150,150,150,0.3)",
              }}
            />
            {/* 별들 (배경) */}
            <div
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                top: "-8px",
                left: "-10px",
                background: "white",
                boxShadow: "0 0 4px white",
              }}
            />
            <div
              className="absolute w-0.5 h-0.5 rounded-full animate-pulse"
              style={{
                top: "-5px",
                right: "-8px",
                background: "white",
                animationDelay: "0.3s",
              }}
            />
            <div
              className="absolute w-0.5 h-0.5 rounded-full animate-pulse"
              style={{
                bottom: "-6px",
                left: "-6px",
                background: "white",
                animationDelay: "0.6s",
              }}
            />
          </div>
        </div>

        {/* 태양 (라이트 모드) */}
        <div
          className="absolute transition-all duration-700 ease-out"
          style={{
            transform: isDark
              ? "translateY(50px) rotate(90deg) scale(0.5)"
              : "translateY(0) rotate(0deg) scale(1)",
            opacity: isDark ? 0 : 1,
          }}
        >
          {/* 태양 본체 */}
          <div
            className="w-8 h-8 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, #FFE066 0%, #FFB347 50%, #FF8C00 100%)",
              boxShadow:
                "0 0 30px rgba(255,200,0,0.6), inset 2px 2px 8px rgba(255,255,200,0.5)",
            }}
          />
        </div>

        {/* 호버 링 */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            border: isDark
              ? "2px solid rgba(100,150,255,0.5)"
              : "2px solid rgba(255,200,0,0.5)",
          }}
        />
      </div>

      {/* 레이블 */}
      <div
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0"
        style={{
          background: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)",
          color: isDark ? "white" : "#333",
          border: isDark
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {isDark ? "Light Mode" : "Dark Mode"}
      </div>
    </button>
  );
}
