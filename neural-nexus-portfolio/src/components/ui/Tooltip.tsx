import { useEffect, useState, useRef } from "react";
import { useAppStore } from "../../stores/useAppStore";
import nodesData from "../../data/nodes.json";
import type { NeuralData } from "../../types";

/**
 * 3D 노드 호버 시 표시되는 툴팁 컴포넌트
 * 마우스 위치를 추적하며 노드 정보 표시
 */
import { getThemeColor } from "../../utils/themeUtils";

export function Tooltip() {
  const { hoveredNode, theme } = useAppStore();
  const isDark = theme === "dark";
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const data = nodesData as NeuralData;
  const node = hoveredNode
    ? data.nodes.find((n) => n.id === hoveredNode)
    : null;

  // 마우스 위치 추적
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const tooltipWidth = 280;
      const tooltipHeight = 140;
      const padding = 20;

      let x = e.clientX + padding;
      let y = e.clientY + padding;

      if (x + tooltipWidth > window.innerWidth) {
        x = e.clientX - tooltipWidth - padding;
      }

      if (y + tooltipHeight > window.innerHeight) {
        y = e.clientY - tooltipHeight - padding;
      }

      setPosition({ x, y });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 호버 상태에 따른 표시/숨김
  useEffect(() => {
    if (hoveredNode) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [hoveredNode]);

  if (!node || !isVisible) return null;

  const rawColor = node.color || "#00ffff";
  const nodeColor = getThemeColor(rawColor, theme);

  return (
    <div
      ref={tooltipRef}
      className={`
        fixed z-50 pointer-events-none
        transition-all duration-200 ease-out
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div
        className="relative px-4 py-3 rounded-xl min-w-[200px] max-w-[280px]"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
          backdropFilter: "blur(16px)",
          border: isDark
            ? `1px solid ${nodeColor}40`
            : `1px solid rgba(255,255,255,0.8)`,
          boxShadow: isDark
            ? `0 0 30px ${nodeColor}20, 0 10px 40px rgba(0,0,0,0.3)`
            : `0 10px 30px -5px rgba(0,0,0,0.1), 0 0 15px ${nodeColor}15`,
        }}
      >
        {/* 상단 글로우 라인 */}
        <div
          className="absolute top-0 left-4 right-4 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${nodeColor}, transparent)`,
            opacity: isDark ? 1 : 0.6,
          }}
        />

        {/* 노드 정보 */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse shrink-0"
            style={{ backgroundColor: nodeColor }}
          />
          <span
            className="font-semibold text-sm transition-colors duration-300"
            style={{ color: isDark ? "white" : "#1f2937" }}
          >
            {node.label}
          </span>
        </div>

        {/* 타입 & 연결 */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-0.5 rounded-full uppercase text-xs"
            style={{
              backgroundColor: `${nodeColor}20`,
              color: nodeColor,
              border: `1px solid ${nodeColor}10`,
            }}
          >
            {node.type}
          </span>
          <span
            className="text-xs transition-colors duration-300"
            style={{
              color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
            }}
          >
            {node.connections.length}개 연결
          </span>
        </div>

        {/* 간단한 설명 */}
        {node.details?.description && (
          <p
            className="text-xs leading-relaxed line-clamp-2 mb-2 transition-colors duration-300"
            style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4b5563" }}
          >
            {node.details.description.slice(0, 80)}
            {node.details.description.length > 80 && "..."}
          </p>
        )}

        {/* 클릭 힌트 */}
        <div
          className="pt-2 flex items-center gap-1 transition-colors duration-300"
          style={{
            borderTop: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <span
            className="text-[10px] transition-colors duration-300"
            style={{
              color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
            }}
          >
            클릭하여 상세 보기
          </span>
        </div>
      </div>
    </div>
  );
}
