import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NeuralNode, ThemeType } from "../../../types";
import { getThemeColor } from "../../../utils/themeUtils";

interface ModalConnectionsProps {
  node: NeuralNode;
  nodes: readonly NeuralNode[];
  theme: ThemeType;
  nodeColor: string;
  onNavigate: (nodeId: string) => void;
}

export function ModalConnections({ node, nodes, theme, nodeColor, onNavigate }: ModalConnectionsProps) {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const connectionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isConnectionsOpen) return;
    const closeOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !connectionsRef.current?.contains(event.target)) setIsConnectionsOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [isConnectionsOpen]);
  const navigateToNode = (nodeId: string) => {
    setIsConnectionsOpen(false);
    onNavigate(nodeId);
  };
  return (<div className="flex items-center gap-2 mt-1.5 md:mt-0">
    <div className="relative" ref={connectionsRef}>
      {(() => {
        // 연결된 노드들의 타입별 개수 및 목록 계산
        const connectionsByType: Record<
          string,
          Array<{ id: string; label: string; color: string }>
        > = {};
        node.connections.forEach((connId) => {
          const connNode = nodes.find(
            (n) => n.id === connId
          );
          if (connNode) {
            const type = connNode.type;
            if (!connectionsByType[type]) {
              connectionsByType[type] = [];
            }
            connectionsByType[type].push({
              id: connNode.id,
              label: connNode.label,
              color: getThemeColor(
                connNode.color || "#00ffff",
                theme
              ),
            });
          }
        });

        const typeLabels: Record<string, string> = {
          main: t("nodeTypes.main"),
          project: t("nodeTypes.project"),
          skill: t("nodeTypes.skill"),
          lesson: t("nodeTypes.lesson"),
        };

        const typeIcons: Record<string, string> = {
          main: "🏠",
          project: "📁",
          skill: "⚡",
          lesson: "💡",
        };

        // 타입 순서 정의: main → project → skill → lesson
        const typeOrder = ["main", "project", "skill", "lesson"];

        // 데스크톱용 형식: "Main 1, Skill 7"
        const parts = typeOrder
          .filter((type) => connectionsByType[type])
          .map(
            (type) =>
              `${typeLabels[type] || type} ${t(
                "modal.connectionCount",
                { count: connectionsByType[type].length }
              )}`
          )
          .join(", ");

        // 모바일용 형식: "메인 (1), 스킬 (7)"
        const partsMobile = typeOrder
          .filter((type) => connectionsByType[type])
          .map(
            (type) =>
              `${typeLabels[type] || type} (${connectionsByType[type].length
              })`
          )
          .join(", ");

        const totalConnections = node.connections.length;

        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsConnectionsOpen(!isConnectionsOpen);
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                color: isDark
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(0,0,0,0.6)",
                background: isConnectionsOpen
                  ? isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)"
                  : "transparent",
                border: isConnectionsOpen
                  ? `1px solid ${nodeColor}40`
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)";
                e.currentTarget.style.color = isDark
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                if (!isConnectionsOpen) {
                  e.currentTarget.style.background =
                    "transparent";
                  e.currentTarget.style.color = isDark
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(0,0,0,0.6)";
                }
              }}
            >
              <span>🔗</span>
              <span>
                {parts ? (
                  <>
                    {/* 모바일: 축약형 */}
                    <span className="md:hidden">
                      {partsMobile}
                    </span>
                    {/* 데스크톱: 기존 형식 + 연결 */}
                    <span className="hidden md:inline">
                      {parts} {t("modal.connectionsSuffix")}
                    </span>
                  </>
                ) : (
                  t("modal.noConnections")
                )}
              </span>
              {totalConnections > 0 && (
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isConnectionsOpen ? "rotate-180" : ""
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
              )}
            </button>

            {/* 드롭다운 목록 */}
            {isConnectionsOpen && totalConnections > 0 && (
              <div
                className="absolute top-full left-0 mt-2 min-w-[220px] max-h-[300px] overflow-y-auto rounded-xl z-50 custom-scrollbar"
                style={{
                  background: isDark
                    ? "rgba(20, 20, 30, 0.95)"
                    : "rgba(255, 255, 255, 0.98)",
                  backdropFilter: "blur(16px)",
                  border: isDark
                    ? `1px solid ${nodeColor}30`
                    : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: isDark
                    ? `0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${nodeColor}15`
                    : "0 10px 40px rgba(0,0,0,0.15)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {typeOrder
                  .filter((type) => connectionsByType[type])
                  .map((type, groupIndex) => {
                    const nodes = connectionsByType[type];
                    return (
                      <div key={type}>
                        {/* 타입 헤더 */}
                        <div
                          className="px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0"
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,0.4)"
                              : "rgba(0,0,0,0.4)",
                            background: isDark
                              ? "rgba(20, 20, 30, 0.98)"
                              : "rgba(255, 255, 255, 0.98)",
                            borderBottom: isDark
                              ? "1px solid rgba(255,255,255,0.05)"
                              : "1px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          {typeIcons[type] || "📌"}{" "}
                          {typeLabels[type] || type} (
                          {nodes.length})
                        </div>

                        {/* 노드 목록 */}
                        {nodes.map((connNode) => (
                          <button
                            key={connNode.id}
                            onClick={() =>
                              navigateToNode(connNode.id)
                            }
                            className="w-full px-3 py-2.5 flex items-center gap-2.5 text-left transition-all duration-200 cursor-pointer active:scale-[0.98]"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.85)"
                                : "#374151",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `${connNode.color}15`;
                              e.currentTarget.style.paddingLeft =
                                "16px";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "transparent";
                              e.currentTarget.style.paddingLeft =
                                "12px";
                            }}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: connNode.color,
                                boxShadow: `0 0 8px ${connNode.color}60`,
                              }}
                            />
                            <span className="text-sm font-medium truncate">
                              {connNode.label}
                            </span>
                            <svg
                              className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: connNode.color }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        ))}

                        {/* 구분선 */}
                        {groupIndex <
                          typeOrder.filter(
                            (t) => connectionsByType[t]
                          ).length -
                          1 && (
                            <div
                              className="mx-3 my-1"
                              style={{
                                borderBottom: isDark
                                  ? "1px solid rgba(255,255,255,0.08)"
                                  : "1px solid rgba(0,0,0,0.06)",
                              }}
                            />
                          )}
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        );
      })()}
    </div>
  </div>
  );
}
