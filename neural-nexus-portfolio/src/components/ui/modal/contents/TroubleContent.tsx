import type { DetailContentProps } from "../types";
import { InlineMarkdown } from "../InlineMarkdown";

export function TroubleContent({ details, isDark, nodeColor }: DetailContentProps) {
  return (
    <div className="space-y-6">
      {/* Detailed Challenges - 테이블 형식 */}
      {details?.challenges && details.challenges.length > 0 ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.2)"
              : "1px solid rgba(239, 68, 68, 0.15)",
          }}
        >
          {details.challenges.map((challenge, idx) => (
            <div
              key={idx}
              className="border-b last:border-b-0"
              style={{
                borderColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              {/* 이슈 제목 헤더 */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{
                  background: isDark
                    ? "rgba(239, 68, 68, 0.08)"
                    : "rgba(239, 68, 68, 0.05)",
                }}
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    color: isDark ? "#f87171" : "#dc2626",
                  }}
                >
                  {idx + 1}
                </span>
                <h3
                  className="font-bold text-sm"
                  style={{ color: isDark ? "#f87171" : "#dc2626" }}
                >
                  {challenge.title}
                </h3>
              </div>

              {/* 문제/해결 테이블 */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* 문제 셀 */}
                <div
                  className="px-4 py-3"
                  style={{
                    background: isDark
                      ? "rgba(239, 68, 68, 0.03)"
                      : "rgba(239, 68, 68, 0.02)",
                    borderRight: isDark
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-500">❌</span>
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{
                        color: isDark ? "#f87171" : "#dc2626",
                      }}
                    >
                      Challenge
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.7)"
                        : "#4b5563",
                    }}
                  >
                    {<InlineMarkdown text={challenge.problem} nodeColor={nodeColor} isDark={isDark} {...{
                      codeColor: "#f87171",
                    }} />}
                  </p>
                </div>

                {/* 해결 셀 */}
                <div
                  className="px-4 py-3"
                  style={{
                    background: isDark
                      ? "rgba(34, 197, 94, 0.03)"
                      : "rgba(34, 197, 94, 0.02)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500">✅</span>
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{
                        color: isDark ? "#4ade80" : "#16a34a",
                      }}
                    >
                      Solution
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.9)"
                        : "#1f2937",
                    }}
                  >
                    {<InlineMarkdown text={challenge.solution} nodeColor={nodeColor} isDark={isDark} {...{
                      codeColor: "#4ade80",
                    }} />}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Simple Trouble/Shooting (Legacy format)
        <>
          {details?.trouble && (
            <div className="relative pl-5 border-l-2 border-red-400/50">
              <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-sm">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                겪은 어려움
              </h3>
              <p
                className="leading-relaxed transition-colors duration-300"
                style={{
                  color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                }}
              >
                {details.trouble}
              </p>
            </div>
          )}

          {details?.shooting && (
            <div className="relative pl-5 border-l-2 border-green-400/50">
              <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-sm">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                해결 과정
              </h3>
              <p
                className="leading-relaxed transition-colors duration-300"
                style={{
                  color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                }}
              >
                {details.shooting}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
