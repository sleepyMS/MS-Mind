import { useEffect, useState, useRef } from "react";
import { useAppStore } from "../../stores/useAppStore";
import nodesData from "../../data/nodes.json";
import type { NeuralData } from "../../types";

/**
 * 3D 노드 호버 시 표시되는 툴팁 컴포넌트
 * 마우스 위치를 추적하며 노드 정보 표시
 */
export function Tooltip() {
  const { hoveredNode } = useAppStore();
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

  const nodeColor = node.color || "#00ffff";

  return (
    <div
      ref={tooltipRef}
      className={`
        fixed z-40 pointer-events-none
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
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${nodeColor}40`,
          boxShadow: `0 0 30px ${nodeColor}20, 0 10px 40px rgba(0,0,0,0.3)`,
        }}
      >
        {/* 상단 글로우 라인 */}
        <div
          className="absolute top-0 left-4 right-4 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${nodeColor}, transparent)`,
          }}
        />

        {/* 노드 정보 */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse shrink-0"
            style={{ backgroundColor: nodeColor }}
          />
          <span className="text-white font-semibold text-sm">{node.label}</span>
        </div>

        {/* 타입 & 연결 */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-0.5 rounded-full uppercase text-xs"
            style={{
              backgroundColor: `${nodeColor}20`,
              color: nodeColor,
            }}
          >
            {node.type}
          </span>
          <span className="text-white/50 text-xs">
            {node.connections.length}개 연결
          </span>
        </div>

        {/* 간단한 설명 */}
        {node.details?.description && (
          <p className="text-white/60 text-xs leading-relaxed line-clamp-2 mb-2">
            {node.details.description.slice(0, 80)}
            {node.details.description.length > 80 && "..."}
          </p>
        )}

        {/* 클릭 힌트 */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-1">
          <span className="text-white/40 text-[10px]">클릭하여 상세 보기</span>
        </div>
      </div>
    </div>
  );
}
