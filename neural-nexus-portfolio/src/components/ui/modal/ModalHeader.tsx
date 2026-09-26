import { useTranslation } from "react-i18next";
import type { NeuralNode, ThemeType } from "../../../types";
import { ModalConnections } from "./ModalConnections";
import { MiniTooltip } from "../MiniTooltip";

interface ModalHeaderProps {
  node: NeuralNode;
  nodes: readonly NeuralNode[];
  theme: ThemeType;
  nodeColor: string;
  onNavigate: (nodeId: string) => void;
  onClose: () => void;
}

export function ModalHeader({ node, nodes, theme, nodeColor, onNavigate, onClose }: ModalHeaderProps) {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const details = node.details;
  return (<div className="relative p-6 pb-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* 노드 아이콘 - 모바일에서 숨김 */}
        <div
          className="hidden md:flex relative w-14 h-14 rounded-2xl items-center justify-center shrink-0"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${nodeColor}40, ${nodeColor}20)`
              : `linear-gradient(135deg, ${nodeColor}20, ${nodeColor}10)`,
            border: isDark
              ? `1px solid ${nodeColor}50`
              : `1px solid ${nodeColor}30`,
            boxShadow: `0 0 30px ${nodeColor}30`,
          }}
        >
          <div
            className="w-4 h-4 rounded-full animate-pulse"
            style={{ backgroundColor: nodeColor }}
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* 모바일: 뱃지가 타이틀 위에 */}
          <div className="flex md:hidden items-center gap-2 mb-1">
            <span
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: `${nodeColor}20`,
                color: nodeColor,
                border: `1px solid ${nodeColor}40`,
              }}
            >
              {node.type}
            </span>
          </div>

          {/* 타이틀 + 링크 아이콘들 */}
          <div className="flex items-center gap-2 min-w-0">
            {/* 제목 */}
            {details?.link ? (
              <MiniTooltip content={t("modal.links.github")}>
                <a
                  href={details.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="group/title flex items-center gap-2 transition-all duration-300 min-w-0"
                  style={{ color: isDark ? "white" : "#1f2937" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = nodeColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isDark
                      ? "white"
                      : "#1f2937";
                  }}
                >
                  <h2 className="text-base md:text-2xl font-bold tracking-tight leading-tight truncate overflow-hidden">
                    {node.label}
                  </h2>
                  {/* GitHub 아이콘 - 데스크톱에서만 (링크 안에) */}
                  <svg
                    className="hidden md:block w-5 h-5 opacity-50 group-hover/title:opacity-100 transition-all duration-300 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </MiniTooltip>
            ) : (
              <h2
                className="text-base md:text-2xl font-bold tracking-tight leading-tight transition-colors duration-300 truncate overflow-hidden"
                style={{ color: isDark ? "white" : "#1f2937" }}
              >
                {node.label}
              </h2>
            )}

            {/* 모바일: 타이틀 옆에 GitHub/배포/PDF 아이콘 */}
            <div className="flex md:hidden items-center shrink-0">
              {/* GitHub 아이콘 */}
              {details?.link && (
                <>
                  <a
                    href={details.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-lg transition-all duration-300"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.4)",
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </>
              )}
              {/* 배포 링크 아이콘 */}
              {details?.deployLink && (
                <>
                  <span
                    className={`mx-0.5 text-xs ${isDark ? "text-white/20" : "text-black/10"
                      }`}
                  >
                    /
                  </span>
                  <a
                    href={details.deployLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-lg transition-all duration-300"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.4)",
                    }}
                  >
                    <svg
                      className="w-4 h-4"
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
                  </a>
                </>
              )}
              {/* PDF 링크 아이콘 */}
              {details?.pdfLink && (
                <>
                  <span
                    className={`mx-0.5 text-xs ${isDark ? "text-white/20" : "text-black/10"
                      }`}
                  >
                    /
                  </span>
                  <a
                    href={details.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-lg transition-all duration-300"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.4)",
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </a>
                </>
              )}
              {/* Blog Link Icon */}
              {details?.blogLink && (
                <>
                  <span
                    className={`mx-0.5 text-xs ${isDark ? "text-white/20" : "text-black/10"
                      }`}
                  >
                    /
                  </span>
                  <a
                    href={details.blogLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-lg transition-all duration-300"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.4)",
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </a>
                </>
              )}
            </div>

            {/* 데스크톱: 배포/PDF 링크 아이콘 */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {/* 배포 링크 아이콘 */}
              {details?.deployLink && (
                <>
                  <span
                    className={`mx-1 ${isDark ? "text-white/20" : "text-black/10"
                      }`}
                  >
                    /
                  </span>
                  <MiniTooltip content={t("modal.links.deploy")}>
                    <a
                      href={details.deployLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 block"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.4)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = nodeColor;
                        e.currentTarget.style.background = `${nodeColor}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.4)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <svg
                        className="w-5 h-5"
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
                    </a>
                  </MiniTooltip>
                </>
              )}

              {/* PDF 링크 아이콘 */}
              {details?.pdfLink && (
                <>
                  <span
                    className={`mx-1 ${isDark ? "text-white/20" : "text-black/10"
                      }`}
                  >
                    /
                  </span>
                  <MiniTooltip content={t("modal.links.pdf")}>
                    <a
                      href={details.pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 block"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.4)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = nodeColor;
                        e.currentTarget.style.background = `${nodeColor}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.4)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </a>
                  </MiniTooltip>
                </>
              )}
              {/* Blog Link Icon */}
              {details?.blogLink && (
                <>
                  <span
                    className={`mx-1 ${isDark ? "text-white/20" : "text-black/10"
                      }`}
                  >
                    /
                  </span>
                  <MiniTooltip content={t("modal.links.blog")}>
                    <a
                      href={details.blogLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 block"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.4)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = nodeColor;
                        e.currentTarget.style.background = `${nodeColor}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isDark
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.4)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </a>
                  </MiniTooltip>
                </>
              )}
            </div>
          </div>

          {/* 데스크톱: 뱃지가 타이틀 아래에 */}
          <div className="hidden md:flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: `${nodeColor}20`,
                color: nodeColor,
                border: `1px solid ${nodeColor}40`,
              }}
            >
              {node.type}
            </span>
          </div>

          {/* 연결 노드 드롭다운 - 모바일/데스크톱 모두 표시 */}
          <ModalConnections node={node} nodes={nodes} theme={theme} nodeColor={nodeColor} onNavigate={onNavigate} />
        </div>
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="group p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shrink-0 cursor-pointer"
        style={{
          background: isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)",
          border: isDark
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.05)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark
            ? "rgba(255, 100, 100, 0.2)"
            : "rgba(255, 100, 100, 0.15)";
          e.currentTarget.style.borderColor = "rgba(255, 100, 100, 0.4)";
          e.currentTarget.style.boxShadow =
            "0 0 20px rgba(255, 100, 100, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)";
          e.currentTarget.style.borderColor = isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)";
          e.currentTarget.style.boxShadow = "none";
        }}
        aria-label={t("modal.aria.close")}
      >
        <svg
          className="w-5 h-5 transition-all duration-300 group-hover:rotate-90"
          style={{
            color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>

  );
}
