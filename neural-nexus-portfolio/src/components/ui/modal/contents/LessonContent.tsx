import type { DetailContentProps } from "../types";
import { InlineMarkdown } from "../InlineMarkdown";

export function LessonContent({ details, isDark, nodeColor }: DetailContentProps) {
  return (
    <div className="space-y-6">
      {/* Detailed Learnings (New Format) */}
      {details?.learnings && details.learnings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {details.learnings.map((learning, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl transition-all hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${isDark
                  ? "rgba(234, 179, 8, 0.1)"
                  : "rgba(234, 179, 8, 0.05)"
                  }, transparent)`,
                border: "1px solid rgba(234, 179, 8, 0.2)",
              }}
            >
              <h3 className="text-base font-bold text-yellow-500 mb-2 flex items-center gap-2">
                <span>💡</span> {learning.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                }}
              >
                {<InlineMarkdown text={learning.content} nodeColor={nodeColor} isDark={isDark} {...{
                  codeColor: "#facc15",
                }} />}
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Simple Lesson (Legacy Format)
        details?.lesson && (
          <div
            className="p-5 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05))`,
              border: "1px solid rgba(234, 179, 8, 0.2)",
            }}
          >
            <div className="flex gap-4">
              <div className="text-3xl shrink-0">💡</div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                  핵심 교훈
                </h3>
                <p
                  className="leading-relaxed text-lg italic transition-colors duration-300"
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.85)"
                      : "#374151",
                  }}
                >
                  "{details.lesson}"
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
