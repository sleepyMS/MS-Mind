import type { DetailContentProps } from "../types";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { InlineMarkdown } from "../InlineMarkdown";

export function DescriptionContent({ details, isDark, nodeColor }: DetailContentProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      {/* 설명 */}
      <div
        className="text-base leading-relaxed transition-colors duration-300"
        style={{
          color: isDark ? "rgba(255,255,255,0.85)" : "#374151",
        }}
      >
        <ReactMarkdown
          components={{
            strong: ({ ...props }) => (
              <strong
                style={{ color: nodeColor, fontWeight: 700 }}
                {...props}
              />
            ),
            p: ({ ...props }) => <p {...props} />,
          }}
        >
          {details?.description || "설명이 없습니다."}
        </ReactMarkdown>
      </div>

      {/* 핵심 특징 (Core Features) */}
      {details?.coreFeatures && details.coreFeatures.length > 0 && (
        <div>
          <h3
            className="text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-300"
            style={{
              color: isDark
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.5)",
            }}
          >
            Highlights
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {details.coreFeatures.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm font-medium px-3 py-2 rounded-lg"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  color: isDark ? "rgba(255,255,255,0.9)" : "#1f2937",
                }}
              >
                <span
                  className="shrink-0 mt-[2px]"
                  style={{ color: nodeColor }}
                >
                  ✓
                </span>
                <div className="flex-1 leading-relaxed">
                  {<InlineMarkdown text={feature} nodeColor={nodeColor} isDark={isDark} {...{
                    codeColor: nodeColor,
                    boldCode: true,
                  }} />}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 외부 링크 및 배포 링크 */}
      {(details?.link ||
        details?.deployLink ||
        details?.pdfLink ||
        details?.blogLink) && (
          <div>
            <h3
              className="text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-300"
              style={{
                color: isDark
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(0,0,0,0.5)",
              }}
            >
              {t("modal.linksSection")}
            </h3>
            <div className="flex flex-wrap gap-3">
              {details?.link && (
                <a
                  href={details.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${nodeColor}25, ${nodeColor}10)`,
                    border: `1px solid ${nodeColor}40`,
                    color: nodeColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 25px ${nodeColor}40`;
                    e.currentTarget.style.borderColor = nodeColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = `${nodeColor}40`;
                  }}
                >
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span className="font-medium">
                    {t("modal.viewProject")}
                  </span>
                </a>
              )}

              {details?.deployLink && (
                <a
                  href={details.deployLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${nodeColor} 0%, ${nodeColor}cc 100%)`
                      : `linear-gradient(135deg, ${nodeColor}ee 0%, ${nodeColor} 100%)`,
                    boxShadow: `0 0 20px ${nodeColor}40`,
                    color: "white",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 35px ${nodeColor}80, 0 5px 20px ${nodeColor}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 20px ${nodeColor}40`;
                  }}
                >
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
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
                  <span className="font-bold">
                    {t("modal.links.deploy")}
                  </span>
                </a>
              )}

              {details?.pdfLink && (
                <a
                  href={details.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: isDark
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(239, 68, 68, 0.05)",
                    border: isDark
                      ? "1px solid rgba(239, 68, 68, 0.2)"
                      : "1px solid rgba(239, 68, 68, 0.2)",
                    color: isDark ? "#fca5a5" : "#dc2626",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(239, 68, 68, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(239, 68, 68, 0.05)";
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
                  <span className="font-medium">
                    {t("modal.links.pdf")}
                  </span>
                </a>
              )}

              {details?.blogLink && (
                <a
                  href={details.blogLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))"
                      : "linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.03))",
                    border: isDark
                      ? "1px solid rgba(234, 179, 8, 0.2)"
                      : "1px solid rgba(234, 179, 8, 0.15)",
                    color: isDark ? "#fcd34d" : "#d97706",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 25px rgba(234, 179, 8, 0.2)`;
                    e.currentTarget.style.borderColor =
                      "rgba(234, 179, 8, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = isDark
                      ? "rgba(234, 179, 8, 0.2)"
                      : "rgba(234, 179, 8, 0.15)";
                  }}
                >
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5"
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
                  <span className="font-medium">
                    {t("modal.links.blog")}
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

      {/* 기술 스택 선정 이유 (Tech Stack Docs) - 테이블 형식 */}
      {details?.techStackDocs && details.techStackDocs.length > 0 ? (
        <div>
          <h3
            className="text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-300"
            style={{
              color: isDark
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.5)",
            }}
          >
            {t("modal.techStackDecisions")}
          </h3>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: isDark
                ? `1px solid ${nodeColor}20`
                : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${nodeColor}15, ${nodeColor}08)`
                      : `linear-gradient(135deg, ${nodeColor}08, ${nodeColor}04)`,
                  }}
                >
                  <th
                    className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: nodeColor,
                      width: "140px",
                      borderBottom: isDark
                        ? `1px solid ${nodeColor}20`
                        : `1px solid ${nodeColor}15`,
                    }}
                  >
                    {t("modal.techColumn")}
                  </th>
                  <th
                    className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.5)",
                      borderBottom: isDark
                        ? `1px solid ${nodeColor}20`
                        : `1px solid ${nodeColor}15`,
                    }}
                  >
                    {t("modal.reasonColumn")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.techStackDocs.map((tech, idx) => (
                  <tr
                    key={tech.name}
                    className="transition-all duration-200 hover:bg-opacity-50"
                    style={{
                      background:
                        idx % 2 === 0
                          ? "transparent"
                          : isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.015)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${nodeColor}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        idx % 2 === 0
                          ? "transparent"
                          : isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.015)";
                    }}
                  >
                    <td
                      className="px-4 py-3 font-bold text-sm"
                      style={{
                        color: nodeColor,
                        borderBottom:
                          idx ===
                            (details.techStackDocs?.length || 0) - 1
                            ? "none"
                            : isDark
                              ? "1px solid rgba(255,255,255,0.05)"
                              : "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      {tech.name}
                    </td>
                    <td
                      className="px-4 py-3 text-sm leading-relaxed"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.75)"
                          : "#4b5563",
                        borderBottom:
                          idx ===
                            (details.techStackDocs?.length || 0) - 1
                            ? "none"
                            : isDark
                              ? "1px solid rgba(255,255,255,0.05)"
                              : "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      {tech.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Fallback to simple tag list if no detailed docs
        details?.technologies &&
        details.technologies.length > 0 && (
          <div>
            <h3
              className="text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-300"
              style={{
                color: isDark
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(0,0,0,0.5)",
              }}
            >
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {details.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 text-sm rounded-lg transition-all duration-300 hover:scale-105 cursor-default"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.05)",
                    border: `1px solid ${nodeColor}30`,
                    color: nodeColor,
                    fontWeight: 500,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
