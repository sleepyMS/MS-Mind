import type { DetailContentProps } from "../types";
import { useTranslation } from "react-i18next";

export function CodeContent({ details, isDark, nodeColor }: DetailContentProps) {
  const { t } = useTranslation();
  if (!details?.codeExamples) return null;
  return (
    <div className="space-y-6">
      {details.codeExamples.map((example, idx) => {
        const categoryColors: Record<string, string> = {
          architecture: "#8b5cf6",
          async: "#06b6d4",
          database: "#f59e0b",
          business: "#10b981",
          realtime: "#ec4899",
          optimization: "#3b82f6",
          performance: "#6366f1",
          troubleshooting: "#ef4444",
          analytics: "#14b8a6",
          auth: "#f97316",
          "state-management": "#8b5cf6",
        };
        const categoryLabels: Record<string, string> = {
          architecture: t("categories.code.architecture"),
          async: t("categories.code.async"),
          database: t("categories.code.database"),
          business: t("categories.code.business"),
          realtime: t("categories.code.realtime"),
          optimization: t("categories.code.optimization"),
          performance: t("categories.code.performance"),
          troubleshooting: t("categories.code.troubleshooting"),
          analytics: t("categories.code.analytics"),
          auth: t("categories.code.auth"),
          "state-management": t("categories.code.state-management"),
        };
        const color = categoryColors[example.category] || nodeColor;

        return (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
            style={{
              background: isDark
                ? "rgba(0, 0, 0, 0.3)"
                : "rgba(255, 255, 255, 0.8)",
              border: `1px solid ${color}30`,
              boxShadow: isDark
                ? `0 4px 20px rgba(0,0,0,0.3), 0 0 1px ${color}30`
                : `0 4px 20px rgba(0,0,0,0.05)`,
            }}
          >
            {/* 헤더 */}
            <div
              className="px-4 py-3 flex items-start justify-between gap-3"
              style={{
                background: isDark
                  ? `linear-gradient(135deg, ${color}15, transparent)`
                  : `linear-gradient(135deg, ${color}10, transparent)`,
                borderBottom: `1px solid ${color}20`,
              }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    {categoryLabels[example.category] ||
                      example.category}
                  </span>
                  <span
                    className="text-xs font-mono opacity-60"
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                  >
                    {example.filePath}
                  </span>
                </div>
                <h3
                  className="text-base font-bold"
                  style={{ color: isDark ? "white" : "#1f2937" }}
                >
                  {example.title}
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(0,0,0,0.6)",
                  }}
                >
                  {example.description}
                </p>
              </div>
              {example.githubLink && (
                <a
                  href={example.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-1.5 rounded-lg transition-all hover:scale-110"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: isDark ? "white" : "#1f2937" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              )}
            </div>

            {/* 코드 블록 */}
            <div
              className="p-4 overflow-x-auto custom-scrollbar"
              style={{
                background: isDark
                  ? "rgba(0, 0, 0, 0.4)"
                  : "rgba(30, 41, 59, 0.95)",
              }}
            >
              <pre
                className="text-xs font-mono leading-relaxed"
                style={{
                  color: isDark ? "#e2e8f0" : "#e2e8f0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <code>
                  {example.snippet
                    .split("\n")
                    .map((line, lineIdx) => {
                      // 향상된 구문 강조 함수
                      const highlightCode = (code: string) => {
                        // 주석 처리
                        if (
                          code.trim().startsWith("//") ||
                          code.trim().startsWith("#")
                        ) {
                          return (
                            <span
                              style={{
                                color: "#6b7280",
                                fontStyle: "italic",
                              }}
                            >
                              {code}
                            </span>
                          );
                        }

                        // 토큰화 정규식
                        const tokenRegex =
                          /(\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|\b(?:const|let|var|function|return|if|else|async|await|import|export|from|default|class|extends|new|this|try|catch|throw|finally|for|while|do|switch|case|break|continue|typeof|instanceof|in|of|true|false|null|undefined|void)\b|<\/?[A-Z][a-zA-Z0-9]*|<\/?[a-z][a-zA-Z0-9-]*|\b(?:use[A-Z][a-zA-Z]*|set[A-Z][a-zA-Z]*|get[A-Z][a-zA-Z]*)\b|\b[A-Z][a-zA-Z0-9]*(?=\s*[(:])|\b[a-z][a-zA-Z0-9]*(?=\s*\()|\{|\}|\(|\)|=>|\.\.\.|\?\.)/gm;

                        const parts = [];
                        let lastIndex = 0;
                        let match;

                        while (
                          (match = tokenRegex.exec(code)) !== null
                        ) {
                          // 앞의 텍스트
                          if (match.index > lastIndex) {
                            parts.push(
                              <span key={`t-${lastIndex}`}>
                                {code.slice(lastIndex, match.index)}
                              </span>
                            );
                          }

                          const token = match[0];
                          let color = "#e2e8f0"; // 기본
                          let fontWeight = "normal";

                          // 색상 결정
                          if (
                            token.startsWith("//") ||
                            token.startsWith("#")
                          ) {
                            color = "#6b7280"; // 주석
                          } else if (
                            token.startsWith("'") ||
                            token.startsWith('"') ||
                            token.startsWith("`")
                          ) {
                            color = "#a5d6a7"; // 문자열 (연두색)
                          } else if (
                            [
                              "const",
                              "let",
                              "var",
                              "function",
                              "class",
                              "extends",
                              "new",
                              "import",
                              "export",
                              "from",
                              "default",
                            ].includes(token)
                          ) {
                            color = "#c084fc"; // 키워드 (보라색)
                            fontWeight = "500";
                          } else if (
                            [
                              "return",
                              "if",
                              "else",
                              "for",
                              "while",
                              "do",
                              "switch",
                              "case",
                              "break",
                              "continue",
                              "try",
                              "catch",
                              "throw",
                              "finally",
                            ].includes(token)
                          ) {
                            color = "#f472b6"; // 제어문 (분홍색)
                          } else if (
                            ["async", "await"].includes(token)
                          ) {
                            color = "#fb923c"; // 비동기 (오렌지)
                            fontWeight = "600";
                          } else if (
                            [
                              "true",
                              "false",
                              "null",
                              "undefined",
                              "void",
                              "this",
                            ].includes(token)
                          ) {
                            color = "#fbbf24"; // 리터럴 (노랑)
                          } else if (
                            token.startsWith("<") &&
                            token.length > 1
                          ) {
                            color = "#60a5fa"; // JSX 태그 (파랑)
                          } else if (
                            token.startsWith("use") ||
                            token.startsWith("set") ||
                            token.startsWith("get")
                          ) {
                            color = "#22d3ee"; // React Hooks (시안)
                          } else if (/^[A-Z]/.test(token)) {
                            color = "#4ade80"; // 컴포넌트/클래스 (초록)
                          } else if (/^[a-z].*\(/.test(token + "(")) {
                            color = "#93c5fd"; // 함수 호출 (연파랑)
                          } else if (
                            ["=>", "...", "?."].includes(token)
                          ) {
                            color = "#f472b6"; // 연산자 (분홍)
                          } else if (
                            ["{", "}", "(", ")"].includes(token)
                          ) {
                            color = "#fcd34d"; // 괄호 (노랑)
                          }

                          parts.push(
                            <span
                              key={`m-${match.index}`}
                              style={{ color, fontWeight }}
                            >
                              {token}
                            </span>
                          );

                          lastIndex = match.index + token.length;
                        }

                        // 남은 텍스트
                        if (lastIndex < code.length) {
                          parts.push(
                            <span key={`e-${lastIndex}`}>
                              {code.slice(lastIndex)}
                            </span>
                          );
                        }

                        return parts.length > 0 ? parts : code;
                      };

                      return (
                        <div
                          key={lineIdx}
                          className="hover:bg-white/5 px-1 -mx-1 rounded"
                        >
                          <span
                            className="select-none opacity-40 mr-3 inline-block w-4 text-right"
                            style={{ color: "#64748b" }}
                          >
                            {lineIdx + 1}
                          </span>
                          {highlightCode(line)}
                        </div>
                      );
                    })}
                </code>
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
