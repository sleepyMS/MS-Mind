import type { DetailContentProps } from "../types";
import { InlineMarkdown } from "../InlineMarkdown";

export function OptimizationsContent({ details, isDark, nodeColor }: DetailContentProps) {
  if (!details?.optimizations) return null;
  return (
    <div className="space-y-4">
      {details.optimizations.map((opt, idx) => (
        <div
          key={idx}
          className="rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
          style={{
            background: isDark
              ? "rgba(139, 92, 246, 0.05)"
              : "rgba(139, 92, 246, 0.03)",
            border: isDark
              ? "1px solid rgba(139, 92, 246, 0.2)"
              : "1px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          {/* 헤더 */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))"
                : "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.03))",
              borderBottom: isDark
                ? "1px solid rgba(139, 92, 246, 0.15)"
                : "1px solid rgba(139, 92, 246, 0.1)",
            }}
          >
            <span
              className="flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold"
              style={{
                background: "rgba(139, 92, 246, 0.2)",
                color: "#a78bfa",
              }}
            >
              ⚡
            </span>
            <h3
              className="font-bold text-base"
              style={{ color: isDark ? "#c4b5fd" : "#7c3aed" }}
            >
              {opt.title}
            </h3>
          </div>

          {/* 내용 - 테이블 형식 */}
          <div className="py-2">
            {opt.items.map((item, i) => {
              // 성능 향상 수치 감지 (예: "45초 → 0.8초", "98%", "90%")
              const hasMetric =
                /(\d+[초s%]|\d+\.\d+[초s%]|→|->)/.test(item);

              return (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-2"
                  style={{
                    background:
                      i % 2 === 1
                        ? isDark
                          ? "rgba(139, 92, 246, 0.08)"
                          : "rgba(139, 92, 246, 0.05)"
                        : "transparent",
                  }}
                >
                  <span
                    className="shrink-0 flex items-center justify-center"
                    style={{ width: "20px", height: "20px" }}
                  >
                    {hasMetric ? (
                      <span className="text-sm">📈</span>
                    ) : (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "rgba(139, 92, 246, 0.5)",
                        }}
                      />
                    )}
                  </span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{
                      color: hasMetric
                        ? isDark
                          ? "rgba(255,255,255,0.95)"
                          : "#1f2937"
                        : isDark
                          ? "rgba(255,255,255,0.75)"
                          : "#4b5563",
                      fontWeight: hasMetric ? 500 : 400,
                    }}
                  >
                    {<InlineMarkdown text={item} nodeColor={nodeColor} isDark={isDark} {...{
                      codeColor: "#a78bfa",
                    }} />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
