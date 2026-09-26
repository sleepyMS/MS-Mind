import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../stores/useAppStore";
import { getNodesData } from "../../data";
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
  } = useAppStore(useShallow((state) => ({
    nodePositions: state.nodePositions,
    activeNode: state.activeNode,
    hoveredNode: state.hoveredNode,
    setActiveNode: state.setActiveNode,
    setModalOpen: state.setModalOpen,
    setCameraTarget: state.setCameraTarget,
    theme: state.theme,
  })));
  const isDark = theme === "dark";
  const { t, i18n } = useTranslation();

  const data = getNodesData(i18n.language);

  // 노드 위치를 2D 좌표로 변환 (X, Z 평면 사용)
  const mappedNodes = useMemo(() => {
    if (nodePositions.size === 0) return [];

    // 좌표 범위 계산
    let minX = Infinity,
      maxX = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    data.nodes.forEach((node) => {
      if (node.type === "hidden") return;
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const [x, , z] = pos;
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
      .filter((node) => node.type !== "hidden")
      .flatMap((node) => {
        const pos = nodePositions.get(node.id);
        if (!pos) return [];

        const [x, , z] = pos;
        return [{
          ...node,
          x: padding + ((x - minX) / rangeX) * size,
          y: padding + ((z - minZ) / rangeZ) * size,
          position: pos,
        }];
      });
  }, [nodePositions, data.nodes]);

  const mappedConnections = useMemo(() => {
    const nodesById = new Map(mappedNodes.map((node) => [node.id, node]));
    const seen = new Set<string>();
    return mappedNodes.flatMap((source) => source.connections.flatMap((targetId) => {
      const target = nodesById.get(targetId);
      const id = [source.id, targetId].sort().join(":");
      if (!target || seen.has(id)) return [];
      seen.add(id);
      return [{ id, source, target }];
    }));
  }, [mappedNodes]);

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
      <svg className="w-full h-full" viewBox="0 0 100 100" role="group" aria-label={t("sidebar.title")}>
        {/* 연결선 */}
        <g opacity="0.3" aria-hidden="true">
          {mappedConnections.map(({ id, source, target }) => (
            <line
              key={id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* 노드 점들 */}
        {mappedNodes.map((node) => {
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
                role="button"
                tabIndex={0}
                aria-label={node.label}
                aria-haspopup="dialog"
                cx={node.x}
                cy={node.y}
                r={size}
                fill={nodeColor}
                className="cursor-pointer transition-all duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => handleNodeClick(node.id, node.position)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleNodeClick(node.id, node.position);
                  }
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
