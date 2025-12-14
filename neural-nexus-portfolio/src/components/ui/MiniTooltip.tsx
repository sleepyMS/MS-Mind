import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "../../stores/useAppStore";

interface MiniTooltipProps {
  children: ReactNode;
  content: string;
}

/**
 * 커서 추적 미니 툴팁 컴포넌트
 * 마우스 커서 오른쪽 아래에 표시
 */
export function MiniTooltip({ children, content }: MiniTooltipProps) {
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === "dark";
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const offsetX = 12;
    const offsetY = 16;
    const tooltipWidth = 150;
    const tooltipHeight = 32;

    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;

    // 화면 오른쪽 경계 체크
    if (x + tooltipWidth > window.innerWidth) {
      x = e.clientX - tooltipWidth - offsetX;
    }
    // 화면 아래 경계 체크
    if (y + tooltipHeight > window.innerHeight) {
      y = e.clientY - tooltipHeight - offsetY;
    }

    setCoords({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    handleMouseMove(e);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipElement = isVisible ? (
    <div
      style={{
        position: "fixed",
        left: coords.x,
        top: coords.y,
        zIndex: 99999,
        padding: "6px 10px",
        fontSize: "12px",
        fontWeight: 500,
        borderRadius: "8px",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        background: isDark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.98)",
        color: isDark ? "white" : "#1f2937",
        backdropFilter: "blur(8px)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.15)"
          : "1px solid rgba(0,0,0,0.1)",
        boxShadow: isDark
          ? "0 4px 16px rgba(0,0,0,0.5)"
          : "0 4px 16px rgba(0,0,0,0.15)",
      }}
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </div>
      {typeof window !== "undefined" &&
        createPortal(tooltipElement, document.body)}
    </>
  );
}
