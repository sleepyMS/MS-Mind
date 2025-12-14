import { useMemo } from "react";
import { useAppStore } from "../../stores/useAppStore";
import { nodesData } from "../../data";
import type { NeuralData } from "../../types";
import { getThemeColor } from "../../utils/themeUtils";

/**
 * 신경망 구조 미니맵 컴포넌트
 * 전체 노드 위치와 현재 카메라 위치 표시
 */
export function MiniMap() {
  const {
    nodePositions,
    activeNode,
    hoveredNode,
    setActiveNode,
    setModalOpen,
    setCameraTarget,
    theme,
  } = useAppStore();
  const isDark = theme === "dark";

  const data = nodesData as NeuralData;

  // 노드 위치를 2D 좌표로 변환 (X, Z 평면 사용)
  const mappedNodes = useMemo(() => {
    if (nodePositions.size === 0) return [];

    // 좌표 범위 계산
    let minX = Infinity,
      maxX = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    nodePositions.forEach(([x, , z]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    });

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const padding = 10; // 패딩 퍼센트
    const size = 100 - padding * 2;

    return data.nodes
      .map((node) => {
        const pos = nodePositions.get(node.id);
        if (!pos) return null;

        const [x, , z] = pos;
        return {
          ...node,
          x: padding + ((x - minX) / rangeX) * size,
          y: padding + ((z - minZ) / rangeZ) * size,
          position: pos,
        };
      })
      .filter(Boolean);
  }, [nodePositions, data.nodes]);

  const handleNodeClick = (
    nodeId: string,
    position: [number, number, number]
  ) => {
    setCameraTarget(position);
    setActiveNode(nodeId);
    setModalOpen(true);
  };

  if (mappedNodes.length === 0) return null;

  return (
    <div
      className="hidden md:block fixed bottom-6 right-6 z-30 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)",
        backdropFilter: "blur(12px)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      }}
    >
      {/* 노드들 */}
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* 연결선 */}
        <g opacity="0.3">
          {data.nodes.flatMap((node) => {
            const fromNode = mappedNodes.find((n) => n?.id === node.id);
            if (!fromNode) return [];

            return node.connections.map((connId) => {
              const toNode = mappedNodes.find((n) => n?.id === connId);
              if (!toNode) return null;

              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
                  strokeWidth="0.5"
                />
              );
            });
          })}
        </g>

        {/* 노드 점들 */}
        {mappedNodes.map((node) => {
          if (!node) return null;
          const isActive = activeNode === node.id;
          const isHovered = hoveredNode === node.id;
          const nodeColor = getThemeColor(node.color || "#00ffff", theme);

          // 노드 타입별 크기
          const baseSize =
            node.type === "main" ? 5 : node.type === "project" ? 3.5 : 2.5;
          const size = isActive || isHovered ? baseSize * 1.5 : baseSize;

          return (
            <g key={node.id}>
              {/* 글로우 */}
              {(isActive || isHovered) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={size * 2}
                  fill={nodeColor}
                  opacity="0.3"
                />
              )}
              {/* 노드 */}
              <circle
                cx={node.x}
                cy={node.y}
                r={size}
                fill={nodeColor}
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => handleNodeClick(node.id, node.position!)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
